const db = require("../config/db");

async function findAll() {
  const [rows] = await db.query("SELECT * FROM transactions ORDER BY id DESC");
  return rows.map(row => ({
    ...row,
    total_price: Number(row.total_price),
    amount_paid: Number(row.amount_paid),
    change_due: Number(row.change_due),
  }));
}

async function findById(id) {
  const [transactionRows] = await db.query("SELECT * FROM transactions WHERE id = ?", [id]);
  if (transactionRows.length === 0) return null;
  
  const transaction = transactionRows[0];

  const [detailRows] = await db.query(`
    SELECT td.id, td.product_id, p.name AS product_name, td.quantity, td.price 
    FROM transaction_details td
    JOIN products p ON td.product_id = p.id
    WHERE td.transaction_id = ?
  `, [id]);

  return {
    ...transaction,
    total_price: Number(transaction.total_price),
    amount_paid: Number(transaction.amount_paid),
    change_due: Number(transaction.change_due),
    items: detailRows.map(item => ({
      ...item,
      price: Number(item.price),
      subtotal: Number(item.price) * item.quantity
    }))
  };
}

async function createTransaction(connection, { transaction_code, total_price, amount_paid, change_due }) {
  const [result] = await connection.query(
    "INSERT INTO transactions (transaction_code, total_price, amount_paid, change_due) VALUES (?, ?, ?, ?)",
    [transaction_code, total_price, amount_paid, change_due]
  );
  return result.insertId;
}

async function createTransactionDetail(connection, { transaction_id, product_id, quantity, price }) {
  const [result] = await connection.query(
    "INSERT INTO transaction_details (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [transaction_id, product_id, quantity, price]
  );
  return result.insertId;
}

module.exports = {
  findAll,
  findById,
  createTransaction,
  createTransactionDetail,
};
