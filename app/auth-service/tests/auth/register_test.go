package auth

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"auth-service/database"
	"auth-service/handlers"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) (sqlmock.Sqlmock, func()) {
	db, mock, err := sqlmock.New()
	if err != nil {
		t.Fatalf("Failed to create SQL mock: %s", err)
	}
	database.DB, _ = database.OpenMockDB(db)
	return mock, func() {
		db.Close()
	}
}

func TestRegisterHandler_Success(t *testing.T) {
	mock, cleanup := setupTestDB(t)
	defer cleanup()

	// Simulate valid user insertion
	mock.ExpectBegin()
	mock.ExpectExec("INSERT INTO users").
		WithArgs("testuser", "test@email.com", sqlmock.AnyArg()).
		WillReturnResult(sqlmock.NewResult(1, 1))
	mock.ExpectCommit()

	// Setup Gin test router
	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/auth/register", handlers.RegisterHandler())

	// Define payload
	requestBody := []byte(`{
		"username": "testuser",
		"email": "test@email.com",
		"password": "securepassword"
	}`)

	// Make request
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(requestBody))
	req.Header.Set("Content-Type", "application/json")

	// Record response
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)

	// Assertions
	assert.Equal(t, http.StatusCreated, w.Code)
	assert.Contains(t, w.Body.String(), "User registered successfully")

	// Check expectations
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("Database expectations were not met: %v", err)
	}
}
