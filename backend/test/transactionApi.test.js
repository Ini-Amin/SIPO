const { beforeEach, after, describe, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const app = require("../app");
const db = require("../config/db");
const productModel = require("../models/productModel");

beforeEach(async () => {
  // Reset produk, transaksi, dan detail transaksi ke kondisi awal test
  await productModel.resetProducts();
});

after(async () => {
  await db.end();
});

describe("Transaction API", () => {
  test("GET /api/transactions mengembalikan daftar transaksi kosong di awal", async () => {
    const response = await request(app).get("/api/transactions");

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Data transaksi berhasil diambil");
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.data.length, 0);
  });

  test("POST /api/transactions berhasil membuat transaksi baru jika stok mencukupi", async () => {
    // Di resetProducts:
    // Kabel HDMI (ID 1) -> Harga 25000, Stok 10
    // Mouse Wireless (ID 2) -> Harga 75000, Stok 5
    
    const payload = {
      amount_paid: 200000,
      items: [
        { product_id: 1, quantity: 2 }, // 25000 * 2 = 50000
        { product_id: 2, quantity: 1 }  // 75000 * 1 = 75000
      ] // Total = 125000
    };

    const response = await request(app)
      .post("/api/transactions")
      .send(payload);

    assert.equal(response.status, 201);
    assert.equal(response.body.message, "Transaksi berhasil dibuat");
    
    const trx = response.body.data;
    assert.ok(trx.id);
    assert.ok(trx.transaction_code.startsWith("TRX-"));
    assert.equal(trx.total_price, 125000);
    assert.equal(trx.amount_paid, 200000);
    assert.equal(trx.change_due, 75000);
    assert.equal(trx.items.length, 2);

    // Verifikasi pemotongan stok di database
    const product1 = await productModel.findById(1);
    const product2 = await productModel.findById(2);
    
    assert.equal(product1.stock, 8); // 10 - 2 = 8
    assert.equal(product2.stock, 4); // 5 - 1 = 4
  });

  test("POST /api/transactions gagal dan di-rollback jika stok produk kurang", async () => {
    const payload = {
      amount_paid: 500000,
      items: [
        { product_id: 1, quantity: 2 },  // 25000 * 2 = 50000
        { product_id: 2, quantity: 10 }  // Stok Mouse Wireless cuma 5, diminta 10 (Gagal!)
      ]
    };

    const response = await request(app)
      .post("/api/transactions")
      .send(payload);

    assert.equal(response.status, 400);
    assert.match(response.body.message, /Stok produk 'Mouse Wireless' tidak mencukupi/);

    // Verifikasi bahwa stok TIDAK berkurang karena transaksi dibatalkan (rollback)
    const product1 = await productModel.findById(1);
    const product2 = await productModel.findById(2);

    assert.equal(product1.stock, 10); // Tetap 10
    assert.equal(product2.stock, 5);  // Tetap 5

    // Verifikasi tidak ada transaksi yang terbuat di tabel transactions
    const listTrx = await request(app).get("/api/transactions");
    assert.equal(listTrx.body.data.length, 0);
  });

  test("POST /api/transactions gagal jika uang pembayaran kurang dari total belanja", async () => {
    const payload = {
      amount_paid: 100000, // Total belanja adalah 125000
      items: [
        { product_id: 1, quantity: 2 }, // 50000
        { product_id: 2, quantity: 1 }  // 75000
      ]
    };

    const response = await request(app)
      .post("/api/transactions")
      .send(payload);

    assert.equal(response.status, 400);
    assert.match(response.body.message, /Jumlah pembayaran kurang dari total harga/);

    // Verifikasi stok tidak terpotong
    const product1 = await productModel.findById(1);
    assert.equal(product1.stock, 10);
  });

  test("GET /api/transactions/:id berhasil mengambil detail lengkap setelah transaksi dibuat", async () => {
    // 1. Buat transaksi terlebih dahulu
    const payload = {
      amount_paid: 100000,
      items: [
        { product_id: 1, quantity: 2 } // Total = 50000
      ]
    };

    const createRes = await request(app)
      .post("/api/transactions")
      .send(payload);

    const createdTrxId = createRes.body.data.id;

    // 2. Ambil detail transaksi berdasarkan ID
    const response = await request(app).get(`/api/transactions/${createdTrxId}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.message, "Data transaksi berhasil diambil");
    
    const trx = response.body.data;
    assert.equal(trx.id, createdTrxId);
    assert.equal(trx.total_price, 50000);
    assert.equal(trx.amount_paid, 100000);
    assert.equal(trx.change_due, 50000);
    assert.equal(trx.items.length, 1);
    assert.equal(trx.items[0].product_id, 1);
    assert.equal(trx.items[0].product_name, "Kabel HDMI");
    assert.equal(trx.items[0].quantity, 2);
    assert.equal(trx.items[0].price, 25000);
    assert.equal(trx.items[0].subtotal, 50000);
  });

  test("GET /api/transactions/:id mengembalikan 404 jika ID tidak ditemukan", async () => {
    const response = await request(app).get("/api/transactions/9999");
    assert.equal(response.status, 404);
    assert.equal(response.body.message, "Transaksi tidak ditemukan");
  });
});
