const mysql = require("mysql2/promise");
require("dotenv").config();

async function init() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const dbName = process.env.DB_NAME || "sipo_db";
  const port = process.env.DB_PORT || 3306;

  console.log("Menghubungkan ke MySQL/MariaDB...");
  
  // 1. Buat koneksi awal tanpa memilih database
  const connection = await mysql.createConnection({
    host,
    user,
    password,
    port,
  });

  try {
    // 2. Buat database jika belum ada
    console.log(`Membuat database '${dbName}' jika belum ada...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    
    // Pilih database
    await connection.query(`USE \`${dbName}\`;`);

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

    // 5. Masukkan data awal (Seeding)
    console.log("Mengisi data awal...");

    // Cek apakah kategori kosong
    const [existingCategories] = await connection.query("SELECT COUNT(*) as count FROM categories");
    if (existingCategories[0].count === 0) {
      console.log("Mengisi tabel categories...");
      await connection.query(`
        INSERT INTO categories (id, name, description) VALUES
        (1, 'Elektronik', 'Produk-produk elektronik dan aksesorisnya'),
        (2, 'Alat Tulis', 'Perlengkapan kantor dan alat tulis')
      `);
    }

    // Cek apakah produk kosong
    const [existingProducts] = await connection.query("SELECT COUNT(*) as count FROM products");
    if (existingProducts[0].count === 0) {
      console.log("Mengisi tabel products...");
      await connection.query(`
        INSERT INTO products (id, category_id, name, price, stock) VALUES
        (1, 1, 'Kabel HDMI', 25000, 10),
        (2, 1, 'Mouse Wireless', 75000, 5)
      `);
    }

    console.log("Inisialisasi database BERHASIL!");
  } catch (error) {
    console.error("Gagal melakukan inisialisasi database:", error);
  } finally {
    await connection.end();
  }
}

init();
