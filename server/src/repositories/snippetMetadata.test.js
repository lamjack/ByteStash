import assert from "node:assert/strict";
import test from "node:test";
import Database from "better-sqlite3";
import { getCategoryFacets } from "./snippetMetadata.js";

const createDatabase = () => {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE snippets (
      id INTEGER PRIMARY KEY,
      user_id INTEGER,
      is_public BOOLEAN,
      expiry_date DATETIME
    );
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY,
      snippet_id INTEGER,
      name TEXT NOT NULL
    );
  `);
  return db;
};

const insertSnippet = (db, id, userId, isPublic, expiryDate = null) => {
  db.prepare(
    "INSERT INTO snippets (id, user_id, is_public, expiry_date) VALUES (?, ?, ?, ?)"
  ).run(id, userId, isPublic, expiryDate);
};

const insertCategory = (db, snippetId, name) => {
  db.prepare("INSERT INTO categories (snippet_id, name) VALUES (?, ?)").run(
    snippetId,
    name
  );
};

test("getCategoryFacets counts active snippets for one user", () => {
  const db = createDatabase();
  insertSnippet(db, 1, 7, 1);
  insertSnippet(db, 2, 7, 0);
  insertSnippet(db, 3, 7, 0, "2026-09-08T00:00:00Z");
  insertSnippet(db, 4, 8, 1);
  insertCategory(db, 1, "folder:Backend");
  insertCategory(db, 1, "typescript");
  insertCategory(db, 2, "folder:Backend");
  insertCategory(db, 2, "react");
  insertCategory(db, 3, "ignored-recycled");
  insertCategory(db, 4, "ignored-other-user");

  assert.deepEqual(getCategoryFacets(db, 7), [
    { value: "folder:Backend", count: 2 },
    { value: "react", count: 1 },
    { value: "typescript", count: 1 },
  ]);
  db.close();
});

test("getCategoryFacets counts active public snippets across users", () => {
  const db = createDatabase();
  insertSnippet(db, 1, 7, 1);
  insertSnippet(db, 2, 7, 0);
  insertSnippet(db, 3, 8, 1);
  insertSnippet(db, 4, 8, 1, "2026-09-08T00:00:00Z");
  insertCategory(db, 1, "shared");
  insertCategory(db, 2, "ignored-private");
  insertCategory(db, 3, "shared");
  insertCategory(db, 3, "typescript");
  insertCategory(db, 4, "ignored-recycled");

  assert.deepEqual(getCategoryFacets(db), [
    { value: "shared", count: 2 },
    { value: "typescript", count: 1 },
  ]);
  db.close();
});
