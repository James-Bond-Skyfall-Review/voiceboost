# VoiceTutor AI

A mobile-first AI Voice Tutor application built with React, Vite, and Google Gemini.

## ⚠️ Security Warning

**FOR PERSONAL USE ONLY.**

This application is designed as a client-side only app for demonstration and personal use. 
It uses the **direct client-side integration** of the Google Generative AI SDK.

**IMPORTANT:**
- The API key (`GEMINI_API_KEY`) is exposed in the browser's network requests.
- DO NOT deploy this application publicly without moving the Gemini API calls to a secure backend.
- The developer is responsible for any API usage costs.

## Features

- **Voice Practicing:** Practice conversation naturally using your microphone.
- **Proficiency Levels:** Choose between Beginner, Intermediate, and Advanced feedback levels.
- **Real-time Feedback:** Get corrections and translations using special AI tags.
- **Speech Controls:** Adjust AI speaking rate.
- **Debug Console:** Track API latency and system logs.

## Setup

1. Rename `.env.example` to `.env`.
2. Add your `GEMINI_API_KEY`.
3. Run `npm install` and `npm run dev`.
