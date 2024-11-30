package handlers

import (
	"auth-service/database"
	"auth-service/models"
	"auth-service/utils"
	"encoding/json"
	"log"
	"net/http"

	"go.uber.org/zap"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("Received a register request",
		zap.String("method", r.Method),
		zap.String("url", r.URL.Path),
	)

	var user models.User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		utils.Logger.Error("Invalid request payload")
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Hash the password
	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		utils.Logger.Error("Error hashing password")
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}
	user.Password = hashedPassword

	// Save to database
	if err := database.DB.Create(&user).Error; err != nil {
		utils.Logger.Error("Failed to register user")
		http.Error(w, "Failed to register user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("User registered successfully"))
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	utils.Logger.Info("Received a login request",
		zap.String("method", r.Method),
		zap.String("url", r.URL.Path),
	)

	var credentials models.Credentials
	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		utils.Logger.Error("Invalid request payload")
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	var user models.User
	err := database.DB.Where("username = ?", credentials.Username).First(&user).Error
	if err != nil {
		utils.Logger.Error("Invalid credentials")
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if !utils.CheckPasswordHash(credentials.Password, user.Password) {
		utils.Logger.Error("Invalid credentials")
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	privateKeyPEM, err := utils.LoadPrivateKey("/keys/private_key.pem")
	if err != nil {
		log.Fatalf("Failed to load private key: %v", err)
	}

	token, err := utils.GenerateInternalJWT(user.Username, []string{"admin"}, privateKeyPEM)
	if err != nil {
		utils.Logger.Error("Failed to generate token")
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
