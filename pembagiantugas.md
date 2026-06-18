# 📋 Pembagian Tugas Pengembangan Fitur (Sprint Task)

Dokumen ini berisi detail pembagian tugas pengerjaan fitur Produk dan Kategori untuk **Haidar**, **Fahmi**, dan **Fadhil**. Harap perhatikan batasan area pengerjaan agar tidak terjadi konflik kode (*code conflict*).

---

## 🧑‍💻 Detail Tugas Anggota Tim

### 1. Haidar: CRUD Produk Frontend
Fokus pada pembuatan antarmuka (UI) manajemen produk dan integrasi ke API backend.
* **Tugas Utama:**
  * Membuat form tambah produk baru.
  * Membuat form edit/update produk yang sudah ada.
  * Menyediakan tombol hapus produk beserta fungsi eksekusinya.
  * Menghubungkan komponen UI dengan Product API.
* **File Utama yang Dikerjakan:**
  * `frontend/src/pages/Products.jsx`
  * `frontend/src/lib/api.js`

### 2. Fahmi: Backend Kategori
Fokus pada penyediaan infrastruktur data dan endpoint API untuk entitas kategori.
* **Tugas Utama:**
  * Membuat skema database (Model) untuk Kategori.
  * Membuat logika bisnis (Controller) untuk proses CRUD kategori.
  * Membuat jalur akses URL (Route) untuk endpoint `/api/categories`.
  * Membuat unit testing / pengujian API untuk memastikan semua endpoint berjalan lancar.
* **⚠️ Batasan Penting:** Hindari menyentuh atau mengedit folder `frontend`.

### 3. Fadhil: Halaman Kategori
Fokus pada pembuatan halaman antarmuka awal untuk manajemen kategori di frontend.
* **Tugas Utama:**
  * Membuat file halaman baru `Categories.jsx`.
  * Membuat visualisasi tabel untuk menampilkan list kategori.
  * Membuat form untuk kebutuhan input data kategori.
  * Menggunakan data buatan (**data dummy**) untuk pengisian tabel sementara karena backend masih diproses.
* **⚠️ Batasan Penting:** Hindari menyentuh atau mengedit halaman produk (`Products.jsx`).

---

## 🚀 Alur Kerja & Kontribusi
1. Buat branch Git baru dari `main` atau `develop` dengan format: `feature/nama-tugas` (contoh: `feature/backend-kategori`).
2. Lakukan commit secara berkala dengan pesan yang jelas.
3. Pastikan melakukan `git pull origin develop` sebelum membuat Pull Request (PR) untuk menghindari konflik kode yang besar.
