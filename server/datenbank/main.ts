import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { serve } from "https://deno.land/std@0.202.0/http/server.ts";
import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";

const db = new DB("workouts.db");
db.query(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);
db.query(`CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT
)`);

serve(
  async (req) => {
    const url = new URL(req.url);

    // Registrierung
    if (req.method === "POST" && url.pathname === "/register") {
      const { username, password } = await req.json();
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "Username und Passwort erforderlich" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const userExists = [
        ...db.query("SELECT id FROM users WHERE username = ?", [username]),
      ];
      if (userExists.length > 0) {
        return new Response(
          JSON.stringify({ error: "Username schon vergeben" }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const hashed = await hash(password);
      db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
        username,
        hashed,
      ]);
      return new Response(JSON.stringify({ success: true }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Login
    if (req.method === "POST" && url.pathname === "/login") {
      const { username, password } = await req.json();
      if (!username || !password) {
        return new Response(
          JSON.stringify({ error: "Username und Passwort erforderlich" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      const userRow = [
        ...db.query("SELECT id, password FROM users WHERE username = ?", [
          username,
        ]),
      ];
      if (userRow.length === 0) {
        return new Response(JSON.stringify({ error: "User nicht gefunden" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      const [userId, hashedPassword] = userRow[0];
      const valid = await compare(password, hashedPassword);
      if (!valid) {
        return new Response(JSON.stringify({ error: "Falsches Passwort" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, userId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found!", { status: 404 });
  },
  { port: 8010 }
);
