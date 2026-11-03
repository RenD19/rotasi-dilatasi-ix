# Panduan Mengatur Google Apps Script (Rilis 1)

Rilis 1 hanya memakai **satu** server Apps Script: penerima **Kritik & Saran**.
Server kuis beserta panduannya menyusul pada rilis 2.

| | Server KRITIK & SARAN |
|---|---|
| Google Sheet | misalnya "Kritik dan Saran Transformasi Geometri" |
| File di Apps Script | `Code.gs` ← isi `server/Saran.gs` |
| Sheet yang dibuat otomatis | Saran |
| Diisi ke `js/config.js` | `SARAN_ENDPOINT` |

---

## A. Persiapan

1. **Pilih akun Google pemilik server.** Server berjalan atas nama akun ini, dan semua saran masuk ke Drive akun ini.
   Pada akun Google Workspace sekolah, admin kadang membatasi pilihan akses **"Siapa saja"**.
   Bila pilihan itu tidak muncul, mintalah admin membukanya atau gunakan akun pribadi.
2. **Menyalin isi file dari GitHub dengan utuh:** buka `server/Saran.gs` di repositori →
   klik ikon **Copy raw file** (dua kotak bertumpuk) di kanan atas isi file.
3. **Zona waktu.** Di editor Apps Script, klik **roda gigi (Setelan project)** → centang
   **Tampilkan file manifes "appsscript.json" di editor**. Buka `appsscript.json` dan pastikan berisi
   `"timeZone": "Asia/Makassar"` dan `"runtimeVersion": "V8"`.
4. **Izin pertama kali.** Saat menjalankan fungsi pertama kali muncul **Otorisasi diperlukan** →
   **Tinjau izin** → pilih akun → **Lanjutan** → **Buka … (tidak aman)** → **Izinkan**.
   Peringatan ini wajar untuk skrip buatan sendiri.

---

## B. Memasang server kritik & saran

Server ini terpisah agar data saran tidak bercampur dengan data nilai.

1. Buka https://sheets.new → beri nama, misalnya **Kritik dan Saran Transformasi Geometri**.
2. **Ekstensi → Apps Script** → ganti nama proyek, misalnya **Server Saran Transformasi Geometri**.
3. Atur `appsscript.json` seperti langkah A3 (zona waktu `Asia/Makassar`, runtime `V8`).
4. Klik `Code.gs` → Ctrl+A → Delete → tempel seluruh isi **`server/Saran.gs`** → Ctrl+S.
   Proyek ini **tidak** memerlukan `core.gs`.
5. Pilih fungsi **siapkan** → **▶ Jalankan** → beri izin seperti langkah A4.
   Sheet **Saran** muncul dengan kolom `waktu | nama | kritik_saran`.
6. **Terapkan → Penerapan baru → Aplikasi web**: Jalankan sebagai **Saya**, akses **Siapa saja** → **Terapkan**.
   Salin URL `/exec`.
7. Uji URL di peramban → harus tampil `{"ok":true,"layanan":"saran"}`.
8. Tempel URL ke `SARAN_ENDPOINT` di `js/config.js` (bukan ke `ENDPOINT`) → Commit.
9. Buka `index.html` → **💬 Kritik & Saran** → kirim satu saran uji → periksa sheet Saran → hapus baris uji.

Pengaman yang sudah ada: batas 30 kiriman per menit dari semua pengguna, jeda 30 detik per perangkat,
jebakan robot tersembunyi, dan teks berawalan `=`, `+`, `-`, `@` tidak dibaca sebagai rumus oleh Sheet.



---

## C. Memperbarui kode setelah terpasang

Bila `server/Saran.gs` diubah: tempel ulang ke `Code.gs` proyek saran → Simpan →
**Terapkan → Kelola penerapan** → ikon **pensil** → Versi: **Versi baru** → **Terapkan**. URL `/exec` tetap sama.

> Jangan memakai **Penerapan baru** untuk pembaruan, karena menghasilkan URL baru sehingga `js/config.js` harus diubah.

## D. Memecahkan masalah

| Gejala | Perbaikan |
|---|---|
| Form menampilkan "Mode uji …" | `SARAN_ENDPOINT` di `js/config.js` masih kosong, atau `?v=` belum dinaikkan |
| "Tidak dapat terhubung" | Pakai URL berakhiran `/exec` (bukan `/dev`) dan akses penerapan **Siapa saja** |
| Membuka URL `/exec` meminta login Google | Kelola penerapan → pensil → akses **Siapa saja** → Versi baru |
| Kolom `waktu` selisih beberapa jam | Zona waktu proyek belum `Asia/Makassar` (langkah A3) |
| Perubahan kode tidak berpengaruh | Lupa menerbitkan **Versi baru** (bagian C) |
