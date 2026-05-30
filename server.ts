import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Tutor Route
  app.post("/api/tutor", async (req, res) => {
    try {
      const { messages } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is missing on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const systemInstruction = `You are a helpful and polite AI Tutor. You must only answer questions related to education, studying, and academics. If the user asks something outside of these domains, politely decline and remind them that you are an educational tutor. Respond in Bengali, neatly formatted, and easy for students to understand. Be encouraging and provide clear, step-by-step explanations when needed. Do not use 'নমস্কার' (namaskar) as a greeting. You can use 'হ্যালো' (Hello) or 'আসসালামু আলাইকুম' (Assalamu Alaikum), or just directly answer the question without a greeting.`;

      // Format history for Gemini chat API
      const history = messages.slice(0, -1).map((msg: any) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));
      
      const lastUserMsg = messages[messages.length - 1];
      const messageParts: any[] = [];
      
      if (lastUserMsg.image) {
        try {
          const splitData = lastUserMsg.image.split(',');
          const mimeType = splitData[0].match(/:(.*?);/)[1];
          const base64Data = splitData[1];
          
          messageParts.push({
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          });
        } catch (e) {
          console.error("Error parsing image:", e);
        }
      }
      
      messageParts.push({ text: lastUserMsg.text || "Explain this image related to my studies." });

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
        },
        history: history,
      });

      const response = await chat.sendMessage({ message: messageParts });
      
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Something went wrong." });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
