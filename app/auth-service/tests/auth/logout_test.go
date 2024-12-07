package auth

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/handlers"
	"auth-service/utils"

	"auth-service/database"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestLogoutHandler_Success(t *testing.T) {
	database.ConnectRedis()
	defer database.RedisClient.Close()

	// Mock Redis token saving
	err := utils.SaveToken(database.RedisClient, "testuser", "test-refresh-token", 0)
	assert.NoError(t, err, "Failed to save token in Redis")

	// Setup Gin test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/logout", handlers.LogoutHandler())

	// Define payload
	requestBody := []byte(`{
		"refresh_token": "test-refresh-token"
	}`)

	// Make request
	req, _ := http.NewRequest("POST", "/api/v1/auth/logout", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Record response
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "Logout successful")
}
