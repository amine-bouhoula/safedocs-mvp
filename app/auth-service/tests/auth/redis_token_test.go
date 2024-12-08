package auth

import (
	"testing"
	"time"

	"auth-service/utils"

	"github.com/amine-bouhoula/safedocs-mvp/sdlib/database"
	"github.com/stretchr/testify/assert"
)

func TestRedis_SaveToken(t *testing.T) {
	database.ConnectRedis("redis:5975")
	defer database.RedisClient.Close()

	// Save token
	err := utils.SaveToken(database.RedisClient, "testuser", "sample-token", time.Minute)
	assert.NoError(t, err, "Failed to save token")

	// Retrieve token
	token, err := utils.GetToken(database.RedisClient, "testuser")
	assert.NoError(t, err, "Failed to retrieve token")
	assert.Equal(t, "sample-token", token)
}

func TestRedis_DeleteToken(t *testing.T) {
	database.ConnectRedis("redis:5975")
	defer database.RedisClient.Close()

	// Save and delete token
	err := utils.SaveToken(database.RedisClient, "testuser", "sample-token", time.Minute)
	assert.NoError(t, err, "Failed to save token")

	err = utils.DeleteToken(database.RedisClient, "testuser")
	assert.NoError(t, err, "Failed to delete token")

	_, err = utils.GetToken(database.RedisClient, "testuser")
	assert.Error(t, err, "Token should not exist")
}
