const db = require("../config/db");

async function findAll() {
  const [rows] = await db.query("SELECT * FROM categories ORDER BY id ASC");
  return rows;
}

async function findById(id) {
  const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
  return rows.length > 0 ? rows[0] : null;
}

async function findByName(name) {
  const normalizedName = name.trim().toLowerCase();
  const [rows] = await db.query("SELECT * FROM categories WHERE LOWER(name) = ?", [normalizedName]);
  return rows.length > 0 ? rows[0] : null;
}

async function create(categoryData) {
  const name = categoryData.name.trim();
  const description = categoryData.description ? categoryData.description.trim() : "";
  
  const [result] = await db.query(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );
  
  return { id: result.insertId, name, description };
}

async function update(id, categoryData) {
  const name = categoryData.name.trim();
  const description = categoryData.description ? categoryData.description.trim() : "";
  
  const [existing] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
  if (existing.length === 0) {
    return null;
  }

  await db.query(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name, description, id]
  );
  
  return { id, name, description };
}

async function remove(id) {
  const category = await findById(id);
  if (!category) return null;
  
  await db.query("DELETE FROM categories WHERE id = ?", [id]);
  return category;
}

// Untuk reset database saat pengujian (menghapus semua data dan memasukkan seed kembali)
async function resetCategories() {
  await db.query("SET FOREIGN_KEY_CHECKS = 0;");
  await db.query("TRUNCATE TABLE categories;");
  await db.query("SET FOREIGN_KEY_CHECKS = 1;");
  await db.query(`
    INSERT INTO categories (id, name, description) VALUES
    (1, 'Elektronik', 'Produk-produk elektronik dan aksesorisnya'),
    (2, 'Alat Tulis', 'Perlengkapan kantor dan alat tulis')
  `);
}

module.exports = {
  findAll,
  findById,
  findByName,
  create,
  update,
  remove,
  resetCategories,
};
