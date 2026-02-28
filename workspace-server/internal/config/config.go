package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DB     DBConfig
	Server ServerConfig
	Cache  CacheConfig
	Redis  RedisConfig
}

type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	Name     string
	DSN      string
}

type ServerConfig struct {
	Host string
	Port string
}

type CacheConfig struct {
	TTLSeconds int
}

type RedisConfig struct {
	Addr     string
	Password string
	DB       int
}

func Load() (*Config, error) {
	_ = godotenv.Load() // ignore if .env missing — env vars may come from OS

	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "5432"))
	cacheTTL, _ := strconv.Atoi(getEnv("CACHE_TTL", "300"))
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))

	dbCfg := DBConfig{
		Host:     getEnv("DB_HOST", "localhost"),
		Port:     dbPort,
		User:     getEnv("DB_USER", "postgres"),
		Password: getEnv("DB_PASS", ""),
		Name:     getEnv("DB_NAME", "airsend_mail"),
	}
	dbCfg.DSN = fmt.Sprintf(
		"postgres://%s:%s@%s:%d/%s?sslmode=disable",
		dbCfg.User, dbCfg.Password, dbCfg.Host, dbCfg.Port, dbCfg.Name,
	)

	return &Config{
		DB: dbCfg,
		Server: ServerConfig{
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
			Port: getEnv("SERVER_PORT", "8090"),
		},
		Cache: CacheConfig{
			TTLSeconds: cacheTTL,
		},
		Redis: RedisConfig{
			Addr:     getEnv("REDIS_ADDR", ""),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
	}, nil
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
