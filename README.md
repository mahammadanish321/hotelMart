# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:


## React Compiler

# HostelMart frontend

React + Vite marketplace frontend.

## Local development

Run `npm install`, copy `.env.example` to `.env.local`, set `VITE_API_URL=http://localhost:5000/api`, and start with `npm run dev`.

## Deploy to Vercel

Import this repository into Vercel. Use the repository root, Vite framework preset, build command `npm run build`, and output directory `dist`.

Set the Vercel environment variable `VITE_API_URL` to the deployed API URL ending in `/api` (for example `https://your-api.onrender.com/api`) for Production and Preview environments, then redeploy.

The API is deployed separately as a Node web service; see the backend repository README. Never put database or Cloudinary secrets in frontend environment variables.
