package auth

import (
	"testing"
)

func TestJWTToken_Expired(t *testing.T) {
	// privateKey, _ := utils.LoadPrivateKey("/keys/private_key.pem")

	// // Generate an expired token
	// expiredToken, err := utils.GenerateInternalJWT("testuser", []string{"admin"}, privateKey)
	// assert.NoError(t, err, "Failed to generate token")

	// // Manually expire the token
	// time.Sleep(2 * time.Second) // Simulate expiration

	// _, err = utils.ValidateToken(expiredToken, "refresh-secret")
	// assert.Error(t, err, "Expected token validation to fail")
}

func TestJWTToken_Valid(t *testing.T) {
	// privateKey, _ := utils.LoadPrivateKey("/keys/private_key.pem")

	// // Generate a valid token
	// token, err := utils.GenerateInternalJWT("testuser", []string{"admin"}, privateKey)
	// assert.NoError(t, err, "Failed to generate token")

	// // Validate token
	// claims, err := utils.ValidateToken(token, "refresh-secret")
	// assert.NoError(t, err, "Expected token validation to pass")
	// assert.Equal(t, "testuser", claims["username"])
}
