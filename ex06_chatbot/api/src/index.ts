// Hono 서버 시작 — npm run dev:api
import { serve } from "@hono/node-server";
import app from "./app";

serve({ fetch: app.fetch, port: 8787 });
console.log("Hono API: http://localhost:8787");
