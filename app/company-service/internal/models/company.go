package models

type Organization struct {
	ID          uint   `gorm:"primaryKey"`
	Name        string `gorm:"unique;not null"`
	Description string
	OwnerID     uint `gorm:"not null"` // User ID of the owner
	CreatedAt   string
	UpdatedAt   string
}
