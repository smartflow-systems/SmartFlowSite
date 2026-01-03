#!/bin/bash
set -euo pipefail

# Use Replit port
export PORT=${PORT:-3000}

# Kill any existing process on $PORT
fuser -k $PORT/tcp || true

# Start Node server in background
echo "Starting Node server on port $PORT..."
node server.js &

# Give Node a moment to start
sleep 2

# Start Stripe CLI listener
echo "Starting Stripe listener..."
stripe listen --forward-to "https://${REPL_SLUG}.${REPL_OWNER}.repl.co/api/stripe/webhook" &
