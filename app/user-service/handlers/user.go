package handlers

import (
	"net/http"

	"user-service/models"

	database "github.com/amine-bouhoula/safedocs-mvp/sdlib/database"
	utils "github.com/amine-bouhoula/safedocs-mvp/sdlib/utils"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// CreateUserHandler - Registers a new user
func CreateUserHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var user models.User

		// Parse the incoming request
		if err := c.ShouldBindJSON(&user); err != nil {
			utils.Logger.Error("Invalid request payload", zap.Error(err))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
			return
		}

		// Save to the database
		if err := database.DB.Create(&user).Error; err != nil {
			utils.Logger.Error("Failed to create user", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}

		utils.Logger.Info("User created successfully", zap.String("user_id", user.ID))
		c.JSON(http.StatusCreated, gin.H{"message": "User created successfully", "user_id": user.ID})
	}
}

// GetUserHandler - Retrieves a user by ID
func GetUserHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.Param("user_id")

		var user models.User
		if err := database.DB.First(&user, "id = ?", userID).Error; err != nil {
			utils.Logger.Error("User not found", zap.String("user_id", userID), zap.Error(err))
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		utils.Logger.Info("User retrieved successfully", zap.String("user_id", user.ID))
		c.JSON(http.StatusOK, user)
	}
}
