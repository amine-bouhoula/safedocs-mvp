package main

import (
	"auth-service/database"
	"auth-service/handlers"
	"auth-service/utils"
	"net/http"

	"go.uber.org/zap"
)

func main() {

	utils.InitLogger("production")

	utils.Logger.Info("Starting auth-service")

	// Connect to PostgreSQL
	if err := database.ConnectDB(); err != nil {
		utils.Logger.Fatal("Failed to connect to the databse", zap.Error(err))
	}
	utils.Logger.Info("Connected to the database")

	// Connect to Redis
	database.ConnectRedis()
	utils.Logger.Info("Connected to Redis")

	// Register routes
	http.HandleFunc("/register", handlers.RegisterHandler)
	http.HandleFunc("/login", handlers.LoginHandler)
	utils.Logger.Info("Auth Service is running on port 8000")
	if err := http.ListenAndServe(":8000", nil); err != nil {
		utils.Logger.Fatal("Server failed to start", zap.Error(err))
	}
}
