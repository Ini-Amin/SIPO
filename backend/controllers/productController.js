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

function getProducts(req, res, next) {
  try {
    const products = productModel.findAll();

    res.status(200).json({
      message: "Data produk berhasil diambil",
      data: products,
    });
  } catch (error) {
    next(error);
  }
}

function getProductById(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const product = productModel.findById(productId);

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

function createProduct(req, res, next) {
  try {
    const validationErrors = validateProduct(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Data produk tidak valid",
        errors: validationErrors,
      });
    }

    const product = productModel.create({
      name: req.body.name.trim(),
      price: req.body.price,
      stock: req.body.stock,
    });

    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: product,
    });
  } catch (error) {
    return next(error);
  }
}

function updateProduct(req, res, next) {
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

    const product = productModel.update(productId, {
      name: req.body.name.trim(),
      price: req.body.price,
      stock: req.body.stock,
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

function deleteProduct(req, res, next) {
  try {
    const productId = parseProductId(req.params.id);

    if (!productId) {
      return res.status(400).json({
        message: "ID produk tidak valid",
      });
    }

    const product = productModel.remove(productId);

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
