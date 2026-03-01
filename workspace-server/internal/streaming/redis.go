package streaming

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
)

// ═══════════════════════════════════════════════════════════════════════════
// Redis Streams — pub/sub for real-time message & event streaming
// ═══════════════════════════════════════════════════════════════════════════

// Stream names
const (
	StreamMessages      = "workspace:messages"
	StreamEvents        = "workspace:events"
	StreamNotifications = "workspace:notifications"
	StreamWebhooks      = "workspace:webhooks"
	StreamPresence      = "workspace:presence"
)

// RedisStream wraps go-redis for stream operations.
type RedisStream struct {
	client *redis.Client
}

// NewRedisStream creates a new Redis stream client.
func NewRedisStream(addr, password string, db int) (*RedisStream, error) {
	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
		PoolSize:     20,
		MinIdleConns: 5,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis ping: %w", err)
	}

	log.Println("[redis] connected to Redis")
	return &RedisStream{client: client}, nil
}

// Close closes the Redis connection.
func (r *RedisStream) Close() error {
	return r.client.Close()
}

// Client returns the underlying redis client for other uses.
func (r *RedisStream) Client() *redis.Client {
	return r.client
}

// ── Publishing ──

// Publish adds a message to a Redis stream.
func (r *RedisStream) Publish(ctx context.Context, stream string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("marshal payload: %w", err)
	}

	_, err = r.client.XAdd(ctx, &redis.XAddArgs{
		Stream: stream,
		MaxLen: 10000, // cap stream length (approx)
		Approx: true,
		Values: map[string]interface{}{
			"data":      string(data),
			"timestamp": time.Now().UnixMilli(),
		},
	}).Result()
	if err != nil {
		return fmt.Errorf("xadd %s: %w", stream, err)
	}
	return nil
}

// PublishMessage is a convenience method for channel messages.
func (r *RedisStream) PublishMessage(ctx context.Context, channelID string, event string, payload interface{}) error {
	msg := map[string]interface{}{
		"event":      event,
		"channel_id": channelID,
		"payload":    payload,
	}
	return r.Publish(ctx, StreamMessages, msg)
}

// PublishNotification pushes a notification event.
func (r *RedisStream) PublishNotification(ctx context.Context, recipientEmail string, payload interface{}) error {
	msg := map[string]interface{}{
		"event":     "notification",
		"recipient": recipientEmail,
		"payload":   payload,
	}
	return r.Publish(ctx, StreamNotifications, msg)
}

// ── Subscribing ──

// Subscribe reads from a consumer group. handler is called for each message.
// This blocks — run in a goroutine.
func (r *RedisStream) Subscribe(
	ctx context.Context,
	stream, group, consumer string,
	handler func(id string, values map[string]interface{}),
) error {
	// Ensure consumer group exists
	if err := r.ensureGroup(ctx, stream, group); err != nil {
		return err
	}

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		results, err := r.client.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    group,
			Consumer: consumer,
			Streams:  []string{stream, ">"},
			Count:    10,
			Block:    2 * time.Second,
		}).Result()
		if err != nil {
			if err == redis.Nil {
				continue
			}
			log.Printf("[redis] xreadgroup error on %s: %v", stream, err)
			time.Sleep(time.Second) // backoff
			continue
		}

		for _, result := range results {
			for _, msg := range result.Messages {
				handler(msg.ID, msg.Values)

				// Acknowledge message
				r.client.XAck(ctx, stream, group, msg.ID)
			}
		}
	}
}

func (r *RedisStream) ensureGroup(ctx context.Context, stream, group string) error {
	// Create stream + group if not exists; ignore BUSYGROUP error
	_, err := r.client.XGroupCreateMkStream(ctx, stream, group, "0").Result()
	if err != nil {
		// BUSYGROUP means group already exists = OK
		if err.Error() != "BUSYGROUP Consumer Group name already exists" {
			return fmt.Errorf("xgroup create %s/%s: %w", stream, group, err)
		}
	}
	return nil
}

// ── Pub/Sub (for simpler broadcasts like presence) ──

// PubSubPublish publishes to a Redis Pub/Sub channel.
func (r *RedisStream) PubSubPublish(ctx context.Context, channel string, payload interface{}) error {
	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	return r.client.Publish(ctx, channel, string(data)).Err()
}

// PubSubSubscribe subscribes to a Redis Pub/Sub channel.
func (r *RedisStream) PubSubSubscribe(ctx context.Context, channel string, handler func(msg string)) {
	sub := r.client.Subscribe(ctx, channel)
	ch := sub.Channel()

	go func() {
		defer sub.Close()
		for {
			select {
			case <-ctx.Done():
				return
			case msg, ok := <-ch:
				if !ok {
					return
				}
				handler(msg.Payload)
			}
		}
	}()
}
