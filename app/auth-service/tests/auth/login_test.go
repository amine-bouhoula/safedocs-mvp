package auth

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/handlers"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestLoginHandler_Success(t *testing.T) {
	mock, cleanup := setupTestDB(t)
	defer cleanup()

	// Prepare user in the mock database
	mock.ExpectQuery("SELECT (.+) FROM users WHERE username = ?").
		WithArgs("testuser").
		WillReturnRows(sqlmock.NewRows([]string{"id", "username", "password"}).
			AddRow(1, "testuser", "$2a$10$eW5qaQ.."))

	// Setup Gin test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/login", handlers.LoginHandler())

	// Define payload
	requestBody := []byte(`{
		"username": "testuser",
		"password": "securepassword"
	}`)

	// Make request
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Record response
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "token")

	// Check expectations
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Database expectations were not met: %v", err)
	}
}
