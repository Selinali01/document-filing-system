#!/bin/bash

# React 19 + Zustand + TanStack Query Template Start Script
# This template provides a modern React 19 setup with state management and data fetching

echo "🚀 Starting your React 19 web application..."
echo "   This may take a moment the first time..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm (comes with Node.js)"
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies (this may take a few minutes)..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies. Please check your internet connection and try again."
        exit 1
    fi
fi

# Start the development server
echo "🔥 Starting development server..."
echo "   Your app will open at: http://localhost:5173"
echo "   Press Ctrl+C to stop the server"
echo ""

npm run dev