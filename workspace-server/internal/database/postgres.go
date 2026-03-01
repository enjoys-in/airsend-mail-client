package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is the global connection pool.
var Pool *pgxpool.Pool

// Connect opens a pgx pool and pings the database.
func Connect(dsn string) error {
	cfg, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return fmt.Errorf("parse dsn: %w", err)
	}

	cfg.MaxConns = 20
	cfg.MinConns = 2
	cfg.MaxConnLifetime = 30 * time.Minute
	cfg.MaxConnIdleTime = 5 * time.Minute

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return fmt.Errorf("create pool: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return fmt.Errorf("ping: %w", err)
	}

	Pool = pool
	log.Println("[db] connected to PostgreSQL")
	return nil
}

// Close drains the pool.
func Close() {
	if Pool != nil {
		Pool.Close()
		log.Println("[db] connection pool closed")
	}
}

// RunMigrations reads .up.sql files from migrationsDir and executes them in order.
// It uses a workspace.schema_migrations table to track applied migrations.
func RunMigrations(migrationsDir string) error {
	ctx := context.Background()

	// Ensure schema and tracking table exist.
	if _, err := Pool.Exec(ctx, `CREATE SCHEMA IF NOT EXISTS workspace`); err != nil {
		return fmt.Errorf("create schema: %w", err)
	}
	if _, err := Pool.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS workspace.schema_migrations (
			version  VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMPTZ DEFAULT NOW()
		)
	`); err != nil {
		return fmt.Errorf("create migrations table: %w", err)
	}

	// List .up.sql files sorted by name.
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}

	var upFiles []string
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".up.sql") {
			upFiles = append(upFiles, e.Name())
		}
	}
	sort.Strings(upFiles)

	for _, fname := range upFiles {
		version := strings.TrimSuffix(fname, ".up.sql")

		// Check if already applied.
		var count int
		err := Pool.QueryRow(ctx,
			`SELECT COUNT(*) FROM workspace.schema_migrations WHERE version = $1`, version,
		).Scan(&count)
		if err != nil {
			return fmt.Errorf("check migration %s: %w", version, err)
		}
		if count > 0 {
			continue
		}

		sql, err := os.ReadFile(filepath.Join(migrationsDir, fname))
		if err != nil {
			return fmt.Errorf("read %s: %w", fname, err)
		}

		tx, err := Pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin tx for %s: %w", version, err)
		}

		if _, err := tx.Exec(ctx, string(sql)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("exec %s: %w", version, err)
		}

		if _, err := tx.Exec(ctx,
			`INSERT INTO workspace.schema_migrations (version) VALUES ($1)`, version,
		); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record migration %s: %w", version, err)
		}

		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit %s: %w", version, err)
		}

		log.Printf("[db] applied migration: %s", version)
	}

	return nil
}
