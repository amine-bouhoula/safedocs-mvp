package services

import (
	database "company-service/internal/db"
	"company-service/internal/models"
	"errors"
)

func CreateCompany(company *models.Company) error {

	if err := database.DB.Create(company).Error; err != nil {
		return errors.New("failed to create organization")
	}
	return nil
}

func GetCompanyByID(id uint) (*models.Company, error) {

	var org models.Company
	if err := database.DB.First(&org, id).Error; err != nil {
		return nil, errors.New("organization not found")
	}
	return &org, nil
}
