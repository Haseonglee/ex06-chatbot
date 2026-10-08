// Hono 서버 켜기 — 앱(server/app.ts)을 불러와 8787에서 켬
import { serve } from "@hono/node-server";
import { app } from "./app";

serve({ fetch: app.fetch, port: 8787 });
console.log("Hono 서버: http://localhost:8787");
