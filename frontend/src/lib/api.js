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
