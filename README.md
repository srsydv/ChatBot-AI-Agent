# ChatBot AI Agent (Ask Merlin)

A full-stack AI chat app with optional login. Users can chat as guests (responses not saved) or log in to save chat history. OTP login is supported via **SMTP** and **Supabase** in the backend.

---

## Features

- **Guest chat** – Anyone can chat without logging in; responses are not saved.
- **Saved chats** – Logged-in users get chat history, sidebar list, and persistence (MongoDB).
- **OTP login** – Email one-time password: backend supports **SMTP** (e.g. Gmail/Nodemailer) and **Supabase Auth** (magic link / OTP). Frontend uses Supabase when configured; otherwise falls back to backend send-OTP/verify-OTP.
- **Password login** – Email + password register/login with JWT.
- **OpenAI** – Chat powered by OpenAI (e.g. GPT) with conversation context.

---

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, OpenAI API.
- **Auth / OTP:** Nodemailer (SMTP), Supabase Auth (optional).
- **Frontend:** React (Vite), Tailwind CSS.

---

## Auth & OTP: SMTP and Supabase

The backend includes **both** SMTP and Supabase for OTP so you can choose what to use and work around rate limits:

- **SMTP (Nodemailer)** – Configure Gmail or another SMTP in `.env`. Good for local/dev; many cloud hosts (e.g. Render) block outbound SMTP, so it may not work in production there.
- **Supabase** – OTP/magic link via Supabase Auth. Free tier has strict limits (e.g. 2 emails/hour, 1 OTP per minute per email). **Because of these rate limits**, you may not be able to test every flow frequently; for production, consider Supabase custom SMTP or your own SMTP.

Frontend: if Supabase env vars are set, it uses Supabase for OTP and magic-link callback; otherwise it uses the backend `/api/auth/send-otp` and `/api/auth/verify-otp` (which use the SMTP/email service).

---

## Setup

1. **Clone and install**
   ```bash
   cd "AI Agent"
   npm install
   ```

2. **Backend `.env`** (root)
   - `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`
   - Optional OTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (and `SMTP_FROM` if needed)
   - Optional Supabase (for backend exchange): `SUPABASE_JWT_SECRET`

3. **Frontend `.env`** (inside `frontend/`)
   - `VITE_API_URL` – leave empty for local (Vite proxy to backend); set to backend URL for production.
   - Optional Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

4. **Run**
   - Backend: `npm run dev`
   - Frontend: `npm run dev:frontend` (or `cd frontend && npm run dev`)
   - App: http://localhost:5173

---

## Deployment

- **Backend** – e.g. Render; set env vars (MongoDB, JWT, OpenAI, optional Supabase JWT secret; SMTP often blocked on Render).
- **Frontend** – e.g. Vercel; set `VITE_API_URL` to backend URL and optional Supabase vars.

---

## Note on Rate Limits

Supabase free tier limits OTP emails (e.g. 2 per hour globally, 1 per minute per email). SMTP may be blocked on some hosts. Both options are in the code so you can switch or combine as needed; for heavier use, configure custom SMTP in Supabase or use a dedicated email provider.
