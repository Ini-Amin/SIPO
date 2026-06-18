# 📋 Pembagian Tugas Pengembangan Fitur (Sprint Task) - REVISI

Dokumen ini berisi pembagian tugas pengerjaan fitur Produk dan Kategori untuk **Haidar**, **Fahmi**, dan **Fadhil**. 

> [!IMPORTANT]
> **Update Kolaborasi (18 Juni 2026):**
> Integrasi antara pekerjaan backend Fahmi dan halaman frontend Fadhil telah diselesaikan menggunakan desain standar Tailwind CSS + shadcn/ui agar konsisten dengan halaman produk.

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
  * [frontend/src/pages/Products.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/pages/Products.jsx)
  * [frontend/src/lib/api.js](file:///D:/TungTungTungSahur/SIPO/frontend/src/lib/api.js)

### 2. Fahmi: Backend Kategori (SELESAI & TERINTEGRASI)
Fokus pada penyediaan infrastruktur data dan endpoint API untuk entitas kategori.
* **Tugas Utama:**
  * Membuat skema database (Model) untuk Kategori.
  * Membuat logika bisnis (Controller) untuk proses CRUD kategori.
  * Membuat jalur akses URL (Route) untuk endpoint `/api/categories`.
  * Membuat unit testing / pengujian API untuk memastikan semua endpoint berjalan lancar.
* **Status:** Pekerjaan backend Fahmi sudah disubmit ke branch `experiments` dan berhasil lulus unit test 100%.

### 3. Fadhil: Halaman Kategori (SELESAI & TERINTEGRASI)
Fokus pada pembuatan halaman antarmuka awal untuk manajemen kategori di frontend.
* **Tugas Utama:**
  * Membuat file halaman baru `Categories.jsx`.
  * Membuat visualisasi tabel untuk menampilkan list kategori.
  * Membuat form untuk kebutuhan input data kategori.
* **Status Pembaruan (Penyelarasan Desain):** 
  * Halaman [Categories.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/pages/Categories.jsx) telah **direvisi** dari inline CSS biasa ke standar **Tailwind CSS & shadcn/ui** agar senada dengan halaman produk.
  * Fitur local state (dummy data) Fadhil telah **dihubungkan langsung** ke REST API backend kategori milik Fahmi (`GET`, `POST`, dan `DELETE` kategori).

---

## 🚀 Alur Kerja & Kontribusi Selanjutnya
1. **Navigasi Halaman:** Navigasi tab untuk berpindah antara halaman Produk (Haidar) dan Kategori (Fadhil) sudah diimplementasikan di [frontend/src/App.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/App.jsx).
2. **Pekerjaan Haidar:** Haidar dapat melanjutkan pengerjaan CRUD Produk langsung di [frontend/src/pages/Products.jsx](file:///D:/TungTungTungSahur/SIPO/frontend/src/pages/Products.jsx) tanpa khawatir merusak halaman Kategori.
3. **Penyimpanan Git:** Seluruh hasil pengerjaan integrasi ini disimpan di branch `experiments` sebelum nantinya digabung (*merge*) ke `main` menjelang presentasi hari Jumat.
