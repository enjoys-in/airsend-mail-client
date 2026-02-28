package ws

import (
	"encoding/json"
	"log"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

// ═══════════════════════════════════════════════════════════════════════════
// WebSocket Handler — Fiber upgrade + read loop
// ═══════════════════════════════════════════════════════════════════════════

// UpgradeMiddleware checks if the request is upgradeable to WebSocket.
func UpgradeMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	}
}

// Handler returns a WebSocket handler that registers clients with the hub.
// incomingHandler is called for every incoming WS message (for typing events, etc.).
func Handler(hub *Hub, incomingHandler func(client *Client, msgType string, payload json.RawMessage)) fiber.Handler {
	return websocket.New(func(conn *websocket.Conn) {
		email := conn.Query("email", "")
		if email == "" {
			email = conn.Headers("X-User-Email")
		}
		if email == "" {
			log.Println("[ws] no email in query or header, closing connection")
			conn.Close()
			return
		}

		client := &Client{
			Conn:     conn,
			Email:    email,
			Channels: make(map[string]bool),
			TeamIDs:  make(map[string]bool),
		}

		hub.Register(client)
		defer hub.Unregister(client)

		// Read loop
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
					break
				}
				log.Printf("[ws] read error from %s: %v", email, err)
				break
			}

			// Parse incoming message
			var incoming struct {
				Type    string          `json:"type"`
				Payload json.RawMessage `json:"payload"`
			}
			if err := json.Unmarshal(msg, &incoming); err != nil {
				log.Printf("[ws] invalid message from %s: %v", email, err)
				continue
			}

			// Handle built-in types
			switch incoming.Type {
			case "subscribe.channel":
				var sub struct {
					ChannelID string `json:"channel_id"`
				}
				if json.Unmarshal(incoming.Payload, &sub) == nil && sub.ChannelID != "" {
					client.mu.Lock()
					client.Channels[sub.ChannelID] = true
					client.mu.Unlock()
				}

			case "unsubscribe.channel":
				var sub struct {
					ChannelID string `json:"channel_id"`
				}
				if json.Unmarshal(incoming.Payload, &sub) == nil {
					client.mu.Lock()
					delete(client.Channels, sub.ChannelID)
					client.mu.Unlock()
				}

			case "subscribe.team":
				var sub struct {
					TeamID string `json:"team_id"`
				}
				if json.Unmarshal(incoming.Payload, &sub) == nil && sub.TeamID != "" {
					client.mu.Lock()
					client.TeamIDs[sub.TeamID] = true
					client.mu.Unlock()
				}

			case "unsubscribe.team":
				var sub struct {
					TeamID string `json:"team_id"`
				}
				if json.Unmarshal(incoming.Payload, &sub) == nil {
					client.mu.Lock()
					delete(client.TeamIDs, sub.TeamID)
					client.mu.Unlock()
				}

			case "ping":
				client.Send([]byte(`{"event":"pong"}`))

			default:
				if incomingHandler != nil {
					incomingHandler(client, incoming.Type, incoming.Payload)
				}
			}
		}
	})
}
