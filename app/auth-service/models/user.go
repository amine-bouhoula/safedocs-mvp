package models

type User struct {
	ID       uint   `gorm:"primaryKey"`
	Username string `gorm:"unique;not null"`
	Email    string `gorm:"unique;not null"`
	Password string `gorm:"not null"`
	Company  string `gorm:"not null"`
	Role     string `gorm:"not null"`
}

type Credentials struct {
	Username string `json:"username"`
	Password string `json:"password"`
}
