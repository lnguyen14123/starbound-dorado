import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./api.js"; // <-- import your router

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactDist = path.join(__dirname, "../dist");

// Serve static files from React build
app.use(express.static(reactDist));

app.use("/api", apiRoutes);

// Catch-all: serve index.html for all other routes
app.use((req, res) => {
  console.log("Serving React app...");
  res.sendFile(path.join(reactDist, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
