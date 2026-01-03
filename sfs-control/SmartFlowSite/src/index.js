#!/usr/bin/env node
console.log("ok");
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("🚀 SmartFlowSite is running");
});

app.listen(PORT, () => {
  console.log(`✅ SmartFlowSite running at http://localhost:${PORT}`);
});