// server/db.ts
import { DB } from "https://deno.land/x/sqlite/mod.ts";

const dbPath = new URL("./datenbank/workouts.db", import.meta.url).pathname;

export const db = new DB(dbPath);

db.query(`
  CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	username TEXT UNIQUE,
	password TEXT
  );
`);

db.query(`
  CREATE TABLE IF NOT EXISTS lexicon (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	term TEXT UNIQUE,
	definition TEXT
  );
`);

db.query(`
  CREATE TABLE IF NOT EXISTS sessions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	date TEXT NOT NULL,
	duration INTEGER NOT NULL,
	notes TEXT,
	intensity INTEGER NOT NULL
  );
`);

db.query(`
  CREATE TABLE IF NOT EXISTS choreos (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	difficulty TEXT NOT NULL,
	date TEXT NOT NULL,
	notes TEXT
  );
`);
