#!/bin/bash

# Script to install dependencies for the Lambda layer
cd dependencies/nodejs
npm install --production
cd ../..

echo "Dependencies installed successfully!" 