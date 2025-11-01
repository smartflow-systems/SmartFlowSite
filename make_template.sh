#!/bin/bash
# Smartflow Systems Repo Template Creator

mkdir -p src api config scripts docs
touch README.md Dockerfile
echo "# Smartflow Systems Project" > README.md
echo "# Example .env" > config/.env.example
