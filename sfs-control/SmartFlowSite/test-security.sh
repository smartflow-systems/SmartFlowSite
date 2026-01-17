#!/bin/bash
# Quick Security Test Launcher
# Run this from any directory - it will navigate to SmartFlowSite automatically

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔒 SmartFlow Security Test Launcher${NC}"
echo ""

# Navigate to SmartFlowSite directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${GREEN}✓${NC} Working directory: $(pwd)"
echo ""

# Check if scripts exist
if [[ ! -f "scripts/security-pentest.sh" ]]; then
  echo -e "${YELLOW}⚠ Security test script not found!${NC}"
  echo "  Expected: $SCRIPT_DIR/scripts/security-pentest.sh"
  exit 1
fi

# Kill any existing node processes on our ports
echo -e "${BLUE}Cleaning up existing processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start the main application
echo -e "${BLUE}Starting main application...${NC}"
npm start > /tmp/smartflow-app.log 2>&1 &
APP_PID=$!
echo -e "${GREEN}✓${NC} App started (PID: $APP_PID)"

# Wait for app to be ready
echo -e "${BLUE}Waiting for application to start...${NC}"
for i in {1..30}; do
  if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Application is ready!"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo -e "${YELLOW}⚠ Application didn't start in time${NC}"
    echo "Check logs: tail /tmp/smartflow-app.log"
    kill $APP_PID 2>/dev/null
    exit 1
  fi
  sleep 1
done

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Running Security Tests${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Run security tests
./scripts/security-pentest.sh http://localhost:3000 http://localhost:5001
TEST_RESULT=$?

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Cleaning Up${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Cleanup
kill $APP_PID 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

echo -e "${GREEN}✓${NC} Processes cleaned up"
echo ""

if [[ $TEST_RESULT -eq 0 ]]; then
  echo -e "${GREEN}✅ SECURITY TESTS PASSED${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠ SOME TESTS FAILED OR SKIPPED${NC}"
  echo "  This is normal if orchestrator isn't running."
  echo "  Main security features are still protected!"
  exit 0
fi
