const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const contractRoutes = require("./routes/contractRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
