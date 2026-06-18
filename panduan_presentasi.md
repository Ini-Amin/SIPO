# 🗣️ Panduan Presentasi UAS Proyek SIPO (Sistem Informasi Point of Sale)

Dokumen ini disusun untuk membantu seluruh anggota tim (**Fahmi**, **Fadhil**, **Haidar**, dan **Anda sebagai Project Leader**) memahami bagian pekerjaan mereka secara mendalam dan poin-poin penting yang harus dipresentasikan saat UAS hari Jumat depan agar mendapatkan nilai maksimal dari dosen penguji.

---

## 💡 Gambaran Umum Proyek (Penting untuk Seluruh Tim)
* **Arsitektur:** Terpisah antara **Frontend (React + Vite)** dan **Backend (Express.js)**. Komunikasi dilakukan melalui REST API berbasis JSON.
* **Database:** Menggunakan database relasional **MariaDB/MySQL** lokal (di-hosting melalui Laragon/XAMPP).
* **Tampilan (Aesthetic):** Menggunakan standar modern **Tailwind CSS** dan komponen premium **shadcn/ui** berbasis Radix UI untuk memberikan kesan profesional dan rapi.

---

## 🧑‍💻 Poin Presentasi Per Anggota Tim

### 1. Fahmi (Backend Developer)
Fahmi bertanggung jawab atas pembuatan infrastruktur REST API Kategori di backend, koneksi database, dan kualitas kode (testing).

