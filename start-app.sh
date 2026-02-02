#!/bin/bash

# Start the backend server
echo "Starting Crypto Analysis Dashboard backend..."
node simple-server.js &

# Wait a moment for the server to start
sleep 2

echo "Crypto Analysis Dashboard is running!"
echo "Backend server: http://localhost:3001"
echo "Frontend: http://localhost:3001 (serves public/index.html)"

# Keep the script running
wait