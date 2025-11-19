// server/db.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";

// Pfad zur Datenbank relativ zu dieser Datei
const dbPath = new URL("./datenbank/workouts.db", import.meta.url).pathname;

// Eine einzige globale Verbindung
export const db = new DB(dbPath);

// Tabellen anlegen falls sie noch nicht existieren
db.query(`
  CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE,
	password TEXT
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS lexicon (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	term TEXT UNIQUE,
	definition TEXT
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS workouts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT
  )
`);
