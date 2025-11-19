import { Application } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import authRouter from "./routes/auth.ts";
import lexiconRouter from "./routes/lexicon.ts";

const PORT = 8000;

console.log("🚀 Starte Server...");

const app = new Application();

app.use(oakCors());
console.log("✅ CORS Middleware aktiviert");

// Auth-Router
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
console.log("✅ Auth-Router geladen");

// Lexicon-Router
app.use(lexiconRouter.routes());
app.use(lexiconRouter.allowedMethods());
console.log("✅ Lexicon-Router geladen");

// 404 Middleware
app.use((ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "🚫 Nicht gefunden";
});

// Server starten – WICHTIG: mit await!
console.log(`🎯 Server läuft auf http://localhost:${PORT}`);
await app.listen({ port: PORT });
