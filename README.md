# SapaKampus

SapaKampus adalah aplikasi web untuk mahasiswa berlatih menyusun pesan kepada dosen, terutama terkait perkuliahan, bimbingan, dan konsultasi akademik. Aplikasi berjalan di browser. Analisis pesan menggunakan aturan lokal sederhana; aplikasi ini tidak mengirim atau menyimpan teks pesan.

## Menjalankan aplikasi

Pastikan Node.js dan npm sudah terpasang. Dari folder proyek, jalankan:

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite (biasanya `http://localhost:5173`). Untuk memeriksa hasil build produksi, jalankan `npm run build`.

## Fitur saat ini

- Simulasi balasan dari empat persona dosen fiktif untuk latihan, bukan balasan dari dosen sungguhan.
- Analisis struktur pesan, skor panduan, dan saran diksi berbasis aturan.
- Pembuatan template pesan yang ditujukan kepada dosen untuk bimbingan, perkuliahan, ujian, nilai, konsultasi KRS/KHS, arahan dokumen akademik, tenggat tugas, magang, dan tindak lanjut.
- Nama, NPM, dan mata kuliah/program wajib diisi saat membuat draf template; detail tambahan tetap opsional.
- Panduan etika komunikasi.
- Salin draf atau buka WhatsApp dengan teks yang sudah disiapkan; pesan tidak dikirim otomatis.
- Penyamaran perkiraan untuk alamat email, nomor telepon, dan data yang diberi label sebelum ekspor. Periksa hasilnya sebelum digunakan.

Analisis bukan NLP/LLM dan tidak memahami konteks secara mendalam. Integrasi akun kampus, forum, komunitas, papan peringkat, AI eksternal, dan backend belum tersedia.
