# Antigravity Rules

Dokumen ini berisi profil pengguna, preferensi pengembangan, dan aturan umum yang harus diikuti oleh Antigravity (AGY) di proyek ini.

## 👤 Profil & Preferensi Pengguna (User Profile)
- **Bahasa Utama**: Bahasa Indonesia (santai, komunikatif, dan informatif).
- **Gaya Komunikasi**: Kolaboratif, langsung ke inti permasalahan, menyertakan penjelasan teknis yang ramah jika diperlukan.
- **Tingkat Keahlian**: Pengembang Full-Stack yang menyukai kode bersih (clean code) dan arsitektur terstruktur.

## 🛠️ Aturan Pengembangan Proyek (Project Dev Rules)
- **Database & Integrasi Cloud**:
  - Selalu dukung konfigurasi ganda: **Aiven (Cloud)** menggunakan `DATABASE_URL` (dengan bypass SSL `rejectUnauthorized: false`) dan **Localhost** menggunakan variabel individual (`DB_HOST`, `DB_USER`, dll.).
  - Di script inisialisasi database (`initDb.js`), lewati kueri `CREATE DATABASE` jika koneksi berupa URI string karena batasan hak akses admin di cloud DB.
- **Hosting & Deployment (Vercel Monorepo)**:
  - Proyek monorepo ini (Express backend + Vite/React frontend) menggunakan konfigurasi Vercel `experimentalServices` di root `vercel.json`.
  - Service `frontend` menggunakan framework `vite` dan routePrefix `/`.
  - Service `backend` menggunakan entrypoint `app.js` dan routePrefix `/_/backend` tanpa menuliskan properti `runtime` secara eksplisit (agar ter-detect otomatis oleh Vercel).
  - Di frontend, atur `API_BASE_URL` agar otomatis mengarah ke `/` di local development (Vite proxy) dan ke `/_/backend` di production Vercel.

## 🗄️ Riwayat & Pembelajaran
- Jika ada solusi setup yang kompleks atau koreksi penting dari pengguna, rekomendasikan perintah `/learn` untuk mencatat perilaku atau instruksi tersebut agar diingat secara permanen untuk tugas berikutnya.
