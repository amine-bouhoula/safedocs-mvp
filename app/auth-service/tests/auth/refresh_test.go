package auth

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"auth-service/handlers"
	"auth-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/amine-bouhoula/safedocs-mvp/sdlib/database"
)

func TestRefreshTokenHandler_Success(t *testing.T) {
	database.ConnectRedis("redis:5975")
	defer database.RedisClient.Close()

	// Mock JWT token generation
	privateKey, _ := utils.LoadPrivateKey("/keys/private_key.pem")
	refreshToken, _ := utils.GenerateInternalJWT("testuser", []string{"admin"}, privateKey)

	// Save token in Redis with a 1-hour expiration
	err := utils.SaveToken(database.RedisClient, "testuser", refreshToken, time.Hour)
	assert.NoError(t, err, "Failed to save token in Redis")

	// Setup Gin test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/refresh", handlers.RefreshTokenHandler("access-secret", "refresh-secret"))

	// Define payload
	requestBody := []byte(`{
		"refresh_token": "` + refreshToken + `"
	}`)

	// Make request
	req, _ := http.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Record response
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "access_token")
}
