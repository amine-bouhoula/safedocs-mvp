package api

import (
	"crypto/rand"
	"encoding/hex"
	"file-service/internal/config"
	"file-service/internal/services"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type UploadSession struct {
	FileName       string
	FileSize       int64
	ChunkSize      int64
	UploadedChunks map[int]bool // Track received chunks
	TotalChunks    int
	TempDir        string    // Directory for storing temporary chunks
	CreatedAt      time.Time // Timestamp for session creation
}

type ChunkMetadata struct {
	FileName       string
	FileSize       int64
	ChunkSize      int64
	UploadedChunks map[int]bool // Track received chunks
	TotalChunks    int
	TempDir        string
}

var uploadSessions = struct {
	sync.Mutex
	Sessions map[string]*UploadSession
}{
	Sessions: make(map[string]*UploadSession),
}

func StartServer(cfg *config.Config, db *gorm.DB, log *zap.Logger) {
	// Ensure logger is not nil
	if log == nil {
		panic("Logger is required but not provided")
	}

	// Validate configuration
	log.Info("Validating server configuration")
	if cfg.ServerPort == "" {
		log.Fatal("Server port must be specified in configuration")
	}
	log.Info("Server configuration validated", zap.String("server_port", cfg.ServerPort))

	// Initialize Gin router
	router := gin.Default()

	// Initialize services with proper error handling
	log.Info("Initializing storage service")
	storageService, err := services.ConnectMinio(cfg.MinIOURL, cfg.MinIOUser, cfg.MinIOPass, log)
	if err != nil {
		log.Fatal("Failed to initialize storage service", zap.Error(err))
	}
	log.Info("Storage service initialized successfully")

	log.Info("Initializing metadata service")
	metadataService := services.NewMetadataService(db, log)
	if metadataService == nil {
		log.Fatal("Failed to initialize metadata service")
	}
	log.Info("Metadata service initialized successfully")

	// Load the RSA public key
	log.Info("Loading RSA public key", zap.String("public_key_path", cfg.PublicKeyPath))
	publicKey, err := services.LoadPublicKey(cfg.PublicKeyPath)
	if err != nil {
		//log.Fatal("Error loading RSA public key", zap.Error(err))
	}
	log.Info("RSA public key loaded successfully")

	// Apply middleware
	log.Info("Applying authentication middleware")
	router.Use(services.AuthMiddleware(publicKey, log))

	// Define /metrics endpoint
	router.GET("/metrics", gin.WrapH(promhttp.Handler()))

	router.POST("/start-upload", func(c *gin.Context) {
		startUpload(c, log)
	})

	// Define routes
	log.Info("Defining routes")
	router.POST("/upload", func(c *gin.Context) {
		log.Info("Handling /upload request", zap.String("method", c.Request.Method))
		uploadFileHandler(c, storageService, metadataService, log)
	})

	router.GET("/download/:bucket/:file", func(c *gin.Context) {
		log.Info("Handling /download request", zap.String("method", c.Request.Method), zap.String("path", c.Request.URL.Path))
		downloadFileHandler(c, storageService)
	})

	// Start the server
	port := cfg.ServerPort
	log.Info("Starting server", zap.String("port", port))
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Failed to start server", zap.Error(err))
	}
}

func downloadFileHandler(c *gin.Context, storageService *services.StorageService) {
	bucketName := c.Param("bucket")
	fileName := c.Param("file")

	// Get the file and its content type
	object, contentType, err := storageService.GetFile(bucketName, fileName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to download file: " + err.Error()})
		return
	}
	defer object.Close()

	// Set appropriate headers
	c.Header("Content-Disposition", "attachment; filename="+filepath.Base(fileName))
	c.Header("Content-Type", contentType)

	// Stream the object directly to the response
	_, err = io.Copy(c.Writer, object)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to stream file: " + err.Error()})
		return
	}
}

func listFileVersionsHandler(c *gin.Context, storage *services.StorageService) {
	bucketName := c.Param("bucket")
	fileName := c.Param("file")

	versions, err := storage.ListFileVersions(bucketName, fileName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to list file versions: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, versions)
}

