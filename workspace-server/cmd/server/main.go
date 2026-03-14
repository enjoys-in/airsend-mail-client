package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"

	"github.com/AirSend/workspace-server/internal/cache"
	"github.com/AirSend/workspace-server/internal/config"
	"github.com/AirSend/workspace-server/internal/database"
	"github.com/AirSend/workspace-server/internal/flush"
	"github.com/AirSend/workspace-server/internal/handlers"
	"github.com/AirSend/workspace-server/internal/msgbuffer"
	"github.com/AirSend/workspace-server/internal/permissions"
	"github.com/AirSend/workspace-server/internal/repository"
	"github.com/AirSend/workspace-server/internal/router"
	"github.com/AirSend/workspace-server/internal/service"
	"github.com/AirSend/workspace-server/internal/streaming"
	"github.com/AirSend/workspace-server/internal/worker"
	"github.com/AirSend/workspace-server/internal/ws"
)

func main() {
	// ── Load config ──
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	// ── Connect to PostgreSQL ──
	if err := database.Connect(cfg.DB.DSN); err != nil {
		log.Fatalf("database: %v", err)
	}
	defer database.Close()

	// ── Run migrations ──
	if err := database.RunMigrations("migrations"); err != nil {
		log.Fatalf("migrations: %v", err)
	}

	// ── Init legacy cache (for backward compat) ──
	cache.Init(cfg.Cache.TTLSeconds)

	// ── Redis Streams (optional — skip if no REDIS_ADDR) ──
	var stream *streaming.RedisStream
	if cfg.Redis.Addr != "" {
		s, err := streaming.NewRedisStream(cfg.Redis.Addr, cfg.Redis.Password, cfg.Redis.DB)
		if err != nil {
			log.Printf("[warn] redis: %v — running without streams", err)
		} else {
			stream = s
			defer stream.Close()
		}
	}

	// ── WebSocket Hub ──
	hub := ws.NewHub()
	go hub.Run()

	// ── PebbleDB message buffer ──
	pebbleDir := getEnv("PEBBLE_DIR", "data/pebble-msgbuf")
	msgBuf, err := msgbuffer.Open(pebbleDir)
	if err != nil {
		log.Fatalf("pebble: %v", err)
	}
	defer msgBuf.Close()
	log.Printf("pebble message buffer opened at %s", pebbleDir)

	// ── Flush worker context ──
	flushCtx, flushCancel := context.WithCancel(context.Background())
	defer flushCancel()

	// Start periodic flusher (PebbleDB → PostgreSQL every 2s)
	flushInterval := 2 * time.Second
	flush.StartPeriodicFlusher(flushCtx, msgBuf, database.Pool, flushInterval)

	// ── Build dependency graph ──
	cacheSvc := cache.NewCacheService(database.Pool, cfg.Cache.TTLSeconds)
	fga := permissions.NewFGA(database.Pool)

	deps := &service.Deps{
		Teams:       repository.NewTeamRepo(database.Pool),
		Channels:    repository.NewChannelRepo(database.Pool),
		Messages:    repository.NewMessageRepo(database.Pool),
		Members:     repository.NewMemberRepo(database.Pool),
		DMs:         repository.NewDMRepo(database.Pool),
		Events:      repository.NewEventRepo(database.Pool),
		Webhooks:    repository.NewWebhookRepo(database.Pool),
		Invitations: repository.NewInvitationRepo(database.Pool),
		Polls:       repository.NewPollRepo(database.Pool),
		Attachments: repository.NewAttachmentRepo(database.Pool),
		Voice:       repository.NewVoiceRepo(database.Pool),
		Cache:       cacheSvc,
		Stream:      stream,
		Hub:         hub,
		Permissions: fga,
		MsgBuffer:   msgBuf,
	}

	// ── Services ──
	teamSvc := service.NewTeamService(deps)
	channelSvc := service.NewChannelService(deps)
	messageSvc := service.NewMessageService(deps)
	memberSvc := service.NewMemberService(deps)
	dmSvc := service.NewDMService(deps)
	eventSvc := service.NewEventService(deps)
	webhookSvc := service.NewWebhookService(deps)
	invitationSvc := service.NewInvitationService(deps)
	pollSvc := service.NewPollService(deps)
	attachmentSvc := service.NewAttachmentService(deps)
	voiceSvc := service.NewVoiceService(deps)

	// ── Handlers ──
	h := handlers.NewHandler(teamSvc, channelSvc, messageSvc, memberSvc, dmSvc, eventSvc, webhookSvc, invitationSvc, pollSvc, attachmentSvc, voiceSvc)

	// ── Background workers ──
	workerMgr := worker.NewManager(database.Pool)
	go workerMgr.Start()

	// ── Fiber app ──
	app := fiber.New(fiber.Config{
		AppName:      "AirSend Workspace Server",
		BodyLimit:    10 * 1024 * 1024, // 10 MB
		ServerHeader: "AirSend",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"result":  nil,
				"message": err.Error(),
				"error":   err.Error(),
			})
		},
	})

	// ── Middleware ──
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "${time} | ${status} | ${latency} | ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization, X-User-Email",
	}))

	// ── Routes ──
	router.Setup(app, h, hub)

	// ── Health ──
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	// ── Graceful shutdown ──
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	go func() {
		if err := app.Listen(addr); err != nil {
			log.Fatalf("listen: %v", err)
		}
	}()

	log.Printf("workspace server listening on %s", addr)
	<-quit
	log.Println("shutting down...")
	flushCancel() // stop flush worker + final drain
	workerMgr.Stop()
	_ = app.Shutdown()
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
