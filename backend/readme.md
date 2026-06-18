# SIPO - Sistem Informasi Point of Sale

SIPO adalah aplikasi Point of Sale sederhana berbasis web untuk mengelola produk, kategori, transaksi kasir, dan riwayat penjualan. Project ini menggunakan arsitektur terpisah antara frontend dan backend.

## Tujuan Project

Project ini dibuat sebagai latihan/praktikum web dengan stack modern:

* Frontend: React + Vite
* Styling: Tailwind CSS
* UI Component: shadcn/ui
* Backend: Express.js
* Database: belum final / rencana menggunakan MariaDB atau MySQL
* API style: REST API berbasis JSON

Project ini tidak menggunakan Pug/EJS/views di backend. Backend hanya bertugas sebagai API server, sedangkan tampilan dibuat di frontend React.

---

## Struktur Project

```txt
SIPO/
├── frontend/                # React + Vite + Tailwind + shadcn/ui
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── jsconfig.json
│   ├── components.json
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── lib/
│       │   └── api.js
│       ├── components/
│       │   ├── ui/
│       │   ├── Navbar.jsx
│       │   └── Sidebar.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── Products.jsx
│       │   ├── Categories.jsx
│       │   ├── Cashier.jsx
│       │   └── Transactions.jsx
│       └── features/
│           ├── products/
│           └── transactions/
│
├── backend/                 # Express.js REST API
│   ├── app.js
│   ├── package.json
│   ├── bin/
│   │   └── www
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   └── transactionRoutes.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   └── transactionController.js
│   ├── models/
│   │   ├── productModel.js
│   │   ├── categoryModel.js
│   │   └── transactionModel.js
│   ├── middlewares/
│   │   └── errorMiddleware.js
│   └── utils/
│       └── response.js
│
├── .gitignore
└── README.md
```

---

## Catatan Penting untuk Codex

Project ini sedang dalam tahap setup awal. Backend dibuat menggunakan Express Generator, tetapi tidak boleh memakai `res.render()` karena project ini tidak menggunakan view engine.

Jika menemukan kode seperti ini:

```js
res.render("index", { title: "Express" });
```

ubah menjadi response JSON seperti ini:

```js
res.json({
  message: "SIPO Backend API is running"
});
```

Backend Express harus diperlakukan sebagai REST API, bukan server untuk render HTML.

---

## Setup Backend

Masuk ke folder backend:

```bash
cd backend
npm install
```

Install package tambahan:

```bash
npm install cors dotenv
npm install -D nodemon
```

Pastikan `backend/package.json` memiliki script berikut:

```json
{
  "scripts": {
    "start": "node ./bin/www",
    "dev": "nodemon ./bin/www"
  }
}
```

Jalankan backend:

```bash
npm run dev
```

Backend berjalan di:

```txt
http://localhost:3000
```

Endpoint root backend:

```txt
GET /
```

Response yang diharapkan:

```json
{
  "message": "SIPO Backend API is running"
}
```

---

## Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
npm install
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di:

```txt
http://localhost:5173
```

---

## Konfigurasi Proxy Frontend ke Backend

File:

```txt
frontend/vite.config.js
```

Contoh konfigurasi:

```js
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
```

Dengan konfigurasi ini, request dari frontend ke:

```txt
/api/products
```

akan diteruskan ke backend:

```txt
http://localhost:3000/api/products
```

---

## Konfigurasi Alias Frontend

File:

```txt
frontend/jsconfig.json
```

Isi:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Alias ini digunakan agar import bisa lebih rapi:

```js
import { Button } from "@/components/ui/button";
```

---

## Tailwind CSS

File:

```txt
frontend/src/index.css
```

Isi minimal:

```css
@import "tailwindcss";
```

---

## shadcn/ui

Komponen shadcn/ui berada di:

```txt
frontend/src/components/ui/
```

Contoh komponen yang dibutuhkan untuk project ini:

```bash
npx shadcn@latest add button card input table dialog label select badge separator dropdown-menu
```

Gunakan komponen shadcn untuk membangun UI seperti:

* Button
* Card
* Input
* Table
* Dialog tambah/edit produk
* Form transaksi
* Select kategori
* Badge status stok
* Dropdown menu aksi

---

## Backend API Target

### Product API

```txt
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

Contoh response `GET /api/products`:

```json
{
  "message": "Data produk berhasil diambil",
  "data": [
    {
      "id": 1,
      "name": "Kabel HDMI",
      "category": "Aksesoris",
      "price": 25000,
      "stock": 10
    }
  ]
}
```

Contoh body `POST /api/products`:

```json
{
  "name": "Mouse Wireless",
  "category_id": 1,
  "price": 75000,
  "stock": 20
}
```

---

### Category API

```txt
GET    /api/categories
GET    /api/categories/:id
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

Contoh data kategori:

```json
{
  "id": 1,
  "name": "Aksesoris"
}
```

---

### Transaction API

```txt
GET  /api/transactions
GET  /api/transactions/:id
POST /api/transactions
```

