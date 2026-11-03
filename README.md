# Transformasi Geometri: Rotasi dan Dilatasi

Media pembelajaran Matematika Kelas IX (Fase D). **Rilis 1** berisi halaman materi:

- **Belajar**: 21 layar materi dari bagian A (Rotasi) sampai E (Konteks Bone), lengkap dengan alat interaktif
  untuk memutar titik, bangun, dan garis serta mengubah faktor skala.
- **Latihan Mandiri**: 24 tipe soal acak (LOTS, MOTS, HOTS) dengan petunjuk bertahap, 📍 Di mana salahku?,
  🔑 Lihat jawaban, dan 📝 Penyelesaian.
- **💬 Kritik & Saran**: form saran siswa yang dikirim ke Google Sheet (opsional).

Halaman **Kuis** (skor disetor ke Google Sheet) menyusul pada rilis 2.

## Isi folder

```
media-transformasi-geometri/
├── index.html            halaman MATERI: tab Belajar + Latihan Mandiri + Kritik & Saran
├── .nojekyll             berkas kosong; membuat GitHub Pages menyajikan file apa adanya
├── README.md             berkas ini
├── PANDUAN-APPS-SCRIPT.md  panduan memasang server Kritik & Saran
├── css/
│   └── gaya.css          seluruh tampilan, disusun dalam lapisan (@layer)
├── js/
│   ├── config.js         PENGATURAN: alamat server  ← biasanya hanya file ini yang diubah
│   ├── core.js           CORE BERSAMA: pembangkit 24 tipe soal + penilai (nanti juga ditempel ke server kuis)
│   ├── komponen.js       komponen bersama: bidang koordinat, maskot Plus, penampil langkah soal
│   ├── petunjuk.js       petunjuk lanjutan di Latihan Mandiri
│   ├── penyelesaian.js   penyelesaian bertahap (KaTeX) setelah jawaban benar atau 🔑 Lihat jawaban
│   ├── belajar-data.js   teks materi dan alat interaktif tab Belajar
│   ├── belajar.js        perilaku tab Belajar
│   ├── latihan.js        perilaku tab Latihan Mandiri
│   ├── saran.js          tombol dan form Kritik & Saran
│   └── main.js           pengatur tab
└── server/               SALINAN kode server; dipasang di Google Apps Script, BUKAN dijalankan GitHub
    └── Saran.gs          server kritik & saran
```

### Ingin mengubah sesuatu? Buka file ini

| Yang ingin diubah | File |
|---|---|
| Alamat server Kritik & Saran | `js/config.js` → `SARAN_ENDPOINT` |
| Teks materi, contoh, alat interaktif di tab Belajar | `js/belajar-data.js` |
| Teks petunjuk lanjutan di Latihan Mandiri | `js/petunjuk.js` |
| Langkah penyelesaian yang muncul setelah menjawab | `js/penyelesaian.js` |
| Soal, kunci, pengecoh, cara menilai | `js/core.js` |
| Gambar atau kalimat maskot Plus | `js/komponen.js`, bagian `Maskot "Plus"` |
| Warna dan tata letak | `css/gaya.css` |

## Menerbitkan di GitHub Pages (tanpa perintah terminal)

1. **Buat akun** di https://github.com (gratis), lalu masuk.
2. **Buat repositori baru.** Klik **+** di kanan atas → **New repository**.
   - Repository name: misalnya `transformasi-geometri` (huruf kecil, tanpa spasi).
   - Pilih **Public**. GitHub Pages gratis hanya untuk repositori publik.
   - Klik **Create repository**.
3. **Unggah file.** Klik **uploading an existing file** (atau **Add file → Upload files**).
   - Ekstrak berkas `.zip`, buka folder `media-transformasi-geometri`, pilih **semua isinya**
     (`index.html`, `.nojekyll`, folder `css`, `js`, `server`, `README.md`, `PANDUAN-APPS-SCRIPT.md`),
     lalu seret ke halaman GitHub. Jangan menyeret folder induknya, agar `index.html` berada di akar repositori.
   - Bila `.nojekyll` tidak ikut (file berawalan titik kadang tersembunyi), buat sendiri:
     **Add file → Create new file**, beri nama `.nojekyll`, biarkan kosong, lalu **Commit**.
   - Klik **Commit changes**.
4. **Aktifkan Pages.** Buka **Settings → Pages**.
   - Source: **Deploy from a branch**. Branch: **main**, folder **/ (root)** → **Save**.
5. **Tunggu 1–2 menit**, lalu muat ulang halaman Settings → Pages.
   Alamatnya muncul seperti `https://namaakun.github.io/transformasi-geometri/`.
   - Materi: `https://namaakun.github.io/transformasi-geometri/`
   - Langsung ke Latihan Mandiri: `https://namaakun.github.io/transformasi-geometri/#latihan`

## Kritik & Saran (opsional)

Tanpa pengaturan apa pun, form Kritik & Saran tetap tampil, tetapi isinya tidak dikirim (mode uji).
Agar saran siswa tersimpan di Google Sheet, ikuti **[PANDUAN-APPS-SCRIPT.md](PANDUAN-APPS-SCRIPT.md)**,
lalu isi `SARAN_ENDPOINT` di `js/config.js`:

```js
window.OPTIMUM_CONFIG={ENDPOINT:"",SARAN_ENDPOINT:"https://script.google.com/macros/s/…/exec",MATERI:"transformasi"};
```

`ENDPOINT` (server kuis) dibiarkan kosong sampai rilis 2.

## Aturan penting

- **Setiap memperbarui file di GitHub, naikkan penanda versi** di `index.html`
  (misalnya `?v=2026-11-02.2` → `?v=2026-11-10.1` pada semua baris `<link>` dan `<script>`).
  Tanpa ini, peramban siswa bisa tetap memakai salinan lama.
  Cara cepat di GitHub: buka `index.html` → pensil → Ctrl+F cari `?v=` → ubah semuanya → Commit.
- Urutan `<script>` di `index.html` jangan diubah:
  `config → core → komponen → petunjuk → penyelesaian → belajar-data → belajar → latihan → saran → main`
- **`js/core.js` menentukan kode cek** yang nanti dicocokkan dengan server kuis (rilis 2).
  Kode cek rilis ini: `2026-11-02.2:3492c97e`. Bila `core.js` diubah, kode ini ikut berubah.

## Pemeriksaan mandiri di konsol

Buka halaman, tekan F12 → Console, lalu ketik:

- `CORE.uji()` → harus `"Semua soal aman."`
- `PL.Petunjuk.uji()` → harus `"Semua petunjuk lanjutan aman."`
- `PL.Penyelesaian.uji()` → harus `"Semua penyelesaian aman."`
- `CORE.cek()` → kode cek, misalnya `"2026-11-02.2:3492c97e"`

Jalankan semuanya setiap kali `core.js`, `petunjuk.js`, atau `penyelesaian.js` diubah.

## Mencoba di komputer sendiri

Klik dua kali `index.html`. Halaman berjalan langsung dari folder tanpa server.
Rumus KaTeX memerlukan internet; tanpa internet, rumus tampil sebagai teks biasa.
