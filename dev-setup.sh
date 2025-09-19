#!/bin/bash

echo "🛠️  Customer Management Application - Development Setup"
echo "========================================================"
echo "This script helps you run the application without Docker for development."
echo ""

# Check Java
if command -v java &> /dev/null; then
    echo "✅ Java is installed: $(java -version 2>&1 | head -n 1)"
else
    echo "❌ Java is not installed. Please install Java 17+"
    exit 1
fi

# Check Maven
if command -v mvn &> /dev/null; then
    echo "✅ Maven is installed: $(mvn -version | head -n 1)"
else
    echo "❌ Maven is not installed. Please install Maven"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js is installed: $(node --version)"
else
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✅ npm is installed: $(npm --version)"
else
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo ""
echo "📋 Development Setup Steps:"
echo ""
echo "1. 🗄️  Setup MySQL Database:"
echo "   - Install MySQL 8.0+"
echo "   - Create database: CREATE DATABASE shop;"
echo "   - Update connection in src/main/resources/application.properties"
echo ""
echo "2. 🚀 Start Backend (Terminal 1):"
echo "   cd $(pwd)"
echo "   mvn spring-boot:run"
echo "   Access: http://localhost:8080/api/customers"
echo ""
echo "3. 🌐 Start Frontend (Terminal 2):"
echo "   cd $(pwd)/frontend"
echo "   npm install"
echo "   npm run dev"
echo "   Access: http://localhost:5173"
echo ""
echo "✨ Happy coding! The frontend will hot-reload on changes."
