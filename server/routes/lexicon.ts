import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { db } from "../db.ts";

const router = new Router();

// Alle Einträge holen
router.get("/api/lexicon", (ctx) => {
  const rows = [
    ...db.query("SELECT id, term, definition FROM lexicon ORDER BY term ASC"),
  ];

  const result = rows.map(([id, term, definition]) => ({
    id,
    term,
    definition,
  }));

  ctx.response.body = result;
});

// Neuen Eintrag anlegen
router.post("/api/lexicon", async (ctx) => {
  const body = ctx.request.body({ type: "json" });
  const { term, definition } = await body.value;

  if (!term || !definition) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Term und Definition erforderlich." };
    return;
  }

  try {
    db.query("INSERT INTO lexicon (term, definition) VALUES (?, ?)", [
      term,
      definition,
    ]);

    ctx.response.status = 201;
    ctx.response.body = { message: "Eintrag erstellt." };
  } catch (err) {
    const text = String(err);
    if (text.includes("UNIQUE")) {
      ctx.response.status = 409;
      ctx.response.body = { message: "Begriff existiert bereits." };
    } else {
      console.error("DB Fehler beim INSERT:", err);
      ctx.response.status = 500;
      ctx.response.body = { message: "Interner Fehler." };
    }
  }
});

// Eintrag bearbeiten
router.put("/api/lexicon/:id", async (ctx) => {
  const idParam = ctx.params.id;
  const id = idParam ? Number(idParam) : NaN;

  if (!Number.isFinite(id)) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Ungültige ID." };
    return;
  }

  const body = ctx.request.body({ type: "json" });
  const { term, definition } = await body.value;

  if (!term || !definition) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Term und Definition erforderlich." };
    return;
  }

  const exists = [...db.query("SELECT id FROM lexicon WHERE id = ?", [id])];

  if (exists.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Eintrag nicht gefunden." };
    return;
  }

  db.query("UPDATE lexicon SET term = ?, definition = ? WHERE id = ?", [
    term,
    definition,
    id,
  ]);

  ctx.response.body = { message: "Eintrag aktualisiert." };
});

// Eintrag löschen
router.delete("/api/lexicon/:id", (ctx) => {
  const idParam = ctx.params.id;
  const id = idParam ? Number(idParam) : NaN;

  if (!Number.isFinite(id)) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Ungültige ID." };
    return;
  }

  const exists = [...db.query("SELECT id FROM lexicon WHERE id = ?", [id])];

  if (exists.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Eintrag nicht gefunden." };
    return;
  }

  db.query("DELETE FROM lexicon WHERE id = ?", [id]);

  ctx.response.body = { message: "Eintrag gelöscht." };
});

export default router;
