#!/bin/bash

# This script helps set up Serverless Framework v4 for local development and CI/CD

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up Serverless Framework v4${NC}"

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo -e "${RED}Serverless Framework is not installed globally.${NC}"
    echo -e "Installing Serverless Framework globally..."
    npm install -g serverless
fi

# Get the current serverless version
SLS_VERSION=$(serverless --version 2>&1 | grep -o "Serverless.*" | head -1 | cut -d' ' -f3)

echo -e "${GREEN}Serverless Framework version: ${SLS_VERSION}${NC}"

# Check for Node.js version
NODE_VERSION=$(node -v)
echo -e "${GREEN}Node.js version: ${NODE_VERSION}${NC}"

# Recommend using Node.js 22.x
if [[ $NODE_VERSION != v22* ]]; then
    echo -e "${YELLOW}Warning: We recommend using Node.js 22.x for this project.${NC}"
    echo -e "You can use nvm to switch to Node.js 22:"
    echo -e "  nvm use 22"
fi

# Check if serverless-offline is installed
if ! npm list serverless-offline | grep -q "serverless-offline"; then
    echo -e "${RED}serverless-offline is not installed.${NC}"
    echo -e "Installing serverless-offline..."
    npm install serverless-offline --save-dev
fi

echo ""
echo -e "${YELLOW}Authentication Options for Serverless Framework v4:${NC}"
echo ""
echo -e "1. ${GREEN}Interactive Login (Development):${NC}"
echo -e "   Run: serverless login"
echo ""
echo -e "2. ${GREEN}Non-Interactive Authentication (CI/CD):${NC}"
echo -e "   a. Get an access key from https://app.serverless.com/"
echo -e "   b. Set it as an environment variable:"
echo -e "      export SERVERLESS_ACCESS_KEY=your-access-key-here"
echo ""
echo -e "${YELLOW}Commands to Run Serverless:${NC}"
echo -e "- Local development: ${GREEN}npm run sls${NC}"
echo -e "- Deploy to AWS: ${GREEN}npm run deploy${NC}"
echo -e "- Debug mode: ${GREEN}npm run sls:debug${NC}"

# Ask if the user wants to login now
echo ""
read -p "Do you want to login to Serverless Dashboard now? (y/n): " choice
if [[ $choice == "y" || $choice == "Y" ]]; then
    serverless login
else
    echo -e "${GREEN}You can login later by running 'serverless login'${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}" 