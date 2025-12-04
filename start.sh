#!/usr/bin/env bash
set -e

# Start the server from the monorepo root by delegating to the server package
echo "Starting server from monorepo root..."
npm install --prefix server
npm start --prefix server
