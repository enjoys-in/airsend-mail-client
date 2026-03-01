package ws

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/AirSend/workspace-server/internal/models"
	"github.com/gofiber/contrib/websocket"
)

// ═══════════════════════════════════════════════════════════════════════════
// WebSocket Hub — manages connections and broadcasts
// ═══════════════════════════════════════════════════════════════════════════

// Client represents a single WebSocket connection.
type Client struct {
	Conn     *websocket.Conn
	Email    string
	Channels map[string]bool // subscribed channelIDs
	TeamIDs  map[string]bool // subscribed teamIDs
	mu       sync.Mutex
}

func (c *Client) Send(msg []byte) {
	c.mu.Lock()
	defer c.mu.Unlock()
	if err := c.Conn.WriteMessage(websocket.TextMessage, msg); err != nil {
		log.Printf("[ws] send error to %s: %v", c.Email, err)
	}
}

// Hub manages all WebSocket clients.
type Hub struct {
	clients    map[string]map[*Client]bool // email → set of clients
	mu         sync.RWMutex
	register   chan *Client
	unregister chan *Client
}

// NewHub creates a new WebSocket hub.
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
	}
}

// Run starts the hub event loop. Call in a goroutine.
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.Email]; !ok {
				h.clients[client.Email] = make(map[*Client]bool)
			}
			h.clients[client.Email][client] = true
			h.mu.Unlock()
			log.Printf("[ws] client connected: %s (total for user: %d)", client.Email, len(h.clients[client.Email]))

		case client := <-h.unregister:
			h.mu.Lock()
			if conns, ok := h.clients[client.Email]; ok {
				delete(conns, client)
				if len(conns) == 0 {
					delete(h.clients, client.Email)
				}
			}
			h.mu.Unlock()
			log.Printf("[ws] client disconnected: %s", client.Email)
		}
	}
}

// Register adds a client to the hub.
func (h *Hub) Register(c *Client) {
	h.register <- c
}

// Unregister removes a client from the hub.
func (h *Hub) Unregister(c *Client) {
	h.unregister <- c
}

// ── Targeted Sends ──

// SendToUser sends to all connections for a specific user email.
func (h *Hub) SendToUser(email string, event string, payload interface{}) {
	msg := models.WSMessage{Event: event, Data: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	if conns, ok := h.clients[email]; ok {
		for client := range conns {
			client.Send(data)
		}
	}
}

// BroadcastToChannel sends to all clients subscribed to a channel.
func (h *Hub) BroadcastToChannel(channelID string, event string, payload interface{}) {
	msg := models.WSMessage{Event: event, Channel: channelID, Data: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, conns := range h.clients {
		for client := range conns {
			if client.Channels[channelID] {
				client.Send(data)
			}
		}
	}
}

// BroadcastToTeam sends to all clients subscribed to a team.
func (h *Hub) BroadcastToTeam(teamID string, event string, payload interface{}) {
	msg := models.WSMessage{Event: event, Data: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, conns := range h.clients {
		for client := range conns {
			if client.TeamIDs[teamID] {
				client.Send(data)
			}
		}
	}
}

// BroadcastAll sends to every connected client.
func (h *Hub) BroadcastAll(event string, payload interface{}) {
	msg := models.WSMessage{Event: event, Data: payload}
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for _, conns := range h.clients {
		for client := range conns {
			client.Send(data)
		}
	}
}

// OnlineUsers returns currently connected user emails.
func (h *Hub) OnlineUsers() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	var users []string
	for email := range h.clients {
		users = append(users, email)
	}
	return users
}

// IsOnline checks if a user has any active connections.
func (h *Hub) IsOnline(email string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	conns, ok := h.clients[email]
	return ok && len(conns) > 0
}
