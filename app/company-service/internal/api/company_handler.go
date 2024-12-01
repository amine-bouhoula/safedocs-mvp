package handlers

import (
	"company-service/internal/models"
	"company-service/internal/services"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

func CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var org models.Organization
	if err := json.NewDecoder(r.Body).Decode(&org); err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	if err := services.CreateOrganization(&org); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(org)
}

func GetOrganization(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(mux.Vars(r)["id"])
	if err != nil {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	org, err := services.GetOrganizationByID(uint(id))
	if err != nil {
		http.Error(w, "Organization not found", http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(org)
}
