import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import axios from "axios";
import Parser from "rss-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parser = new Parser();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

    const API_URL = process.env.GOOGLE_SHEETS_API_URL?.trim();
    console.log("GOOGLE_SHEETS_API_URL loaded:", API_URL ? "YES" : "NO");

    if (API_URL) {
      console.log("Target API URL:", API_URL.substring(0, 40) + "...");
    }

    // Proxy for Google Sheets to bypass CORS
    app.get("/api/sheets", async (req, res) => {
      if (!API_URL) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_API_URL is not defined in environment." });
      }
      
      try {
        console.log("Fetching data from Google Sheets...");
        const response = await axios.get(`${API_URL}?action=getData`, { timeout: 30000 });
        res.json(response.data);
      } catch (error: any) {
        console.error("Proxy GET Error:", error.message);
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/api/sheets", async (req, res) => {
      if (!API_URL) {
        return res.status(500).json({ error: "GOOGLE_SHEETS_API_URL is not defined in environment." });
      }

      try {
        console.log(`Syncing ${req.body.table || 'data'} to Google Sheets...`);
        const response = await axios.post(API_URL, req.body, {
          headers: { "Content-Type": "application/json" },
          maxRedirects: 5,
          timeout: 45000 // 45 seconds timeout
        });
        
        console.log("Sync response received.");
        res.send(response.data);
      } catch (error: any) {
        console.error("Proxy POST Error:", error.message);
        res.status(500).json({ 
          error: error.message, 
          details: error.response?.data || "Timeout or No response"
        });
      }
    });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
