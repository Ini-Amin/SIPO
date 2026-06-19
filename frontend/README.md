Quick start

1. Install dependencies

```powershell
cd "e:/Tugas UMK/Semester 4/PPW/Pos/frontend"
npm install
```

2. Run dev server (Vite)

```powershell
npm run dev
```

Notes
- vite.config.js proxies `/api` to `http://localhost:3000`. Jika backend berjalan di port lain, ubah proxy atau `API_URL` di `src/lib/api.js`.
- Pastikan backend dijalankan (`cd backend && npm run dev`).
