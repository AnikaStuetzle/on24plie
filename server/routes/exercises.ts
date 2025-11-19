// server/routes/choreos.ts
import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db.ts";

const router = new Router();

// alle Choreos holen
router.get("/api/choreos", (ctx) => {
	const rows = [
		...db.query(
			"SELECT id, name, difficulty, date, notes FROM choreos ORDER BY date DESC",
		),
	];

	const result = rows.map(([id, name, difficulty, date, notes]) => ({
		id,
		name,
		difficulty,
		date,
		notes,
	}));

	ctx.response.body = result;
});

// neue Choreo anlegen
router.post("/api/choreos", async (ctx) => {
	const body = ctx.request.body({ type: "json" });
	const { name, difficulty, date, notes } = await body.value;

	if (!name || !difficulty || !date) {
		ctx.response.status = 400;
		ctx.response.body = {
			message: "Name, Schwierigkeitsgrad und Datum sind erforderlich.",
		};
		return;
	}

	db.query(
		"INSERT INTO choreos (name, difficulty, date, notes) VALUES (?, ?, ?, ?)",
		[name, difficulty, date, notes ?? ""],
	);

	const idRow = [...db.query("SELECT last_insert_rowid()")][0];
	const newId = idRow?.[0];

	ctx.response.status = 201;
	ctx.response.body = { id: newId };
});

// Choreo aktualisieren
router.put("/api/choreos/:id", async (ctx) => {
	const idParam = ctx.params.id;
	const id = idParam ? Number(idParam) : NaN;

	if (!Number.isFinite(id)) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Ungültige ID." };
		return;
	}

	const body = ctx.request.body({ type: "json" });
	const { name, difficulty, date, notes } = await body.value;

	const exists = [...db.query("SELECT id FROM choreos WHERE id = ?", [id])];

	if (exists.length === 0) {
		ctx.response.status = 404;
		ctx.response.body = { message: "Choreografie nicht gefunden." };
		return;
	}

	db.query(
		"UPDATE choreos SET name = ?, difficulty = ?, date = ?, notes = ? WHERE id = ?",
		[name, difficulty, date, notes ?? "", id],
	);

	ctx.response.body = { message: "Choreografie aktualisiert." };
});

// Choreo löschen
router.delete("/api/choreos/:id", (ctx) => {
	const idParam = ctx.params.id;
	const id = idParam ? Number(idParam) : NaN;

	if (!Number.isFinite(id)) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Ungültige ID." };
		return;
	}

	db.query("DELETE FROM choreos WHERE id = ?", [id]);

	ctx.response.body = { message: "Choreografie gelöscht." };
});

export default router;
