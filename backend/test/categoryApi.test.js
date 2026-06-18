const { beforeEach, after, describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const categoryModel = require("../models/categoryModel");
const db = require("../config/db");

beforeEach(async () => {
  await categoryModel.resetCategories();
});

after(async () => {
  await db.end();
});

describe("Category API", () => {
  // ─── GET /api/categories ───────────────────────────────────────────────────

  test("GET /api/categories mengembalikan seluruh kategori", async () => {
    const response = await request(app).get("/api/categories");

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Data kategori berhasil diambil");
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, "Elektronik");
  });

  // ─── GET /api/categories/:id ──────────────────────────────────────────────

  test("GET /api/categories/:id mengembalikan satu kategori", async () => {
    const response = await request(app).get("/api/categories/1");

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, 1);
    assert.equal(response.body.data.name, "Elektronik");
  });

  test("GET /api/categories/:id mengembalikan 404 jika kategori tidak ada", async () => {
    const response = await request(app).get("/api/categories/999");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Kategori tidak ditemukan");
  });

  test("GET /api/categories/:id mengembalikan 400 jika ID bukan angka", async () => {
    const response = await request(app).get("/api/categories/bukan-angka");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "ID kategori tidak valid");
  });

  test("GET /api/categories/:id mengembalikan 400 jika ID nol atau negatif", async () => {
    const responseZero = await request(app).get("/api/categories/0");
    const responseNeg = await request(app).get("/api/categories/-1");

    assert.equal(responseZero.status, 400);
    assert.equal(responseNeg.status, 400);
  });

  // ─── POST /api/categories ─────────────────────────────────────────────────

  test("POST /api/categories membuat kategori baru", async () => {
    const newCategory = {
      name: "Minuman",
      description: "Berbagai jenis minuman",
    };

    const response = await request(app)
      .post("/api/categories")
      .send(newCategory);

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Kategori berhasil ditambahkan");
    assert.equal(response.body.data.id, 3);
    assert.equal(response.body.data.name, "Minuman");
    assert.equal(response.body.data.description, "Berbagai jenis minuman");
  });

  test("POST /api/categories berhasil tanpa field description (opsional)", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({ name: "Makanan" });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.name, "Makanan");
    assert.equal(response.body.data.description, "");
  });

  test("POST /api/categories memangkas spasi di nama", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({ name: "  Makanan  " });

    assert.equal(response.status, 201);
    assert.equal(response.body.data.name, "Makanan");
  });

  test("POST /api/categories menolak nama yang kosong", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({ name: "   " });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Data kategori tidak valid");
    assert.ok(response.body.errors.includes("Nama kategori wajib diisi"));
  });

  test("POST /api/categories menolak jika nama tidak dikirim", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({ description: "Tanpa nama" });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors.length, 1);
  });

  test("POST /api/categories menolak description yang bukan string", async () => {
    const response = await request(app)
      .post("/api/categories")
      .send({ name: "Makanan", description: 123 });

    assert.equal(response.status, 400);
    assert.ok(response.body.errors.includes("Deskripsi harus berupa teks"));
  });

  test("POST /api/categories menolak nama yang duplikat (case-insensitive)", async () => {
    await request(app).post("/api/categories").send({ name: "Elektronik" });

    const response = await request(app)
      .post("/api/categories")
      .send({ name: "elektronik" });

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Nama kategori sudah digunakan");
  });

  // ─── PUT /api/categories/:id ──────────────────────────────────────────────

  test("PUT /api/categories/:id memperbarui kategori", async () => {
    const updated = {
      name: "Elektronik & Gadget",
      description: "Semua perangkat elektronik dan gadget",
    };

    const response = await request(app)
      .put("/api/categories/1")
      .send(updated);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Kategori berhasil diperbarui");
    assert.deepEqual(response.body.data, { id: 1, ...updated });
  });

  test("PUT /api/categories/:id mengizinkan nama yang sama pada kategori yang sama", async () => {
    const response = await request(app)
      .put("/api/categories/1")
      .send({ name: "Elektronik", description: "Deskripsi baru" });

    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, "Elektronik");
  });

  test("PUT /api/categories/:id menolak data yang tidak valid", async () => {
    const response = await request(app)
      .put("/api/categories/1")
      .send({ name: "" });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors.length, 1);
  });

  test("PUT /api/categories/:id mengembalikan 404 jika kategori tidak ada", async () => {
    const response = await request(app)
      .put("/api/categories/999")
      .send({ name: "Tidak Ada" });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Kategori tidak ditemukan");
  });

  test("PUT /api/categories/:id mengembalikan 400 jika ID tidak valid", async () => {
    const response = await request(app)
      .put("/api/categories/abc")
      .send({ name: "Valid" });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "ID kategori tidak valid");
  });

  test("PUT /api/categories/:id menolak nama duplikat milik kategori lain", async () => {
    const response = await request(app)
      .put("/api/categories/1")
      .send({ name: "Alat Tulis" }); // nama milik id=2

    assert.equal(response.status, 409);
    assert.equal(response.body.message, "Nama kategori sudah digunakan");
  });

  // ─── DELETE /api/categories/:id ───────────────────────────────────────────

  test("DELETE /api/categories/:id menghapus kategori", async () => {
    const deleteResponse = await request(app).delete("/api/categories/1");
    const getResponse = await request(app).get("/api/categories/1");

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.message, "Kategori berhasil dihapus");
    assert.equal(deleteResponse.body.data.id, 1);
    assert.equal(getResponse.status, 404);
  });

  test("DELETE /api/categories/:id mengembalikan 404 jika kategori tidak ada", async () => {
    const response = await request(app).delete("/api/categories/999");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Kategori tidak ditemukan");
  });

  test("DELETE /api/categories/:id mengembalikan 400 jika ID tidak valid", async () => {
    const response = await request(app).delete("/api/categories/xyz");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "ID kategori tidak valid");
  });
});
