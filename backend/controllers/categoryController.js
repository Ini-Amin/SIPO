const categoryModel = require("../models/categoryModel");

function parseCategoryId(id) {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return null;
  }

  return parsedId;
}

function validateCategory(body) {
  const errors = [];

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("Nama kategori wajib diisi");
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    errors.push("Deskripsi harus berupa teks");
  }

  return errors;
}

function getCategories(req, res, next) {
  try {
    const categories = categoryModel.findAll();

    res.status(200).json({
      message: "Data kategori berhasil diambil",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

function getCategoryById(req, res, next) {
  try {
    const categoryId = parseCategoryId(req.params.id);

    if (!categoryId) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    const category = categoryModel.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Data kategori berhasil diambil",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
}

function createCategory(req, res, next) {
  try {
    const validationErrors = validateCategory(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Data kategori tidak valid",
        errors: validationErrors,
      });
    }

    // Cegah nama kategori duplikat (case-insensitive)
    const existing = categoryModel.findByName(req.body.name);
    if (existing) {
      return res.status(409).json({
        message: "Nama kategori sudah digunakan",
      });
    }

    const category = categoryModel.create({
      name: req.body.name,
      description: req.body.description ?? "",
    });

    return res.status(201).json({
      message: "Kategori berhasil ditambahkan",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
}

function updateCategory(req, res, next) {
  try {
    const categoryId = parseCategoryId(req.params.id);

    if (!categoryId) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    const validationErrors = validateCategory(req.body);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: "Data kategori tidak valid",
        errors: validationErrors,
      });
    }

    // Cegah nama duplikat, kecuali nama milik kategori itu sendiri
    const existing = categoryModel.findByName(req.body.name);
    if (existing && existing.id !== categoryId) {
      return res.status(409).json({
        message: "Nama kategori sudah digunakan",
      });
    }

    const category = categoryModel.update(categoryId, {
      name: req.body.name,
      description: req.body.description ?? "",
    });

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Kategori berhasil diperbarui",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
}

function deleteCategory(req, res, next) {
  try {
    const categoryId = parseCategoryId(req.params.id);

    if (!categoryId) {
      return res.status(400).json({
        message: "ID kategori tidak valid",
      });
    }

    const category = categoryModel.remove(categoryId);

    if (!category) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    return res.status(200).json({
      message: "Kategori berhasil dihapus",
      data: category,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
