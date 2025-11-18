import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const db = new DB("./datenbank/workouts.db");
// Erstelle Lexikon-Tabelle, falls nicht vorhanden
db.query(`CREATE TABLE IF NOT EXISTS lexicon (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term TEXT UNIQUE,
  definition TEXT
)`);

const router = new Router();

// Lexikon Eintrag anlegen (Create)
router.post("/api/lexicon", async (ctx) => {
	const { value } = await ctx.request.body({ type: "json" });
	const { term, definition } = await value;

	if (!term || !definition) {
		ctx.response.status = 400;
		ctx.response.body = { message: "Begriff und Definition erforderlich." };
		return;
	}

	const exists = [
		...db.query("SELECT id FROM lexicon WHERE term = ?", [term]),
	];
	if (exists.length > 0) {
		ctx.response.status = 409;
		ctx.response.body = { message: "Begriff ist bereits angelegt." };
		return;
	}

	db.query("INSERT INTO lexicon (term, definition) VALUES (?, ?)", [
		term,
		definition,
	]);
	ctx.response.status = 201;
	ctx.response.body = { message: "Eintrag erfolgreich erstellt!" };
});

// Alle Lexikon-Einträge ausgeben (Read all)
router.get("/api/lexicon", (ctx) => {
	const entries = [...db.query("SELECT id, term, definition FROM lexicon")]
		.map(
			([id, term, definition]) => ({ id, term, definition }),
		);
	ctx.response.body = entries;
});

// Einzelnen Eintrag anzeigen (Read single)
router.get("/api/lexicon/:id", (ctx) => {
	const id = ctx.params.id;
	if (!id) {
		ctx.response.status = 400;
		ctx.response.body = { message: "ID erforderlich" };
		return;
	}
	const row = [
		...db.query("SELECT id, term, definition FROM lexicon WHERE id = ?", [
			id,
		]),
	];
	if (row.length === 0) {
		ctx.response.status = 404;
		ctx.response.body = { message: "Eintrag nicht gefunden" };
		return;
	}
	const [entryId, term, definition] = row[0];
	ctx.response.body = { id: entryId, term, definition };
});

// Eintrag aktualisieren (Update)
router.put("/api/lexicon/:id", async (ctx) => {
	const id = ctx.params.id;
	const { value } = await ctx.request.body({ type: "json" });
	const { term, definition } = await value;

	if (!id || !term || !definition) {
		ctx.response.status = 400;
		ctx.response.body = {
			message: "ID, Begriff und Definition erforderlich.",
		};
		return;
	}

	const exists = [...db.query("SELECT id FROM lexicon WHERE id = ?", [id])];
	if (exists.length === 0) {
		ctx.response.status = 404;
		ctx.response.body = { message: "Eintrag nicht gefunden" };
		return;
	}

	db.query("UPDATE lexicon SET term = ?, definition = ? WHERE id = ?", [
		term,
		definition,
		id,
	]);
	ctx.response.body = { message: "Eintrag aktualisiert" };
});

// Eintrag löschen (Delete)
router.delete("/api/lexicon/:id", (ctx) => {
	const id = ctx.params.id;
	if (!id) {
		ctx.response.status = 400;
		ctx.response.body = { message: "ID erforderlich" };
		return;
	}
	const exists = [...db.query("SELECT id FROM lexicon WHERE id = ?", [id])];
	if (exists.length === 0) {
		ctx.response.status = 404;
		ctx.response.body = { message: "Eintrag nicht gefunden" };
		return;
	}
	db.query("DELETE FROM lexicon WHERE id = ?", [id]);
	ctx.response.body = { message: "Eintrag gelöscht" };
});

export default router;
