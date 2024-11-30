package services

import (
	"file-service/internal/models"

	"go.uber.org/zap"
	"gorm.io/gorm"
)

type MetadataService struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewMetadataService(db *gorm.DB, log *zap.Logger) *MetadataService {
	return &MetadataService{db: db, logger: log}
}

// SaveFileMetadata saves the file metadata using GORM
func (m *MetadataService) SaveFileMetadata(fileID, fileName string, size int64, contentType string) error {
	metadata := models.FileMetadata{
		FileID:      fileID,
		FileName:    fileName,
		Size:        size,
		ContentType: contentType,
	}

	if err := m.db.Create(&metadata).Error; err != nil {
		m.logger.Error("Failed to save metadata", zap.Error(err))
		return err
	}
	return nil
}
