async function apiRequest(path, options = {}) {
  const { headers, ...requestOptions } = options;

  const response = await fetch(path, {
    ...requestOptions,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const responseBody = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseBody.message || "Permintaan ke server gagal");
  }

  return responseBody;
}

export async function getProducts() {
  const response = await apiRequest("/api/products");
  return response.data;
}

export async function getCategories() {
  const response = await apiRequest("/api/categories");
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await apiRequest("/api/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
  return response.data;
}

export async function deleteCategory(id) {
  const response = await apiRequest(`/api/categories/${id}`, {
    method: "DELETE",
  });
  return response.data;
}
