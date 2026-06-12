const initialProducts = [
  {
    id: 1,
    name: "Kabel HDMI",
    price: 25000,
    stock: 10,
  },
  {
    id: 2,
    name: "Mouse Wireless",
    price: 75000,
    stock: 5,
  },
];

let products = initialProducts.map((product) => ({ ...product }));
let nextId = 3;

function findAll() {
  return products.map((product) => ({ ...product }));
}

function findById(id) {
  const product = products.find((item) => item.id === id);
  return product ? { ...product } : null;
}

function create(productData) {
  const product = {
    id: nextId,
    ...productData,
  };

  nextId += 1;
  products.push(product);

  return { ...product };
}

function update(id, productData) {
  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return null;
  }

  products[productIndex] = {
    id,
    ...productData,
  };

  return { ...products[productIndex] };
}

function remove(id) {
  const productIndex = products.findIndex((item) => item.id === id);

  if (productIndex === -1) {
    return null;
  }

  const [deletedProduct] = products.splice(productIndex, 1);
  return { ...deletedProduct };
}

// Mengembalikan data awal agar setiap pengujian berjalan secara independen.
function resetProducts() {
  products = initialProducts.map((product) => ({ ...product }));
  nextId = 3;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  resetProducts,
};
