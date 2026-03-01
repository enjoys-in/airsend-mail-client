package middleware

import (
	"github.com/gofiber/fiber/v2"
)

const UserEmailKey = "userEmail"

// Auth extracts X-User-Email header and makes it available in Locals.
// In a production system this would validate a JWT or session token.
// For now it trusts the header (the API gateway handles real auth).
func Auth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		email := c.Get("X-User-Email")
		if email == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "missing X-User-Email header",
			})
		}
		c.Locals(UserEmailKey, email)
		return c.Next()
	}
}

// GetUserEmail retrieves the authenticated user email from context.
func GetUserEmail(c *fiber.Ctx) string {
	email, _ := c.Locals(UserEmailKey).(string)
	return email
}
