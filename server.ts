import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  const rooms = new Map<string, { nextNumber?: number }>();

  let ai: GoogleGenAI | null = null;
  try {
    if (process.env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
  } catch (e) {
    console.error("Gemini failed to initialize", e);
  }

  app.post("/api/ocr", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API not configured" });
      }

      const { imageBase64 } = req.body;
      if (!imageBase64) return res.status(400).json({ error: "No image provided" });

      const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
      const mimeType = imageBase64.match(/^data:(image\/(png|jpeg|jpg));base64,/)?.[1] || "image/jpeg";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Extract all the printed numbers from this Tambola (Bingo) ticket image. Return ONLY a JSON array of the numbers (integers), like [5, 12, 34, 55], with no markdown formatting or other text.",
              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType,
                },
              },
            ],
          },
        ],
      });

      const text = response.text || "";
      const matches = text.match(/\[(.*?)\]/s);
      let numbers: number[] = [];
      if (matches) {
          numbers = JSON.parse(`[${matches[1]}]`);
      } else {
          numbers = JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
      }

      res.json({ numbers });
    } catch (error) {
      console.error("OCR Error:", error);
      res.status(500).json({ error: "Failed to extract numbers" });
    }
  });

  app.post("/api/room", (req, res) => {
    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    rooms.set(roomId, {});
    res.json({ roomId });
  });

  app.get("/api/room/:id", (req, res) => {
    const room = rooms.get(req.params.id.toUpperCase());
    if (!room) return res.status(404).json({ error: "Room not found" });

    const nextNumber = room.nextNumber;
    if (nextNumber) {
      room.nextNumber = undefined;
    }

    res.json({ nextNumber });
  });

  app.post("/api/room/:id/next", (req, res) => {
    const room = rooms.get(req.params.id.toUpperCase());
    if (!room) return res.status(404).json({ error: "Room not found" });

    room.nextNumber = req.body.number;
    res.json({ success: true });
  });

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
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
