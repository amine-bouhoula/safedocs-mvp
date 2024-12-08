package main

import (
	"auth-service/database"
	"auth-service/handlers"
	"auth-service/utils"
	"log"

	"github.com/gin-gonic/gin"
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

	// Create a new Gin router
	router := gin.Default()

	// Register routes
	router.POST("/api/v1/auth/register", handlers.RegisterHandler())
	router.POST("/api/v1/auth/login", handlers.LoginHandler())
	router.POST("/api/v1/auth/refresh", handlers.RefreshTokenHandler("accessTokenSecret", "refreshTokenSecret"))
	router.POST("/api/v1/auth/logout", handlers.LogoutHandler())
	router.GET("/api/v1/users/:user_id", handlers.GetUserHandler())

	// Start the server
	if err := router.Run(":8000"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
