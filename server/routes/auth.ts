import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("./datenbank/workouts.db");
db.query(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

const router = new Router();

router.post("/api/auth/register", async (ctx) => {
	const { value } = await ctx.request.body({ type: "json" });
	const data = await value;
	const { username, password } = data;
	if (!username || !password) {
		ctx.response.status = 400;
		ctx.response.body = {
			message: "Nutzername und Passwort erforderlich.",
		};
		return;
	}
	// Prüfe, ob der Nutzername existiert (in der Datenbank!)
	const userExists = [
		...db.query("SELECT id FROM users WHERE username = ?", [username]),
	];
	if (userExists.length > 0) {
		ctx.response.status = 409;
		ctx.response.body = { message: "Username ist schon vergeben." };
		return;
	}
	// Passwort hashen und User speichern
	const hash = await bcrypt.hash(password);
	db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
		username,
		hash,
	]);
	ctx.response.status = 201;
	ctx.response.body = { message: "Registrierung erfolgreich!" };
});

router.post("/api/auth/login", async (ctx) => {
	const { value } = await ctx.request.body({ type: "json" });
	const data = await value;
	const { username, password } = data;
	if (!username || !password) {
		ctx.response.status = 400;
		ctx.response.body = {
			message: "Nutzername und Passwort erforderlich.",
		};
		return;
	}
	// User aus Datenbank laden
	const userRow = [
		...db.query("SELECT id, password FROM users WHERE username = ?", [
			username,
		]),
	];
	if (userRow.length === 0) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}
	const [userId, hashedPw] = userRow[0];
	const valid = await bcrypt.compare(password, hashedPw);
	if (!valid) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}
	ctx.response.status = 200;
	ctx.response.body = { message: "Login erfolgreich!", userId };
});

export default router;