Contoh body `POST /api/transactions`:

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 25000
    }
  ],
  "paid_amount": 100000
}
```

Contoh response:

```json
{
  "message": "Transaksi berhasil dibuat",
  "data": {
    "id": 1,
    "total": 50000,
    "paid_amount": 100000,
    "change_amount": 50000
  }
}
```

---

## Frontend Pages Target

### Dashboard

Menampilkan ringkasan:

* Total produk
* Total kategori
* Total transaksi
* Total pendapatan
* Produk stok rendah

### Products Page

Fitur:

* Melihat daftar produk
* Search produk
* Tambah produk
* Edit produk
* Hapus produk
* Menampilkan harga dan stok
* Badge untuk stok rendah

### Categories Page

Fitur:

* Melihat daftar kategori
* Tambah kategori
* Edit kategori
* Hapus kategori

### Cashier Page

Fitur:

* Search produk
* Tambah produk ke cart
* Update jumlah barang di cart
* Hapus item dari cart
* Hitung subtotal
* Hitung total
* Input uang bayar
* Hitung kembalian
* Submit transaksi

### Transactions Page

Fitur:

* Melihat riwayat transaksi
* Melihat detail transaksi
* Menampilkan total transaksi
* Menampilkan tanggal transaksi

---

## Rencana Database

Database belum final, tetapi struktur awal yang disarankan:

### categories

```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### products

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### transactions

```sql
CREATE TABLE transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  total DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) NOT NULL,
  change_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### transaction_items

```sql
CREATE TABLE transaction_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transaction_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## Coding Rules

Gunakan style berikut:

### Backend

* Gunakan CommonJS dulu agar cocok dengan Express Generator.
* Route hanya mengatur endpoint.
* Controller berisi logic request dan response.
* Model berisi query database atau data access.
* Jangan gunakan `res.render()`.
* Gunakan `res.json()` untuk semua response API.
* Gunakan status code yang jelas.
* Gunakan `try/catch` di controller.
* Buat response konsisten.

Contoh response sukses:

```json
{
  "message": "Data berhasil diambil",
  "data": []
}
```

Contoh response error:

```json
{
  "message": "Terjadi kesalahan pada server"
}
```

### Frontend

* Gunakan React functional components.
* Gunakan hooks seperti `useState` dan `useEffect`.
* Gunakan fetch API atau helper di `src/lib/api.js`.
* Gunakan komponen shadcn/ui untuk UI utama.
* Gunakan Tailwind class untuk layout dan styling.
* Pisahkan halaman ke folder `pages`.
* Pisahkan reusable component ke folder `components`.
* Pisahkan logic fitur ke folder `features`.

---

## File Penting yang Perlu Dibuat atau Diperbaiki

### Backend

```txt
backend/routes/index.js
backend/routes/productRoutes.js
backend/routes/categoryRoutes.js
backend/routes/transactionRoutes.js

backend/controllers/productController.js
backend/controllers/categoryController.js
backend/controllers/transactionController.js

backend/models/productModel.js
backend/models/categoryModel.js
backend/models/transactionModel.js

backend/config/db.js
backend/middlewares/errorMiddleware.js
```

### Frontend

```txt
frontend/src/lib/api.js
frontend/src/pages/Dashboard.jsx
frontend/src/pages/Products.jsx
frontend/src/pages/Categories.jsx
frontend/src/pages/Cashier.jsx
frontend/src/pages/Transactions.jsx
frontend/src/components/Navbar.jsx
frontend/src/components/Sidebar.jsx
frontend/src/components/Layout.jsx
frontend/src/features/products/ProductTable.jsx
frontend/src/features/products/ProductForm.jsx
frontend/src/features/transactions/Cart.jsx
```

---

## Prioritas Pengerjaan

Prioritas pertama:

1. Pastikan backend bisa jalan tanpa error.
2. Ubah semua `res.render()` menjadi `res.json()`.
3. Buat route `/api/products`.
4. Buat frontend bisa fetch ke `/api/products`.
5. Tampilkan data produk di halaman React.

Prioritas kedua:

1. Buat layout dashboard.
2. Buat halaman produk.
3. Buat tambah/edit/hapus produk.
4. Buat halaman kategori.
5. Buat halaman kasir sederhana.

Prioritas ketiga:

1. Hubungkan database.
2. Buat transaksi mengurangi stok produk.
3. Buat riwayat transaksi.
4. Buat detail transaksi.
5. Rapikan UI dengan shadcn/ui.

---

## Development Command

Jalankan backend:

```bash
cd backend
npm run dev
```

Jalankan frontend:

```bash
cd frontend
npm run dev
```

Backend:

```txt
http://localhost:3000
```

Frontend:

```txt
http://localhost:5173
```

---

## Current Known Issue

Jika backend menampilkan error:

```txt
Error: No default engine was specified and no extension was provided.
```

Penyebabnya adalah masih ada kode:

```js
res.render(...)
```

Solusinya adalah mengganti `res.render(...)` menjadi `res.json(...)` karena backend tidak memakai view engine.

---

## Request untuk Codex

Tolong bantu lanjutkan project SIPO ini dengan pendekatan bertahap dan aman.

Tugas utama:

1. Perbaiki backend Express agar menjadi REST API murni.
2. Pastikan tidak ada `res.render()` di backend.
3. Tambahkan script `dev` dengan nodemon jika belum ada.
4. Buat endpoint produk, kategori, dan transaksi.
5. Buat struktur controller, routes, dan models.
6. Buat frontend React dengan layout sederhana.
7. Gunakan Tailwind CSS dan shadcn/ui untuk tampilan.
8. Hubungkan frontend ke backend lewat proxy `/api`.
9. Jangan langsung membuat fitur terlalu kompleks.
10. Fokus dulu sampai data produk dari backend tampil di frontend.

Gunakan kode yang mudah dipahami mahasiswa pemula, jangan terlalu abstrak, dan beri komentar singkat pada bagian penting.
