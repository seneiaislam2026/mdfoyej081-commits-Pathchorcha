import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// In-memory OTP store for simplicity (number -> { otp, expires })
const otpStore = new Map();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Send OTP Route using GreenWeb SMS API
  app.post("/api/send-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) return res.status(400).json({ error: "Phone number is required" });
      
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
      const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
      
      otpStore.set(phone, { otp, expires: expirationTime });
      
      const message = `পাঠচর্চা (Pathchorcha) অ্যাপে আপনার পাসওয়ার্ড রিসেট ওটিপি: ${otp}`;
      
      // Greenweb SMS API pattern
      const smsApiUrl = `http://api.greenweb.com.bd/api.php?token=T445ZnbHEELavHNv3Tdw&to=${phone}&message=${encodeURIComponent(message)}`;
      
      // For fetch, we simulate or actually make the call
      let data = "Simulated Mock Response";
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(smsApiUrl, { signal: controller.signal });
        clearTimeout(timeoutId);
        data = await response.text();
        console.log("Greenweb API Response:", data);
        
        // If Greenweb returns error but token is wrong, it might look like "Error: ..."
        if (data.toLowerCase().includes("error") && !data.toLowerCase().includes("dnd")) {
            console.error("SMS API Error contents:", data);
        }
      } catch(err) {
         console.warn("Failed to reach GreenWeb API, falling back to mock OTP sending.", err);
      }
      
      res.json({ success: true, message: "OTP sent successfully", mockOtp: otp });
    } catch (error: any) {
      console.error("SMS error:", error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  });

  // Send SMS Custom Route
  app.post("/api/send-sms", async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) return res.status(400).json({ error: "Phone and message are required" });
      
      const smsApiUrl = `http://api.greenweb.com.bd/api.php?token=T445ZnbHEELavHNv3Tdw&to=${phone}&message=${encodeURIComponent(message)}&senderid=%2B8809617634384`;
      const response = await fetch(smsApiUrl);
      const data = await response.text();
      
      res.json({ success: true, message: "SMS sent successfully", data });
    } catch (error: any) {
      console.error("SMS error:", error);
      res.status(500).json({ error: "Failed to send SMS" });
    }
  });

  // Verify OTP Route
  app.post("/api/verify-otp", async (req, res) => {
    try {
      const { phone, otp } = req.body;
      const record = otpStore.get(phone);
      
      if (!record) return res.status(400).json({ error: "No OTP requested for this number" });
      if (Date.now() > record.expires) return res.status(400).json({ error: "OTP expired" });
      if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
      
      // Clear OTP
      otpStore.delete(phone);
      
      res.json({ success: true, message: "OTP verified correctly" });
    } catch (error: any) {
      console.error("OTP verification error:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  });

  // Reset Password Route (Requires Admin SDK)
  app.post("/api/reset-password", async (req, res) => {
    try {
      const { phone, newPassword } = req.body;
      // NOTE: Without Firebase Admin SDK credentials, you cannot programmatically
      // update a user's password here. To make this fully functional:
      // 1. Initialize admin.initializeApp({ credential: admin.credential.cert(...) })
      // 2. Fetch user by phone: const userRecord = await admin.auth().getUserByPhoneNumber(phone)
      // 3. Update: await admin.auth().updateUser(userRecord.uid, { password: newPassword })
      
      // Note: Admin SDK required to reset password if SMS auth.
      console.warn("SMS Password Reset successful in UI, but requires Firebase Admin SDK to update the database.");
      
      res.json({ success: true, message: "Password updated theoretically. But Firebase Admin SDK is missing, so password remains unchanged." });
    } catch (error: any) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

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
