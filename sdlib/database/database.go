package database

import (
	"context"
	"log"
	"sdlib/models"
	"sdlib/utils"

	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB // GORM's DB type
var RedisClient *redis.Client
var ctx = context.Background()

func ConnectDB() error {
	// Define PostgreSQL connection string (use environment variables for production)
	dsn := "postgres://dms_user:dms_password@postgres:5432/dms?sslmode=disable"
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		utils.Logger.Fatal("Failed to connect to database", zap.Error(err))
		return err
	}

	// Migrate the schema
	if err := DB.AutoMigrate(&models.User{}); err != nil {
		utils.Logger.Fatal("Failed to migrate schema", zap.Error(err))
		return err
	}

	log.Println("Successfully connected to PostgreSQL and migrated schema!")
	utils.Logger.Info("Successfully connected to PostgreSQL and migrated schema!")
	return nil
}

func ConnectRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr: "redis:6379", // Use "localhost:6379" if running locally
	})

	// Ping Redis to ensure connectivity
	_, err := RedisClient.Ping(ctx).Result()
	if err != nil {
		utils.Logger.Fatal("Failed to connect to Redis", zap.Error(err))
	} else {
		utils.Logger.Info("Successfully connected to Redis!")
	}
}
