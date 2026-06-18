const productModel = require("../models/productModel");

function parseProductId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function validateProduct(body) {
  const errors = [];

  if (!body || typeof body !== "object") {
    errors.push("Data request body tidak ditemukan");
    return errors;
  }

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("Nama produk wajib diisi");
  }

  if (
    typeof body.price !== "number" ||
    !Number.isFinite(body.price) ||
    body.price < 0
  ) {
    errors.push("Harga harus berupa angka yang tidak negatif");
  }

  if (!Number.isInteger(body.stock) || body.stock < 0) {
    errors.push("Stok harus berupa bilangan bulat yang tidak negatif");
  }

  return errors;
}

async function getProducts(req, res, next) {
  try {
    const products = await productModel.findAll();

    res.status(200).json({
      message: "Data produk berhasil diambil",
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

async function getProductById(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const product = await productModel.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data produk berhasil diambil",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const validationErrors = validateProduct(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validationErrors,
      });
    }

    const product = await productModel.create({
      name: req.body.name.trim(),
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id, // include category_id if provided
    });

    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const validationErrors = validateProduct(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validationErrors,
      });
    }

    const product = await productModel.update(productId, {
      name: req.body.name.trim(),
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id, // include category_id if provided
    });

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Produk berhasil diperbarui",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const product = await productModel.remove(productId);

    if (!product) {
      return res.status(404).json({
        message: "Produk tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Produk berhasil dihapus",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
