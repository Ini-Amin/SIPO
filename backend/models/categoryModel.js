const initialCategories = [
  {
    id: 1,
    name: "Elektronik",
    description: "Produk-produk elektronik dan aksesorisnya",
  },
  {
    id: 2,
    name: "Alat Tulis",
    description: "Perlengkapan kantor dan alat tulis",
  },
];

let categories = initialCategories.map((category) => ({ ...category }));
let nextId = 3;

function findAll() {
  return categories.map((category) => ({ ...category }));
}

function findById(id) {
  const category = categories.find((item) => item.id === id);
  return category ? { ...category } : null;
}

function findByName(name) {
  const normalizedName = name.trim().toLowerCase();
  return categories.find(
    (item) => item.name.toLowerCase() === normalizedName
  ) || null;
}

function create(categoryData) {
  const category = {
    id: nextId,
    name: categoryData.name.trim(),
    description: categoryData.description ? categoryData.description.trim() : "",
  };

  nextId += 1;
  categories.push(category);

  return { ...category };
}

function update(id, categoryData) {
  const categoryIndex = categories.findIndex((item) => item.id === id);

  if (categoryIndex === -1) {
    return null;
  }

  categories[categoryIndex] = {
    id,
    name: categoryData.name.trim(),
    description: categoryData.description ? categoryData.description.trim() : "",
  };

  return { ...categories[categoryIndex] };
}

function remove(id) {
  const categoryIndex = categories.findIndex((item) => item.id === id);

  if (categoryIndex === -1) {
    return null;
  }

  const [deletedCategory] = categories.splice(categoryIndex, 1);
  return { ...deletedCategory };
}

// Mengembalikan data awal agar setiap pengujian berjalan secara independen.
function resetCategories() {
  categories = initialCategories.map((category) => ({ ...category }));
  nextId = 3;
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
