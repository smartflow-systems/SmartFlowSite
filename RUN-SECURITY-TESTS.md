# Quick Start: Security Testing

## Navigate to the correct directory first!

```bash
cd /home/garet/SFS/SmartFlowSite
```

## Option 1: Run Tests Manually (Recommended)

### Terminal 1: Start Main Application
```bash
cd /home/garet/SFS/SmartFlowSite
npm start
```

### Terminal 2: Start Orchestrator
```bash
cd /home/garet/SFS/SmartFlowSite/server/orchestrator
node index.js
```

### Terminal 3: Run Security Tests
```bash
cd /home/garet/SFS/SmartFlowSite
./scripts/security-pentest.sh
```

### Terminal 4: Monitor Security (Optional)
```bash
cd /home/garet/SFS/SmartFlowSite
./scripts/security-monitor.sh
```

## Option 2: Quick Test Script

Run this single command to test the basic security features (doesn't require orchestrator):

```bash
npm start &
SERVER_PID=$!
sleep 3
./scripts/security-pentest.sh http://localhost:3000
kill $SERVER_PID
```

## Option 3: Check If Services Are Running

```bash
# Check if server is running
curl http://localhost:3000/health

# Check if orchestrator is running
curl http://localhost:5001/health
```

## Troubleshooting

**Problem:** `No such file or directory`
- **Solution:** You're in the wrong directory. Run `cd /home/garet/SFS/SmartFlowSite`

**Problem:** `Cannot find module`
- **Solution:** The orchestrator path is different. Just run main app with `npm start`

**Problem:** Tests are skipped
- **Solution:** Some tests require the orchestrator. That's okay - main app tests will still run.

## Just Want to See It Work?

Run this simple test:

```bash
cd /home/garet/SFS/SmartFlowSite
npm start &
sleep 3
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"invalid@@@@email"}'
# Should return: "Invalid email format" (ReDoS protection working!)
```
