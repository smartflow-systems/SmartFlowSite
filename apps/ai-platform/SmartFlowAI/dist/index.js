// server/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
var app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "SmartFlowAI backend is running \u{1F680}" });
});
var PORT = process.env.PORT || 3e3;
app.listen(PORT, () => {
  console.log(`\u2705 SmartFlowAI server running on port ${PORT}`);
});
