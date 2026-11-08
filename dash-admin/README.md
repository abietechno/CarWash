# CarWash Cloud Admin — Frontend

Vue 3 + TypeScript + Vite + Tailwind CSS 4 + shadcn-vue + Pinia + Vue Router + axios.

## Jalankan

```sh
npm install
cp .env.example .env   # kalau belum ada
npm run dev            # http://localhost:5173
```

Request ke `/api/*` diteruskan ke backend di `VITE_API_PROXY` (default `http://127.0.0.1:8000`).

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server dev dengan hot reload |
| `npm run build` | Type-check + build ke `dist/` |
| `npm run type-check` | Cek TypeScript saja |
| `npx shadcn-vue@latest add <komponen>` | Tambah komponen UI (mis. `dialog`, `table`, `input`) |

## Struktur

```
src/
  components/ui/   komponen shadcn-vue
  lib/api.ts       instance axios + tipe response
  lib/utils.ts     helper cn()
  router/          Vue Router
  views/           halaman
```
