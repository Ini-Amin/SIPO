# SIPO - Sistem Informasi Point of Sale

SIPO adalah aplikasi Point of Sale (POS) berbasis web yang dirancang untuk membantu pengelolaan inventaris produk, kategori barang, transaksi kasir, dan riwayat penjualan. Project ini menggunakan arsitektur terpisah antara **Backend REST API** dan **Frontend Single Page Application (SPA)**.

---

## 🚀 Fitur yang Tersedia
- **Manajemen Produk (CRUD)**: Menambah, mengubah, melihat, dan menghapus produk dengan peringatan otomatis untuk stok rendah (≤ 5 unit).
- **Manajemen Kategori (CRUD)**: Pengelompokan produk dengan validasi dan konfirmasi penghapusan.
- **Desain Modern Cyber Gelap (Dark Theme)**: Antarmuka premium dengan nuansa gelap (*dark cybernetic*) berbasis gradasi warna neon teal & violet, lengkap dengan efek glassmorphism dan modal transparan.
- **Konfigurasi Proxy Vite**: Router frontend otomatis meneruskan request `/api/*` ke server backend Express (`http://localhost:3000`).

---

## 🛠️ Tech Stack
### Frontend
- **Framework**: React.js (via Vite)
- **Styling**: Tailwind CSS & Lucide Icons
- **UI Components**: Radix UI & shadcn/ui

### Backend
- **Framework**: Express.js (Node.js)
- **Database**: MariaDB / MySQL (menggunakan `mysql2`)
- **API Style**: REST API Murni (Output JSON, tanpa server-side rendering views)

---

## 📂 Struktur Folder
```text
SIPO/
├── backend/            # Express.js REST API
│   ├── config/         # Konfigurasi database & init skema
│   ├── controllers/    # Logika bisnis API (Product & Category)
│   ├── models/         # Kueri database MariaDB/MySQL
│   ├── routes/         # Endpoint routing Express
│   └── test/           # Unit/Integration testing API
├── frontend/           # React + Vite Client
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── lib/        # API connector (fetch wrapper)
│   │   ├── pages/      # Halaman utama (Products, Categories)
│   │   └── index.css   # Variabel warna & Tailwind CSS
```

---

## ⚡ Petunjuk Menjalankan Aplikasi

### 1. Inisialisasi Database
1. Pastikan Anda memiliki server MariaDB/MySQL yang berjalan.
2. Buat database baru bernama `sipo_db`.
3. Sesuaikan kredensial koneksi database di file [backend/config/db.js](file:///D:/TungTungTungSahur/SIPO/backend/config/db.js).
4. Jalankan script inisialisasi tabel atau biarkan sistem backend berjalan untuk inisialisasi otomatis.

### 2. Jalankan Backend API
```bash
cd backend
npm install
npm run dev
```
*Backend akan berjalan di: `http://localhost:3000`*

### 3. Jalankan Frontend React (Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend akan berjalan di: `http://localhost:5173`*

---

## 💡 Saran Pengembangan Selanjutnya
Untuk melengkapi project SIPO menuju POS yang lengkap, berikut beberapa saran fitur berikutnya yang dapat diimplementasikan:
1. **Fitur Transaksi Kasir (Cashier Page)**: Halaman untuk memilih produk, memasukkan ke keranjang belanja, kalkulasi otomatis subtotal/kembalian, dan mengirim transaksi ke backend.
2. **Pengurangan Stok Otomatis**: Setiap transaksi sukses harus secara otomatis memotong stok produk yang dibeli melalui query transaksi database.
3. **Riwayat Penjualan (Transaction History)**: Halaman rekapitulasi semua transaksi yang pernah dilakukan, lengkap dengan detail item yang dibeli.
4. **Dashboard Statistik**: Halaman utama yang menampilkan ringkasan pendapatan, total produk terjual, dan diagram grafik transaksi harian.
