package cache

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ═══════════════════════════════════════════════════════════════════════════
// CacheService — struct-based cache backed by public.api_cache
// ═══════════════════════════════════════════════════════════════════════════

type CacheService struct {
	db         *pgxpool.Pool
	defaultTTL int // seconds
}

func NewCacheService(db *pgxpool.Pool, ttlSeconds int) *CacheService {
	log.Printf("[cache] CacheService initialized with TTL=%ds", ttlSeconds)
	return &CacheService{db: db, defaultTTL: ttlSeconds}
}

// Get reads a cached JSON value. Returns nil on miss.
func (c *CacheService) Get(ctx context.Context, key string) (json.RawMessage, error) {
	var value json.RawMessage
	err := c.db.QueryRow(ctx,
		`SELECT value FROM public.api_cache WHERE key = $1 AND (expires_at IS NULL OR expires_at > NOW())`,
		key,
	).Scan(&value)
	if err != nil {
		return nil, nil // cache miss
	}
	return value, nil
}

// Set writes a JSON value with optional TTL override. If ttlOverride <= 0, uses default TTL.
func (c *CacheService) Set(ctx context.Context, key string, data interface{}, ttlOverride ...int) error {
	value, err := json.Marshal(data)
	if err != nil {
		return err
	}
	ttl := c.defaultTTL
	if len(ttlOverride) > 0 && ttlOverride[0] > 0 {
		ttl = ttlOverride[0]
	}
	expiresAt := time.Now().Add(time.Duration(ttl) * time.Second)
	_, err = c.db.Exec(ctx,
		`INSERT INTO public.api_cache (key, value, expires_at, created_at)
		 VALUES ($1, $2, $3, NOW())
		 ON CONFLICT (key) DO UPDATE SET value = $2, expires_at = $3, created_at = NOW()`,
		key, value, expiresAt,
	)
	return err
}

// Invalidate removes a single cache key.
func (c *CacheService) Invalidate(ctx context.Context, key string) error {
	_, err := c.db.Exec(ctx, `DELETE FROM public.api_cache WHERE key = $1`, key)
	return err
}

// InvalidatePrefix removes all cache entries with the given key prefix.
func (c *CacheService) InvalidatePrefix(ctx context.Context, prefix string) error {
	_, err := c.db.Exec(ctx, `DELETE FROM public.api_cache WHERE key LIKE $1`, prefix+"%")
	return err
}

// Cleanup removes all expired cache entries.
func (c *CacheService) Cleanup(ctx context.Context) error {
	_, err := c.db.Exec(ctx, `DELETE FROM public.api_cache WHERE expires_at < NOW()`)
	return err
}
