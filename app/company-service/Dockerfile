# Build stage
FROM golang:1.22 AS builder
WORKDIR /app
COPY . . 
RUN go mod tidy                 # Install dependencies
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o company-service ./cmd/main.go

#RUN go build -o main .          # Build the Go binary named 'main'

# Run stage
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/company-service . 
RUN mkdir -p /keys
COPY ./keys/private_key.pem /keys/private_key.pem
RUN chmod 600 /keys/private_key.pem

RUN chmod +x company-service
EXPOSE 8000
CMD ["./company-service"]
