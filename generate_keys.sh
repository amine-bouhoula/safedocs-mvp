#!/bin/bash

# Define the temporary key folder and the auth-service folder
FILE_SERVICE_KEY_DIR=./file-service/keys
AUTH_SERVICE_KEY_DIR=./auth-service/keys

rm -rf "$FILE_SERVICE_KEY_DIR"
rm -rf "$AUTH_SERVICE_KEY_DIR"

# Create the directories if they don't exist
mkdir -p "$FILE_SERVICE_KEY_DIR"
mkdir -p "$AUTH_SERVICE_KEY_DIR"

# Generate private key if not exists
if [ ! -f "$FILE_SERVICE_KEY_DIR/private_key.pem" ]; then
    echo "Generating private key..."
    openssl genrsa -out "$FILE_SERVICE_KEY_DIR/private_key.pem" 2048
    cp "$FILE_SERVICE_KEY_DIR/private_key.pem" "$AUTH_SERVICE_KEY_DIR/"
fi

# Generate public key from private key if not exists
if [ ! -f "$FILE_SERVICE_KEY_DIR/public_key.pem" ]; then
    echo "Generating public key..."
    openssl rsa -pubout -in "$FILE_SERVICE_KEY_DIR/private_key.pem" -out "$FILE_SERVICE_KEY_DIR/public_key.pem"
    cp "$FILE_SERVICE_KEY_DIR/public_key.pem" "$AUTH_SERVICE_KEY_DIR/"
fi

echo "Keys are available in $FILE_SERVICE_KEY_DIR and $AUTH_SERVICE_KEY_DIR"
