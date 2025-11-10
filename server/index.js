import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import apiRoutes from "./api.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reactDist = path.join(__dirname, "../dist");

app.use((req, res, next) => {
  next();
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API routes are working!", timestamp: new Date().toISOString() });
});

app.use("/api", (req, res, next) => {
  next();
});
app.use("/api", apiRoutes);

if (existsSync(reactDist)) {
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    const filePath = path.join(reactDist, req.path);
    if (existsSync(filePath) && !filePath.endsWith('.html')) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
}

app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found", path: req.path });
  }
  
  const indexPath = path.join(reactDist, "index.html");
  if (existsSync(reactDist) && existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: "React app not built. Run 'npm run build' first.",
      message: "API endpoints are available at /api/*"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

});
