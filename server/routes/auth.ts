import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

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

	// User laden (oder [] wenn Datei leer)
	let users: Array<any> = [];
	try {
		const raw = await Deno.readTextFile("./db/users.json");
		users = JSON.parse(raw);
	} catch (_) {
		users = [];
	}

	// Existiert der Nutzer?
	if (users.some((u) => u.username === username)) {
		ctx.response.status = 409;
		ctx.response.body = { message: "Username ist schon vergeben." };
		return;
	}

	// Passwort hashen
	const hash = await bcrypt.hash(password);
	users.push({ username, password: hash });
	await Deno.writeTextFile("./db/users.json", JSON.stringify(users, null, 2));
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

	let users = [];
	try {
		const raw = await Deno.readTextFile("./db/users.json");
		users = JSON.parse(raw);
	} catch (_) {
		users = [];
	}

	// Prüfe Username und Passwort
	const user = users.find((u) => u.username === username);
	if (!user) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}

	// Passwort prüfen
	const valid = await bcrypt.compare(password, user.password);
	if (!valid) {
		ctx.response.status = 401;
		ctx.response.body = { message: "Nutzername oder Passwort falsch." };
		return;
	}

	ctx.response.status = 200;
	ctx.response.body = { message: "Login erfolgreich!" };
});

export default router;
