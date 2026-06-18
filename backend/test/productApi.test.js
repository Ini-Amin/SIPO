const { beforeEach, after, describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const productModel = require("../models/productModel");
const db = require("../config/db");

beforeEach(async () => {
  await productModel.resetProducts();
});

after(async () => {
  await db.end();
});

describe("SIPO API", () => {
  test("GET / mengembalikan status API", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      message: "SIPO Backend API is running",
    });
  });

  test("route yang tidak tersedia mengembalikan JSON 404", async () => {
    const response = await request(app).get("/api/tidak-ada");

    assert.equal(response.status, 404);
    assert.deepEqual(response.body, {
      message: "Endpoint tidak ditemukan",
    });
  });

  test("JSON yang rusak mengembalikan response 400", async () => {
    const response = await request(app)
      .post("/api/products")
      .set("Content-Type", "application/json")
      .send('{"name":');

    assert.equal(response.status, 400);
    assert.deepEqual(response.body, {
      message: "Format JSON tidak valid",
    });
  });
});

describe("Product API", () => {
  test("GET /api/products mengembalikan seluruh produk", async () => {
    const response = await request(app).get("/api/products");

    assert.equal(response.status, 200);
    assert.equal(response.body.data.length, 2);
    assert.equal(response.body.data[0].name, "Kabel HDMI");
  });

  test("GET /api/products/:id mengembalikan satu produk", async () => {
    const response = await request(app).get("/api/products/1");

    assert.equal(response.status, 200);
    assert.equal(response.body.data.id, 1);
    assert.equal(response.body.data.name, "Kabel HDMI");
  });

  test("GET /api/products/:id mengembalikan 404 jika produk tidak ada", async () => {
    const response = await request(app).get("/api/products/999");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Produk tidak ditemukan");
  });

  test("POST /api/products membuat produk baru", async () => {
    const newProduct = {
      name: "Keyboard Mechanical",
      price: 350000,
      stock: 7,
    };

    const response = await request(app)
      .post("/api/products")
      .send(newProduct);

    assert.equal(response.status, 201);
    assert.deepEqual(response.body.data, {
      id: 3,
      ...newProduct,
    });
  });

  test("POST /api/products menolak data yang tidak valid", async () => {
    const response = await request(app).post("/api/products").send({
      name: " ",
      price: -1,
      stock: 1.5,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "Data produk tidak valid");
    assert.equal(response.body.errors.length, 3);
  });

  test("PUT /api/products/:id memperbarui produk", async () => {
    const updatedProduct = {
      name: "Kabel HDMI 2 Meter",
      price: 40000,
      stock: 8,
    };

    const response = await request(app)
      .put("/api/products/1")
      .send(updatedProduct);

    assert.equal(response.status, 200);
    assert.deepEqual(response.body.data, {
      id: 1,
      ...updatedProduct,
    });
  });

  test("PUT /api/products/:id menolak data yang tidak valid", async () => {
    const response = await request(app).put("/api/products/1").send({
      name: "Mouse",
      price: "75000",
      stock: -2,
    });

    assert.equal(response.status, 400);
    assert.equal(response.body.errors.length, 2);
  });

  test("PUT /api/products/:id mengembalikan 404 jika produk tidak ada", async () => {
    const response = await request(app).put("/api/products/999").send({
      name: "Produk Baru",
      price: 10000,
      stock: 1,
    });

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Produk tidak ditemukan");
  });

  test("DELETE /api/products/:id menghapus produk", async () => {
    const deleteResponse = await request(app).delete("/api/products/1");
    const getResponse = await request(app).get("/api/products/1");

    assert.equal(deleteResponse.status, 200);
    assert.equal(deleteResponse.body.data.id, 1);
    assert.equal(getResponse.status, 404);
  });

  test("DELETE /api/products/:id mengembalikan 404 jika produk tidak ada", async () => {
    const response = await request(app).delete("/api/products/999");

    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Produk tidak ditemukan");
  });

  test("ID produk yang tidak valid mengembalikan 400", async () => {
    const response = await request(app).get("/api/products/bukan-angka");

    assert.equal(response.status, 400);
    assert.equal(response.body.message, "ID produk tidak valid");
  });
});
