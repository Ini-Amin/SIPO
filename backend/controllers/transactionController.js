const db = require("../config/db");
const transactionModel = require("../models/transactionModel");

function parseTransactionId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function generateTransactionCode() {
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${dateStr}-${randomStr}`;
}

async function getTransactions(req, res, next) {
  try {
    const transactions = await transactionModel.findAll();

    return res.status(200).json({
      message: "Data transaksi berhasil diambil",
      data: transactions,
    });
  } catch (error) {
    return next(error);
  }
}

async function getTransactionById(req, res, next) {
  try {
    const transactionId = parseTransactionId(req.params.id);

    if (!transactionId) {
      return res.status(400).json({
        message: "ID transaksi tidak valid",
      });
    }

    const transaction = await transactionModel.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({
        message: "Transaksi tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data transaksi berhasil diambil",
      data: transaction,
    });
  } catch (error) {
    return next(error);
  }
}

async function createTransaction(req, res, next) {
  const { amount_paid, items } = req.body;

  // Validasi input dasar
  if (typeof amount_paid !== "number" || amount_paid < 0) {
    return res.status(400).json({
      message: "Jumlah pembayaran (amount_paid) harus berupa angka yang tidak negatif",
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      message: "Daftar produk (items) harus berupa array dan tidak boleh kosong",
    });
  }

  for (const item of items) {
    if (!item.product_id || typeof item.product_id !== "number") {
      return res.status(400).json({
        message: "Setiap item harus memiliki product_id yang valid",
      });
    }
    if (!item.quantity || typeof item.quantity !== "number" || item.quantity <= 0) {
      return res.status(400).json({
        message: "Setiap item harus memiliki quantity berupa angka positif lebih besar dari 0",
      });
    }
  }

  const connection = await db.getConnection();
  
  try {
    // 1. Mulai transaksi database
    await connection.beginTransaction();

    let total_price = 0;
    const validatedItems = [];

    // 2. Validasi stok & harga produk menggunakan lock FOR UPDATE
    for (const item of items) {
      const [productRows] = await connection.query(
        "SELECT * FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );

      if (productRows.length === 0) {
        throw {
          status: 404,
          message: `Produk dengan ID ${item.product_id} tidak ditemukan`,
        };
      }

      const product = productRows[0];
      const quantity = item.quantity;
      const price = Number(product.price);

      if (product.stock < quantity) {
        throw {
          status: 400,
          message: `Stok produk '${product.name}' tidak mencukupi (Tersedia: ${product.stock}, Diminta: ${quantity})`,
        };
      }

      const subtotal = price * quantity;
      total_price += subtotal;

      validatedItems.push({
        product_id: product.id,
        name: product.name,
        quantity,
        price,
      });
    }

    // 3. Validasi apakah jumlah uang yang dibayarkan cukup
    if (amount_paid < total_price) {
      throw {
        status: 400,
        message: `Jumlah pembayaran kurang dari total harga (Total: ${total_price}, Dibayar: ${amount_paid})`,
      };
    }

    const change_due = amount_paid - total_price;
    const transaction_code = generateTransactionCode();

    // 4. Masukkan data ke tabel transactions
    const transactionId = await transactionModel.createTransaction(connection, {
      transaction_code,
      total_price,
      amount_paid,
      change_due,
    });

    // 5. Kurangi stok produk & masukkan ke tabel transaction_details
    for (const validatedItem of validatedItems) {
      // Kurangi stok di database
      await connection.query(
        "UPDATE products SET stock = stock - ? WHERE id = ?",
        [validatedItem.quantity, validatedItem.product_id]
      );

      // Catat detail transaksi
      await transactionModel.createTransactionDetail(connection, {
        transaction_id: transactionId,
        product_id: validatedItem.product_id,
        quantity: validatedItem.quantity,
        price: validatedItem.price,
      });
    }

    // 6. Commit transaksi
    await connection.commit();

    // 7. Ambil hasil transaksi yang baru disimpan untuk dikembalikan ke client
    const createdTransaction = await transactionModel.findById(transactionId);

    return res.status(201).json({
      message: "Transaksi berhasil dibuat",
      data: createdTransaction,
    });

  } catch (error) {
    // 8. Rollback jika terjadi kesalahan
    await connection.rollback();
    
    // Jika error memiliki status custom, gunakan status tersebut
    if (error.status) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    return next(error);
  } finally {
    // 9. Selalu rilis koneksi kembali ke pool
    connection.release();
  }
}

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
};
