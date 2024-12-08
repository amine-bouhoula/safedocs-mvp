package main

import (
	"log"

	"user-service/database"
	"user-service/handlers"
	"user-service/utils"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize Logger and Database
	utils.InitLogger("production")
	defer utils.Logger.Sync()

	database.ConnectDB()

	r := gin.Default()

	// Register Routes
	r.POST("/api/v1/users", handlers.CreateUserHandler())
	r.GET("/api/v1/users/:user_id", handlers.GetUserHandler())

	// Start the Server
	if err := r.Run(":8081"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
