import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { db } from "../db.ts";

const router = new Router();

// Registrierung
router.post("/api/auth/register", async (ctx) => {
	const body = ctx.request.body({ type: "json" });
	const { username, password } = await body.value;

	if (!username || !password) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Username und Passwort erforderlich." };
		return;
	}

	const exists = [
		...db.query("SELECT id FROM users WHERE username = ?", [username]),
	];

	if (exists.length > 0) {
		ctx.response.status = 409;
		ctx.response.body = { message: "Nutzername bereits vergeben." };
		return;
	}

	const hashed = await bcrypt.hash(password);

	db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
		username,
		hashed,
	]);

	ctx.response.status = 201;
	ctx.response.body = { message: "Registrierung erfolgreich." };
});

// Login
router.post("/api/auth/login", async (ctx) => {
	const body = ctx.request.body({ type: "json" });
	const { username, password } = await body.value;

	if (!username || !password) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Username und Passwort erforderlich." };
		return;
	}

	const rows = [
		...db.query("SELECT id, password FROM users WHERE username = ?", [
			username,
		]),
	];

	if (rows.length === 0) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}

	const [userId, hashedPw] = rows[0];
	const valid = await bcrypt.compare(password, String(hashedPw));

	if (!valid) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}

	ctx.response.status = 200;
	ctx.response.body = { message: "Login erfolgreich!", userId };
});

export default router;
