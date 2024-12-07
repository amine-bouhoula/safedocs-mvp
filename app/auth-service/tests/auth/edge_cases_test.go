package auth

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/handlers"
	"auth-service/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestLogin_InvalidPayload(t *testing.T) {
	utils.InitLogger("production")

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/login", handlers.LoginHandler())

	// Invalid payload (missing fields)
	requestBody := []byte(`{}`)

	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Check response
	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "Invalid request payload")
}

func TestRefresh_InvalidToken(t *testing.T) {

	utils.InitLogger("production")

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/refresh", handlers.RefreshTokenHandler("access-secret", "refresh-secret"))

	requestBody := []byte(`{
		"refresh_token": "invalid-token"
	}`)

	req, _ := http.NewRequest("POST", "/api/v1/auth/refresh", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "Invalid or expired refresh token")
}
