.PHONY: run build migrate dev

run:
	go run cmd/server/main.go

build:
	go build -o bin/workspace-server cmd/server/main.go

dev:
	go run cmd/server/main.go

tidy:
	go mod tidy
