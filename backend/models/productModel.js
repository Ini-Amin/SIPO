const db = require("../config/db");

async function findAll() {
  const [rows] = await db.query("SELECT * FROM products ORDER BY id ASC");
  return rows.map(row => ({
    ...row,
    price: Number(row.price), // mysql DECIMAL comes as string, convert to number
  }));
}

async function findById(id) {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  if (rows.length === 0) return null;
  return {
    ...rows[0],
    price: Number(rows[0].price),
  };
}

async function create(productData) {
  const name = productData.name.trim();
  const price = productData.price;
  const stock = productData.stock;
  const categoryId = productData.category_id !== undefined ? productData.category_id : null;

  const [result] = await db.query(
    "INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)",
    [name, price, stock, categoryId]
  );

  const product = {
    id: result.insertId,
    name,
    price,
    stock,
  };

  if (categoryId !== null) {
    product.category_id = categoryId;
  }

  return product;
}

async function update(id, productData) {
  const name = productData.name.trim();
  const price = productData.price;
  const stock = productData.stock;
  const categoryId = productData.category_id !== undefined ? productData.category_id : null;

  const [existing] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  if (existing.length === 0) {
    return null;
  }

  await db.query(
    "UPDATE products SET name = ?, price = ?, stock = ?, category_id = ? WHERE id = ?",
    [name, price, stock, categoryId, id]
  );

  const product = {
    id,
    name,
    price,
    stock,
  };

  if (categoryId !== null) {
    product.category_id = categoryId;
  }

  return product;
}

async function remove(id) {
  const product = await findById(id);
  if (!product) return null;

  await db.query("DELETE FROM products WHERE id = ?", [id]);
  return product;
}

// Untuk reset database saat pengujian (menghapus semua data dan memasukkan seed kembali)
async function resetProducts() {
  await db.query("SET FOREIGN_KEY_CHECKS = 0;");
  await db.query("TRUNCATE TABLE transaction_details;");
  await db.query("TRUNCATE TABLE transactions;");
  await db.query("TRUNCATE TABLE products;");
  await db.query(`
    INSERT INTO products (id, category_id, name, price, stock) VALUES
    (1, 1, 'Kabel HDMI', 25000, 10),
    (2, 1, 'Mouse Wireless', 75000, 5)
  `);
  await db.query("SET FOREIGN_KEY_CHECKS = 1;");
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  resetProducts,
};
