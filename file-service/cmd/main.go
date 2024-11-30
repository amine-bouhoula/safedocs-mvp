package main

import (
	"file-service/internal/api"
	"file-service/internal/config"
	database "file-service/internal/db"
	"fmt"

	logger "file-service/internal"

	"go.uber.org/zap"
)

func main() {
	// Step 1: Load configuration
	cfg, _ := config.LoadConfig()

	fmt.Println(cfg.LogLevel)

	// Step 2: Initialize zap logger
	logger.InitLogger(cfg.LogLevel)

	// Step 3: Initialize database connection
	gormDB, err := database.ConnectDB(cfg.DatabaseURL)
	if err != nil {
		logger.Logger.Fatal("Failed to connect to the Postgres database", zap.Error(err))
	}

	sqlDB, err := gormDB.DB() // Get the underlying sql.DB object from GORM
	if err != nil {
		logger.Logger.Fatal("Failed to retrieve underlying SQL DB from GORM", zap.Error(err))
	}
	defer func() {
		if err := sqlDB.Close(); err != nil {
			logger.Logger.Warn("Failed to close the Postgres database connection", zap.Error(err))
		}
	}()

	// Step 4: Start the API server
	logger.Logger.Info("Starting API server...", zap.String("port", cfg.ServerPort))
	api.StartServer(cfg, gormDB, logger.Logger)
}
