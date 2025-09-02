#!/bin/bash

# Comprehensive Health Check Script for Bronwyn's Guide App
# This script performs a full health check before production deployment

echo "🏥 Starting Comprehensive Health Check..."
echo "========================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        ((ERRORS++))
    fi
}

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((ERRORS++))
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2 exists"
    else
        echo -e "${RED}✗${NC} $2 missing"
        ((ERRORS++))
    fi
}

echo ""
echo "1️⃣ Checking Project Structure..."
echo "---------------------------------"
check_dir "frontend-new" "Frontend directory"
check_dir "backend" "Backend directory"
check_dir ".github/workflows" "GitHub Actions directory"
check_file "package.json" "Root package.json"
check_file "vercel.json" "Vercel configuration"
check_file ".gitignore" ".gitignore file"
check_file "README.md" "README documentation"

echo ""
echo "2️⃣ Checking Frontend Dependencies..."
echo "------------------------------------"
cd frontend-new
npm ls react react-dom vite 2>/dev/null >/dev/null
check_status "Core React dependencies"

npm ls @vitejs/plugin-react react-router-dom 2>/dev/null >/dev/null
check_status "React plugins and router"

npm ls axios @tanstack/react-query zustand 2>/dev/null >/dev/null
check_status "State management and data fetching"

npm ls react-icons react-dropzone react-hook-form 2>/dev/null >/dev/null
check_status "UI component libraries"

# Check for Chakra UI (should NOT exist)
npm ls @chakra-ui/react 2>/dev/null >/dev/null
if [ $? -ne 0 ]; then
    echo -e "${GREEN}✓${NC} Chakra UI properly removed"
else
    echo -e "${RED}✗${NC} Chakra UI still present (should be removed)"
    ((ERRORS++))
fi

echo ""
echo "3️⃣ Checking Backend Dependencies..."
echo "-----------------------------------"
cd ../backend
npm ls express cors dotenv 2>/dev/null >/dev/null
check_status "Core backend dependencies"

npm ls jsonwebtoken bcryptjs 2>/dev/null >/dev/null
check_status "Authentication dependencies"

npm ls mongodb mongoose 2>/dev/null >/dev/null
check_status "Database dependencies"

cd ..

echo ""
echo "4️⃣ Checking Environment Variables..."
echo "------------------------------------"
check_file "frontend-new/.env.example" "Frontend env example"

if [ -f "frontend-new/.env" ]; then
    echo -e "${YELLOW}⚠${NC} .env file exists (check if it should be in git)"
    ((WARNINGS++))
fi

echo ""
echo "5️⃣ Checking Docker Configuration..."
echo "-----------------------------------"
check_file "Dockerfile" "Dockerfile"
check_file "docker-compose.yml" "Docker Compose file"

# Check if Docker is installed
docker --version 2>/dev/null >/dev/null
check_status "Docker installed"

# Check if Docker is running
docker ps 2>/dev/null >/dev/null
check_status "Docker daemon running"

echo ""
echo "6️⃣ Running Frontend Build Test..."
echo "---------------------------------"
cd frontend-new
npm run build 2>/dev/null >/dev/null
check_status "Frontend build successful"

# Check if dist folder was created
check_dir "dist" "Build output directory"

cd ..

echo ""
echo "7️⃣ Checking Git Status..."
echo "-------------------------"
UNCOMMITTED=$(git status --porcelain | wc -l)
if [ $UNCOMMITTED -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No uncommitted changes"
else
    echo -e "${YELLOW}⚠${NC} $UNCOMMITTED uncommitted files"
    ((WARNINGS++))
fi

# Check current branch
BRANCH=$(git branch --show-current)
echo -e "Current branch: ${YELLOW}$BRANCH${NC}"

echo ""
echo "8️⃣ Checking Security..."
echo "----------------------"
cd frontend-new
npm audit --audit-level=high 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No high severity vulnerabilities"
else
    echo -e "${YELLOW}⚠${NC} Security vulnerabilities found"
    ((WARNINGS++))
fi

cd ../backend
npm audit --audit-level=high 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend: No high severity vulnerabilities"
else
    echo -e "${YELLOW}⚠${NC} Backend: Security vulnerabilities found"
    ((WARNINGS++))
fi

cd ..

echo ""
echo "9️⃣ Checking TypeScript..."
echo "------------------------"
cd frontend-new
npx tsc --noEmit 2>/dev/null
check_status "TypeScript compilation"

cd ..

echo ""
echo "🔟 Checking API Endpoints..."
echo "---------------------------"
check_file "api/index.js" "API entry point"
check_file "backend/server.js" "Backend server file"

echo ""
echo "========================================="
echo "📊 HEALTH CHECK SUMMARY"
echo "========================================="
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed! Ready for production.${NC}"
    exit 0
else
    echo -e "${RED}❌ Health check failed! Please fix errors before deploying.${NC}"
    exit 1
fi