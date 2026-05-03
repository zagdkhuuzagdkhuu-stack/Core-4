import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "AI Contract Backend is running" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
export default app;
