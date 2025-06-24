#!/bin/bash

# Simple script to serve the game locally
echo "Starting AI CEO 2027 game server..."
echo "Game will be available at http://localhost:8080"
echo "Press Ctrl+C to stop"

# Start Python HTTP server
python3 -m http.server 8080