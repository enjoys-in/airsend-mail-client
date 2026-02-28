package cache

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/AirSend/workspace-server/internal/database"
)

var defaultTTL int

// Init sets the default cache TTL in seconds.
func Init(ttlSeconds int) {
	defaultTTL = ttlSeconds
	log.Printf("[cache] initialized with TTL=%ds", ttlSeconds)
}

// Get reads a cached JSON value from public.api_cache.
// Returns nil if not found or expired.
func Get(ctx context.Context, key string) (json.RawMessage, error) {
	var value json.RawMessage
	err := database.Pool.QueryRow(ctx,
		`SELECT value FROM public.api_cache WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
		key,
	).Scan(&value)
	if err != nil {
		return nil, nil // treat as cache miss
	}
	return value, nil
}

// Set writes a JSON value to public.api_cache with TTL.
func Set(ctx context.Context, key string, data interface{}) error {
	value, err := json.Marshal(data)
	if err != nil {
		return err
	}
	expiresAt := time.Now().Add(time.Duration(defaultTTL) * time.Second)
	_, err = database.Pool.Exec(ctx,
		`INSERT INTO public.api_cache (key, value, expires_at, created_at)
		 VALUES ($1, $2, $3, NOW())
		 ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = $3, created_at = NOW()`,
		key, value, expiresAt,
	)
	return err
}

// Invalidate removes a specific cache entry.
func Invalidate(ctx context.Context, key string) error {
	_, err := database.Pool.Exec(ctx, `DELETE FROM public.api_cache WHERE key = $1`, key)
	return err
}

// InvalidatePrefix removes all cache entries with matching key prefix.
func InvalidatePrefix(ctx context.Context, prefix string) error {
	_, err := database.Pool.Exec(ctx, `DELETE FROM public.api_cache WHERE key LIKE $1`, prefix+"%")
	return err
}

// Cleanup removes all expired cache entries. Call periodically.
func Cleanup(ctx context.Context) error {
	_, err := database.Pool.Exec(ctx, `DELETE FROM public.api_cache WHERE expires_at < NOW()`)
	return err
}
