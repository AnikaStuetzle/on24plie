// server/routes/sessions.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db.ts";

const router = new Router();

// Alle Trainings holen
router.get("/api/sessions", (ctx) => {
	const rows = [
		...db.query(
			"SELECT id, date, duration, notes, intensity FROM sessions ORDER BY date DESC",
		),
	];

	const result = rows.map(([id, date, duration, notes, intensity]) => ({
		id,
		date,
		duration,
		notes,
		intensity,
	}));

	ctx.response.body = result;
});

// Neues Training anlegen
router.post("/api/sessions", async (ctx) => {
	const body = ctx.request.body({ type: "json" });
	const { date, duration, notes, intensity } = await body.value;

	if (!date || !duration || !intensity) {
		ctx.response.status = 400;
		ctx.response.body = {
			message: "Datum, Dauer und Anstrengung erforderlich.",
		};
		return;
	}

	db.query(
		"INSERT INTO sessions (date, duration, notes, intensity) VALUES (?, ?, ?, ?)",
		[date, duration, notes ?? "", intensity],
	);

	const idRow = [...db.query("SELECT last_insert_rowid()")][0];
	const newId = idRow?.[0];

	ctx.response.status = 201;
	ctx.response.body = { id: newId };
});

// Training aktualisieren
router.put("/api/sessions/:id", async (ctx) => {
	const idParam = ctx.params.id;
	const id = idParam ? Number(idParam) : NaN;

	if (!Number.isFinite(id)) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Ungültige ID." };
		return;
	}

	const body = ctx.request.body({ type: "json" });
	const { date, duration, notes, intensity } = await body.value;

	const exists = [...db.query("SELECT id FROM sessions WHERE id = ?", [id])];

	if (exists.length === 0) {
		ctx.response.status = 404;
		ctx.response.body = { message: "Training nicht gefunden." };
		return;
	}

	db.query(
		"UPDATE sessions SET date = ?, duration = ?, notes = ?, intensity = ? WHERE id = ?",
		[date, duration, notes ?? "", intensity, id],
	);

	ctx.response.body = { message: "Training aktualisiert." };
});

// Training löschen (falls du später einen Löschen Button willst)
router.delete("/api/sessions/:id", (ctx) => {
	const idParam = ctx.params.id;
	const id = idParam ? Number(idParam) : NaN;

	if (!Number.isFinite(id)) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Ungültige ID." };
		return;
	}

	db.query("DELETE FROM sessions WHERE id = ?", [id]);

	ctx.response.body = { message: "Training gelöscht." };
});

export default router;
