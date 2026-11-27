# BeritaBaca - Pembaca Teks Berita Indonesia

Aplikasi web sederhana untuk membaca teks berita Indonesia dengan suara (Text-to-Speech).
Tanpa login, tanpa backend, berjalan di browser.

## Fitur

- Tempel / ketik teks berita
- 3 contoh berita siap pakai
- 3 preset suara: Berita Formal, Cerita / Anak, Santai
- Pengaturan kecepatan 0.5x - 1.5x
- Highlight kalimat yang sedang dibaca, klik kalimat untuk mulai dari sana
- Hitung kata + estimasi durasi
- Riwayat 10 terakhir (tersimpan di browser)
- Mode Gelap / Terang, desain minimalis

## Struktur Folder (VS Code)

```
beritabaca/
  index.html
  style.css
  script.js
  README.md
  beritabaca-single.html  (versi 1 file, untuk dibagikan cepat)
```

## Catatan Suara

Suara berasal dari perangkat / browser (Web Speech API). Untuk suara Indonesia yang natural:

- Android: Pengaturan > Bahasa > Text-to-speech > pilih suara Bahasa Indonesia
- Chrome laptop: pastikan voice `id-ID` tersedia

Dibuat untuk BeritaBaca v1.