* **Apa yang Harus Dijelaskan (Poin Teknis):**
  * **REST API & MVC:** Menjelaskan pembagian folder backend yang rapi menggunakan pola MVC (Model-Controller-Router). Router mengatur endpoint, Controller memproses request/response, dan Model melakukan query ke database.
  * **Koneksi Database:** Bagaimana menggunakan pool koneksi asinkronus (`mysql2/promise`) di [db.js](file:///D:/TungTungTungSahur/SIPO/backend/config/db.js) yang terhubung ke `.env`.
  * **Inisialisasi Database Otomatis:** Menjelaskan skrip [initDb.js](file:///D:/TungTungTungSahur/SIPO/backend/config/initDb.js) yang otomatis membuat database `sipo_db`, tabel relasional, foreign keys (`category_id` di tabel produk), dan *seed data* awal.
  * **Unit Testing API:** Mendemonstrasikan 35 unit test yang berhasil lulus 100%. Jelaskan bahwa pengujian dijalankan secara sekuensial (`--test-concurrency=1`) agar tidak bertabrakan saat memodifikasi database lokal secara bersamaan.
* **File Kode yang Perlu Ditunjukkan & Diterangkan:**
  * **[categoryController.js](file:///D:/TungTungTungSahur/SIPO/backend/controllers/categoryController.js)**: Tunjukkan fungsi `async/await` CRUD kategori dan validasi data request body.
  * **[categoryModel.js](file:///D:/TungTungTungSahur/SIPO/backend/models/categoryModel.js)**: Tunjukkan query SQL mentah seperti `INSERT INTO`, `SELECT`, `UPDATE`, dan `DELETE`.
  * **[categoryApi.test.js](file:///D:/TungTungTungSahur/SIPO/backend/test/categoryApi.test.js)**: Tunjukkan pengujian skenario sukses (200, 201) dan skenario gagal (400, 404, 409).
* **Demo yang Harus Dijalankan Fahmi:**
  * Menjalankan perintah `npm test` di terminal backend untuk menunjukkan hasil tes berwarna hijau (semua lulus).

---

### 2. Fadhil (Frontend Kategori Developer)
Fadhil bertanggung jawab atas antarmuka Manajemen Kategori di frontend dan mengintegrasikannya langsung dengan REST API backend.

* **Apa yang Harus Dijelaskan (Poin Teknis):**
  * **State Management React:** Menjelaskan penggunaan hook `useState` untuk menyimpan data kategori secara dinamis, status loading, pesan sukses, serta `useEffect` untuk otomatis memuat data saat halaman dibuka.
  * **Integrasi API:** Menjelaskan pemanggilan fungsi asinkronus (`getCategories`, `createCategory`, `deleteCategory`) dari file [api.js](file:///D:/TungTungTungSahur/SIPO/frontend/src/lib/api.js) untuk berkomunikasi dengan server backend.
  * **Desain Konsisten & Premium:** Menjelaskan penggunaan Tailwind CSS untuk layouting dan komponen **shadcn/ui** (`Card`, `Table`, `Badge`, `Button`) agar antarmuka Kategori terlihat mewah dan seragam dengan halaman Produk.
  * **Komponen Dialog Konfirmasi (shadcn/ui):** Menjelaskan penggantian popup bawaan browser yang kuno (`window.confirm`) dengan komponen modal dialog modern dari shadcn/ui saat menghapus kategori.
* **File Kode yang Perlu Ditunjukkan & Diterangkan:**
  * **[Categories.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/pages/Categories.jsx)**:
    * `handleSubmit`: Cara data dari form dikirim ke API backend, ditangani loadingnya, dan memunculkan notifikasi sukses.
    * `Table & TableBody`: Cara data kategori dipetakan (*mapping*) menjadi baris tabel secara dinamis.
    * `<Dialog>`: Implementasi modal konfirmasi hapus kategori.
* **Demo yang Harus Dijalankan Fadhil:**
  * Membuka tab "Kategori", mengisi form tambah kategori baru, menyimpannya, menunjukkan data langsung masuk ke tabel, lalu menghapusnya dan melihat modal dialog konfirmasi yang muncul di tengah layar.

---

### 3. Haidar (Frontend Produk Developer)
Haidar bertanggung jawab atas antarmuka Manajemen Produk di frontend dan visualisasi ringkasan stok.

* **Apa yang Harus Dijelaskan (Poin Teknis):**
  * **Visualisasi Ringkasan (Cards):** Menjelaskan bagaimana data produk diolah menggunakan `useMemo` untuk memproduksi ringkasan data instan (Total Produk, Total Stok, dan jumlah Produk dengan Stok Rendah).
  * **Badge Peringatan Otomatis:** Menjelaskan logika perubahan warna badge menjadi merah (`destructive`) apabila jumlah stok suatu produk bernilai 5 ke bawah (*stok rendah*).
  * **Fungsi Refresh data:** Menjelaskan tombol "Muat ulang" yang secara dinamis memperbarui state dan mengambil ulang data terbaru dari backend.
* **File Kode yang Perlu Ditunjukkan & Diterangkan:**
  * **[Products.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/pages/Products.jsx)**:
    * `useMemo` summary: Tunjukkan kalkulasi otomatis untuk total stok dan stok rendah.
    * Conditional Rendering: Tunjukkan komponen `LoadingState`, `ErrorState`, `EmptyState`, dan `ProductTable` yang dirender dinamis sesuai kondisi API.
* **Demo yang Harus Dijalankan Haidar:**
  * Membuka tab "Produk", menunjukkan daftar produk Kabel HDMI (tersedia) dan Mouse Wireless (badge merah "Stok rendah" karena stok bernilai 5), lalu mengklik tombol "Muat ulang" untuk menunjukkan kelancaran fetch API.

---

### 4. Anda (Project Leader & System Integrator)
Peran Anda adalah memimpin kolaborasi tim, merancang alur kerja, mendesain relasi database, dan mengintegrasikan kode dari seluruh anggota tim.

* **Apa yang Harus Dijelaskan (Poin Teknis):**
  * **Manajemen Tugas & Kolaborasi:** Menjelaskan pembagian area kerja melalui file [pembagiantugas.md](file:///D:/TungTungTungSahur/SIPO/pembagiantugas.md) untuk menghindari konflik kode dan memastikan pengerjaan paralel berjalan lancar.
  * **Desain Database Relasional:** Menjelaskan mengapa MariaDB/MySQL dipilih dan bagaimana relasi antara tabel `products` dan `categories` dibuat (`FOREIGN KEY` dengan `ON DELETE SET NULL` agar jika kategori dihapus, produk tidak ikut terhapus melainkan hanya bernilai kosong/NULL).
  * **Integrasi & Pemeliharaan Git:** Menjelaskan alur kerja Git menggunakan branch terpisah (`experiments`) sebelum digabung ke `main` demi keamanan kode utama.
  * **Global Layout & Navigasi:** Menjelaskan perancangan layout utama dan navigasi dinamis di [App.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/App.jsx) yang menyatukan halaman buatan Haidar dan Fadhil secara mulus.
* **File Kode yang Perlu Ditunjukkan & Diterangkan:**
  * **[App.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/App.jsx)**: Tunjukkan navigasi tab global dan kondisional render halaman.
  * **[pembagiantugas.md](file:///D:/TungTungTungSahur/SIPO/pembagiantugas.md)**: Tunjukkan dokumentasi alur kerja tim.
* **Demo yang Harus Dijalankan Anda:**
  * Membuka aplikasi secara keseluruhan, menunjukkan navigasi global yang responsif, menjelaskan alur data dari frontend ke backend, dan menjelaskan kesiapan proyek untuk tahap presentasi UAS.