// StartUpload initializes an upload session
func startUpload(c *gin.Context, log *zap.Logger) {
	var request struct {
		FileName  string `json:"fileName"`
		FileSize  int64  `json:"fileSize"`
		ChunkSize int64  `json:"chunkSize"`
	}

	log.Info("Received request to start an upload session", zap.String("clientIP", c.ClientIP()))

	// Parse request body
	if err := c.ShouldBindJSON(&request); err != nil {
		log.Error("Failed to parse request body", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Validate fileName and fileSize
	if request.FileName == "" || request.FileSize <= 0 {
		log.Error("Invalid fileName or fileSize",
			zap.String("fileName", request.FileName),
			zap.Int64("fileSize", request.FileSize))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid fileName or fileSize"})
		return
	}

	// Default chunk size to 5MB if not provided
	if request.ChunkSize <= 0 {
		request.ChunkSize = 5 * 1024 * 1024 // 5MB
		log.Info("Default chunk size applied", zap.Int64("chunkSize", request.ChunkSize))
	}

	// Generate a unique upload session ID
	uploadSessionId := generateSessionID()
	log.Info("Generated unique upload session ID", zap.String("uploadSessionId", uploadSessionId))

	// Create a new upload session
	uploadSession := &UploadSession{
		FileName:       request.FileName,
		FileSize:       request.FileSize,
		ChunkSize:      request.ChunkSize,
		UploadedChunks: make(map[int]bool),
		CreatedAt:      time.Now(),
	}

	// Store the session in memory
	uploadSessions.Lock()
	uploadSessions.Sessions[uploadSessionId] = uploadSession
	uploadSessions.Unlock()
	log.Info("Upload session created successfully",
		zap.String("uploadSessionId", uploadSessionId),
		zap.String("fileName", request.FileName),
		zap.Int64("fileSize", request.FileSize),
		zap.Int64("chunkSize", request.ChunkSize),
	)

	// Respond with the session ID and chunk size
	c.JSON(http.StatusOK, gin.H{
		"uploadSessionId": uploadSessionId,
		"chunkSize":       request.ChunkSize,
	})
	log.Info("Response sent successfully",
		zap.String("uploadSessionId", uploadSessionId),
		zap.Int64("chunkSize", request.ChunkSize))
}

// Helper function to generate a random session ID
func generateSessionID() string {
	bytes := make([]byte, 16)
	_, _ = rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// UploadChunk handles chunked file uploads
func uploadFileHandler(c *gin.Context, storage *services.StorageService, metadata *services.MetadataService, log *zap.Logger) {
	// Start timer
	startTime := time.Now()

	log.Info("Incoming upload request",
		zap.String("clientIP", c.ClientIP()),
		zap.String("method", c.Request.Method),
		zap.String("path", c.Request.URL.Path),
		zap.Any("headers", c.Request.Header),
		zap.Any("queryParams", c.Request.URL.Query()),
	)
	// Extract metadata from the form data
	uploadSessionId := c.PostForm("uploadSessionId")
	chunkIndexStr := c.PostForm("chunkIndex")
	totalChunksStr := c.PostForm("totalChunks")
	fileName := c.PostForm("fileName")
	fileID := c.PostForm("fileID")
	parentFileID := c.PostForm("parentFileID")

	// Parse numeric fields
	chunkIndex, err := strconv.Atoi(chunkIndexStr)
	if err != nil {
		log.Error("Invalid chunk index", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid chunkIndex"})
		return
	}

	totalChunks, err := strconv.Atoi(totalChunksStr)
	if err != nil {
		log.Error("Invalid total chunks", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid totalChunks"})
		return
	}

	// Check if the session ID exists
	uploadSessions.Lock()
	session, exists := uploadSessions.Sessions[uploadSessionId]
	uploadSessions.Unlock()

	if !exists {
		log.Error("Invalid upload session ID", zap.String("uploadSessionId", uploadSessionId))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid uploadSessionId"})
		return
	}

	// Process the file chunk
	file, _, err := c.Request.FormFile("file")
	if err != nil {
		log.Error("Failed to read file chunk", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read file chunk"})
		return
	}
	defer file.Close()

	// Save the chunk to the temporary directory
	chunkPath := filepath.Join(session.TempDir, fmt.Sprintf("%s.part%d", fileName, chunkIndex))
	outFile, err := os.Create(chunkPath)
	if err != nil {
		log.Error("Failed to save chunk", zap.String("chunkPath", chunkPath), zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save chunk"})
		return
	}
	defer outFile.Close()

	if _, err := io.Copy(outFile, file); err != nil {
		log.Error("Failed to write chunk to disk", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write chunk to disk"})
		return
	}

	duration := time.Since(startTime)
	log.Info("Chunk saved successfully", zap.String("chunkPath", chunkPath), zap.Int("chunkIndex", chunkIndex), zap.Duration("duration to get all chunks", duration))

	startTime = time.Now()

	// Mark the chunk as uploaded
	uploadSessions.Lock()
	session.UploadedChunks[chunkIndex] = true
	uploadedChunks := len(session.UploadedChunks)
	uploadSessions.Unlock()

	// Check if all chunks are uploaded
	if uploadedChunks == totalChunks {
		log.Info("All chunks received. Reassembling file", zap.String("fileName", fileName))

		finalPath := filepath.Join(session.TempDir, fileName)
		finalFile, err := os.Create(finalPath)
		if err != nil {
			log.Error("Failed to create final file", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create final file"})
			return
		}
		defer finalFile.Close()

		// Merge all chunks
		for i := 0; i < totalChunks; i++ {
			chunkPath := filepath.Join(session.TempDir, fmt.Sprintf("%s.part%d", fileName, i))
			chunkFile, err := os.Open(chunkPath)
			if err != nil {
				log.Error("Failed to open chunk for merging", zap.String("chunkPath", chunkPath), zap.Error(err))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open chunk for merging"})
				return
			}

			if _, err := io.Copy(finalFile, chunkFile); err != nil {
				chunkFile.Close()
				log.Error("Failed to write chunk to final file", zap.Error(err))
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write chunk to final file"})
				return
			}
			chunkFile.Close()

			// Remove the chunk after merging
			if err := os.Remove(chunkPath); err != nil {
				log.Warn("Failed to delete chunk after merging", zap.String("chunkPath", chunkPath), zap.Error(err))
			}
		}

		log.Info("File reassembled successfully", zap.String("fileName", finalPath))

		// Reset the file pointer to the start
		if _, err := finalFile.Seek(0, 0); err != nil {
			log.Error("Failed to rewind file pointer to the start", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to rewind file pointer to the start"})
			return
		}
		// Upload the merged file to MinIO
		fileID, fileVersion, err := storage.UploadFile(finalFile, fileID, fileName, "application/octet-stream")
		if err != nil {
			log.Error("Failed to upload merged file to MinIO", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload file to storage"})
			return
		}

		log.Info("Merged file uploaded successfully", zap.String("fileID", fileID), zap.String("file version", fileVersion))

		// Save metadata
		err = metadata.SaveFileMetadata(fileID, fileVersion, parentFileID, fileName, session.FileSize, "application/octet-stream")
		if err != nil {
			log.Error("Failed to save file metadata", zap.Error(err))
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file metadata"})
			return
		}

		// Cleanup session
		uploadSessions.Lock()
		delete(uploadSessions.Sessions, uploadSessionId)
		uploadSessions.Unlock()

		// Cleanup temporary directory
		if err := os.RemoveAll(session.TempDir); err != nil {
			log.Warn("Failed to delete temporary directory", zap.String("tempDir", session.TempDir), zap.Error(err))
		}

		// Log and respond
		duration := time.Since(startTime)
		log.Info("File upload in MINIO and assembly process completed ",
			zap.String("fileID", fileID),
			zap.Duration("duration", duration),
		)
		c.JSON(http.StatusOK, gin.H{"message": "File upload complete", "fileID": fileID})
		return
	}

	// Respond for single chunk upload
	c.JSON(http.StatusOK, gin.H{"message": "Chunk uploaded successfully", "chunkIndex": chunkIndex})
}
