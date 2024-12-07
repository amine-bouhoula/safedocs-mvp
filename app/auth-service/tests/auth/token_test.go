package auth

import (
	"testing"

	"auth-service/utils"

	"github.com/stretchr/testify/assert"
)

func TestGenerateInternalJWT(t *testing.T) {
	privateKey, err := utils.LoadPrivateKey("/keys/private_key.pem")
	assert.NoError(t, err, "Failed to load private key")

	token, err := utils.GenerateInternalJWT("testuser", []string{"admin"}, privateKey)
	assert.NoError(t, err, "Failed to generate token")
	assert.NotEmpty(t, token, "Token should not be empty")
}

func TestCheckPasswordHash(t *testing.T) {
	password := "securepassword"
	hash, err := utils.HashPassword(password)
	assert.NoError(t, err, "Failed to hash password")

	valid := utils.CheckPasswordHash(password, hash)
	assert.True(t, valid, "Password hash mismatch")
}
