#!/bin/bash
set -euo pipefail

# ==============================================================================
# SmartFlow Systems - Security Monitoring Script
# ==============================================================================
# Monitors application logs for security-related events and warnings
# Run this after deploying security fixes to ensure no issues
#
# Usage:
#   ./scripts/security-monitor.sh [log-file]
#
# If no log file specified, monitors the application in real-time

LOG_FILE="${1:-}"
ALERT_COUNT=0
WARNING_COUNT=0

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "════════════════════════════════════════════════════════════════"
echo "🔒 SmartFlow Security Monitor"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Security patterns to watch for
declare -A PATTERNS=(
  ["CRITICAL_SECRET"]="⛔ CRITICAL: Missing or insecure secrets"
  ["JWT_SECRET"]="⚠️  CRITICAL: JWT_SECRET not set"
  ["REDOS_ATTACK"]="ReDoS attack detected"
  ["PROTOTYPE_POLLUTION"]="Forbidden property:"
  ["RATE_LIMIT"]="Too many requests"
  ["INVALID_TOKEN"]="Invalid or expired token"
  ["AUTH_FAILED"]="Authentication required"
  ["VALIDATION_ERROR"]="Invalid.*format|Unauthorized action"
  ["FILE_TRAVERSAL"]="path traversal detected"
  ["WORKFLOW_VALIDATION"]="Workflow.*too large|Invalid workflow"
  ["LOG_INJECTION"]="sanitizeForLog"
  ["SECURITY_ERROR"]="SECURITY:|security"
)

# Function to analyze a log line
analyze_line() {
  local line="$1"

  # Critical alerts
  if echo "$line" | grep -qE "${PATTERNS[CRITICAL_SECRET]}"; then
    echo -e "${RED}🚨 CRITICAL ALERT${NC}: $line"
    ((ALERT_COUNT++))
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[JWT_SECRET]}"; then
    echo -e "${RED}🚨 CRITICAL ALERT${NC}: $line"
    ((ALERT_COUNT++))
    return
  fi

  # Security warnings
  if echo "$line" | grep -qE "${PATTERNS[REDOS_ATTACK]}"; then
    echo -e "${YELLOW}⚠️  SECURITY WARNING${NC}: Possible ReDoS attempt"
    ((WARNING_COUNT++))
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[PROTOTYPE_POLLUTION]}"; then
    echo -e "${YELLOW}⚠️  SECURITY WARNING${NC}: Prototype pollution attempt blocked"
    ((WARNING_COUNT++))
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[RATE_LIMIT]}"; then
    echo -e "${BLUE}ℹ️  RATE LIMIT${NC}: Rate limit triggered"
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[INVALID_TOKEN]}"; then
    echo -e "${BLUE}ℹ️  AUTH${NC}: Invalid authentication attempt"
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[VALIDATION_ERROR]}"; then
    echo -e "${YELLOW}⚠️  VALIDATION${NC}: Input validation error"
    ((WARNING_COUNT++))
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[FILE_TRAVERSAL]}"; then
    echo -e "${RED}🚨 SECURITY ALERT${NC}: Path traversal attempt blocked"
    ((ALERT_COUNT++))
    return
  fi

  if echo "$line" | grep -qE "${PATTERNS[WORKFLOW_VALIDATION]}"; then
    echo -e "${YELLOW}⚠️  VALIDATION${NC}: Workflow validation triggered"
    ((WARNING_COUNT++))
    return
  fi

  # Informational - security features working
  if echo "$line" | grep -q "✅ Production secrets validated"; then
    echo -e "${GREEN}✅ SECURITY${NC}: Production secrets validated successfully"
    return
  fi

  if echo "$line" | grep -q "✅ Workflow engine initialized"; then
    echo -e "${GREEN}✅ SECURITY${NC}: Workflow engine initialized with security protections"
    return
  fi
}

# Function to monitor in real-time
monitor_realtime() {
  echo "📡 Monitoring application logs in real-time..."
  echo "   Press Ctrl+C to stop"
  echo ""

  # Start the application and monitor its output
  npm start 2>&1 | while IFS= read -r line; do
    echo "$line"
    analyze_line "$line"
  done
}

# Function to analyze log file
analyze_logfile() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    echo -e "${RED}Error:${NC} Log file '$file' not found"
    exit 1
  fi

  echo "📊 Analyzing log file: $file"
  echo ""

  while IFS= read -r line; do
    analyze_line "$line"
  done < "$file"
}

# Main execution
if [[ -z "$LOG_FILE" ]]; then
  monitor_realtime
else
  analyze_logfile "$LOG_FILE"
fi

# Summary report
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📋 Security Monitoring Summary"
echo "════════════════════════════════════════════════════════════════"
echo -e "🚨 Critical Alerts: ${RED}$ALERT_COUNT${NC}"
echo -e "⚠️  Warnings: ${YELLOW}$WARNING_COUNT${NC}"
echo ""

if [[ $ALERT_COUNT -gt 0 ]]; then
  echo -e "${RED}⛔ Action Required:${NC} Critical security issues detected!"
  echo "   Review alerts above and investigate immediately."
  exit 1
elif [[ $WARNING_COUNT -gt 0 ]]; then
  echo -e "${YELLOW}⚠️  Attention:${NC} Security warnings detected."
  echo "   Review warnings and verify security controls are working as expected."
  exit 0
else
  echo -e "${GREEN}✅ All Clear:${NC} No security issues detected."
  exit 0
fi
