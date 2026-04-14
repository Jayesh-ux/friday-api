#!/bin/bash
set -e

echo "Installing opencode..."
curl -fsSL https://raw.githubusercontent.com/nicholasgonzalezsc/opencode/main/install.sh | sh

echo "Starting server..."
npm start
