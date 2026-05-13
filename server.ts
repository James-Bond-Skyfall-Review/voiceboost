import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

/**
 * Gemini Live API implementation for VoiceTutor AI.
 * This server acts as a bridge between the client and Google's Multimodal Live API.
 */

const app = express();
const PORT = 3000;

// Shared Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // WebSocket Server for Live API bridge
  const wss = new WebSocketServer({ server, path: '/ws-live' });

  wss.on("connection", async (clientWs: WebSocket) => {
    console.log("Client connected to Voice WebSocket");
    
    let session: any = null;

    clientWs.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle Setup
        if (message.type === 'setup') {
          const { proficiency } = message;
          const systemInstruction = `
            You are a helpful and encouraging AI Voice Tutor. 
            User proficiency: ${proficiency}. 
            Speak clearly and appropriate for this level. 
            Keep responses concise (1-3 sentences).
            Use [FEEDBACK] and [TRANSLATE] tags if needed.
          `;

          session = await ai.live.connect({
            model: "gemini-3.1-flash-live-preview", // "native audio" as per skill
            callbacks: {
              onmessage: (msg: LiveServerMessage) => {
                // Relay audio and transcription back to client
                const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                const transcription = msg.serverContent?.modelTurn?.parts[0]?.text;
                
                if (audio) {
                  clientWs.send(JSON.stringify({ type: 'audio', data: audio }));
                }
                if (transcription) {
                  clientWs.send(JSON.stringify({ type: 'transcription', data: transcription }));
                }
                if (msg.serverContent?.interrupted) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }
              },
            },
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
              },
              systemInstruction,
              outputAudioTranscription: {},
              inputAudioTranscription: {},
            },
          });
          
          console.log("Gemini Live Session connected");
          clientWs.send(JSON.stringify({ type: 'ready' }));
          return;
        }

        // Handle Audio Input
        if (message.type === 'audio' && session) {
          session.sendRealtimeInput({
            audio: { data: message.data, mimeType: "audio/pcm;rate=16000" },
          });
        }
      } catch (err) {
        console.error("WebSocket Message Error:", err);
      }
    });

    clientWs.on("close", () => {
      console.log("Client disconnected");
      if (session) {
        // session.close(); // Not always available as method depending on SDK version internals, but let it GC
      }
    });
  });
}

startServer();
