const mysql = require("mysql2/promise");
require("dotenv").config();

async function init() {
  const dbConfig = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : {
        host: process.env.DB_HOST || "127.0.0.1",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        port: process.env.DB_PORT || 3306,
      };

  const dbName = process.env.DATABASE_URL
    ? new URL(process.env.DATABASE_URL).pathname.replace("/", "")
    : (process.env.DB_NAME || "sipo_db");

  console.log("Menghubungkan ke MySQL/MariaDB...");
  
  // 1. Buat koneksi awal
  const connection = typeof dbConfig === "string"
    ? await mysql.createConnection({
        uri: dbConfig,
        ssl: {
          rejectUnauthorized: false,
        },
      })
    : await mysql.createConnection(dbConfig);

  try {
    // 2. Buat database jika menggunakan konfigurasi lokal / non-URI
    if (typeof dbConfig !== "string") {
      console.log(`Membuat database '${dbName}' jika belum ada...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
      await connection.query(`USE \`${dbName}\`;`);
    } else {
      console.log(`Menggunakan database '${dbName}' dari URI...`);
    }

    // 3. Buat tabel categories
    console.log("Membuat tabel 'categories'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Membuat tabel products
    console.log("Membuat tabel 'products'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_id INT NULL,
        name VARCHAR(150) NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
    `);

    // 5. Membuat tabel transactions
    console.log("Membuat tabel 'transactions'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        transaction_code VARCHAR(100) NOT NULL UNIQUE,
        total_price DECIMAL(12,2) NOT NULL,
        amount_paid DECIMAL(12,2) NOT NULL,
        change_due DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Membuat tabel transaction_details
    console.log("Membuat tabel 'transaction_details'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaction_details (
        id INT PRIMARY KEY AUTO_INCREMENT,
        transaction_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(12,2) NOT NULL,
        FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
      );
    `);

    // 7. Masukkan data awal (Seeding)
    console.log("Mengisi data awal...");

    // Truncate tables to allow fresh seeding
    await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
    await connection.query("TRUNCATE TABLE transaction_details;");
    await connection.query("TRUNCATE TABLE transactions;");
    await connection.query("TRUNCATE TABLE products;");
    await connection.query("TRUNCATE TABLE categories;");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1;");

    console.log("Mengisi tabel categories...");
    await connection.query(`
      INSERT INTO categories (id, name, description) VALUES
      (1, 'Elektronik', 'Produk-produk elektronik dan perangkat pintar'),
      (2, 'Alat Tulis', 'Perlengkapan kantor, sekolah, dan alat tulis'),
      (3, 'Aksesoris Komputer', 'Perangkat input, output, dan aksesoris PC'),
      (4, 'Mebel & Rumah Tangga', 'Perabotan rumah tangga dan perlengkapan kerja'),
      (5, 'Makanan & Minuman', 'Kopi, susu, dan bahan konsumsi lainnya')
    `);

    console.log("Mengisi tabel products...");
    await connection.query(`
      INSERT INTO products (id, category_id, name, price, stock) VALUES
      (1, 1, 'Kabel HDMI 2.0 2m', 25000, 15),
      (2, 3, 'Mouse Wireless Silent', 75000, 8),
      (3, 3, 'Keyboard Mechanical Red Switch', 350000, 12),
      (4, 3, 'Headset Gaming RGB', 250000, 6),
      (5, 1, 'Monitor LED 24 Inch IPS', 1450000, 4),
      (6, 4, 'Meja Kerja Minimalis', 420000, 5),
      (7, 4, 'Kursi Kantor Ergonomis', 850000, 7),
      (8, 5, 'Kopi Arabika Toraja 250g', 68000, 20),
      (9, 5, 'Susu UHT Full Cream 1L', 18500, 25),
      (10, 2, 'Pulpen Gel Hitam 0.5mm', 4500, 100),
      (11, 2, 'Buku Catatan Grid A5', 12000, 35)
    `);

    console.log("Mengisi tabel transactions...");
    await connection.query(`
      INSERT INTO transactions (id, transaction_code, total_price, amount_paid, change_due, created_at) VALUES
      (1, 'TRX-20260701-0001', 125000, 150000, 25000, '2026-07-01 23:00:00')
    `);

    console.log("Mengisi tabel transaction_details...");
    await connection.query(`
      INSERT INTO transaction_details (id, transaction_id, product_id, quantity, price) VALUES
      (1, 1, 1, 2, 25000),
      (2, 1, 2, 1, 75000)
    `);

    console.log("Inisialisasi database BERHASIL!");
  } catch (error) {
    console.error("Gagal melakukan inisialisasi database:", error);
  } finally {
    await connection.end();
  }
}

init();
