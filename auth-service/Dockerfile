# Build stage
FROM golang:1.22 AS builder
WORKDIR /app
COPY . . 
RUN go mod tidy                 # Install dependencies
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o main .
#RUN go build -o main .          # Build the Go binary named 'main'

# Run stage
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/main . 
RUN mkdir -p /keys
COPY ../keys/private_key.pem /keys/private_key.pem
RUN chmod 600 /keys/private_key.pem

RUN chmod +x main
EXPOSE 8000
CMD ["./main"]
