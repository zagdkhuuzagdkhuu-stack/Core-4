import express from "express";
import cors from "cors";
import authRoutes from "./router/auth.router";
import errorHandler from "./middleware/error.middleware";

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json());
app.use(errorHandler);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "AI Contract Backend is running" });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
export default app;
