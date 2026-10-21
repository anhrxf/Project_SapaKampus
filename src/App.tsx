import { useMemo, useState } from "react";

type Page = "simulator" | "templates" | "guide";
type Persona = "formal" | "busy" | "friendly" | "strict";

type Analysis = {
  score: number;
  greeting: boolean;
  identity: boolean;
  purpose: boolean;
  politeRequest: boolean;
  gratitude: boolean;
  tense: boolean;
  suggestions: string[];
  improved: string;
};

const informalWords: Array<[RegExp, string]> = [
  [/\bsy\b/gi, "saya"],
  [/\byg\b/gi, "yang"],
  [/\bdgn\b/gi, "dengan"],
  [/\bkrn\b/gi, "karena"],
  [/\bklo\b/gi, "kalau"],
  [/\bbsk\b/gi, "besok"],
  [/\bmksh\b/gi, "terima kasih"],
  [/\bgpp\b/gi, "tidak apa-apa"],
  [/\btdk\b/gi, "tidak"],
  [/\baja\b/gi, "saja"],
];

const personas: Record<Persona, { name: string; description: string }> = {
  formal: { name: "Bu Ratna", description: "Formal dan terstruktur" },
  busy: { name: "Pak Dimas", description: "Sibuk, suka pesan ringkas" },
  friendly: { name: "Pak Arif", description: "Ramah dan santai" },
  strict: { name: "Prof. Sinta", description: "Tegas dan detail" },
};

const templates = [
  { id: "guidance", name: "Meminta jadwal bimbingan", category: "Bimbingan" },
  { id: "absence", name: "Meminta izin tidak mengikuti kuliah", category: "Perkuliahan" },
  { id: "question", name: "Bertanya tentang materi kuliah", category: "Perkuliahan" },
  { id: "schedule", name: "Menanyakan jadwal kuliah", category: "Perkuliahan" },
  { id: "exam", name: "Menanyakan jadwal atau materi ujian", category: "Perkuliahan" },
  { id: "grade", name: "Meminta penjelasan tentang nilai", category: "Akademik" },
  { id: "deadline", name: "Memohon perpanjangan tenggat tugas", category: "Perkuliahan" },
  { id: "krs", name: "Berkonsultasi tentang KRS atau KHS", category: "Konsultasi" },
  { id: "letter", name: "Meminta arahan dosen tentang dokumen akademik", category: "Konsultasi" },
  { id: "internship", name: "Meminta arahan magang atau tugas akhir", category: "Bimbingan" },
  { id: "followup", name: "Menindaklanjuti pesan kepada dosen", category: "Tindak lanjut" },
];

function analyzeMessage(message: string): Analysis {
  const text = message.trim();
  const greeting =
    /\b(assalamualaikum|selamat\s+(pagi|siang|sore|malam)|halo|salam)\b/i.test(text);
  const identity = /\b(nama saya|saya\s+[A-Z][a-z]+|npm|nim|mahasiswa)\b/i.test(text);
  const purpose =
    /\b(ingin|bermaksud|menghubungi|menanyakan|meminta|terkait|mengenai)\b/i.test(
      text,
    );
  const politeRequest = /\b(mohon|mohon izin|apakah|berkenan|bolehkah|kiranya)\b/i.test(
    text,
  );
  const gratitude = /\b(terima kasih|terimakasih|matur nuwun)\b/i.test(text);
  const tense = /\b(sekarang juga|cepat|kok|kan|dong|woy|buruan)\b/i.test(text);

  let score =
    Number(greeting) * 20 +
    Number(identity) * 20 +
    Number(purpose) * 20 +
    Number(politeRequest) * 20 +
    Number(gratitude) * 20 -
    Number(tense) * 15;
  if (/\b(gpp|yg|sy|jgn|klo|krn|tpt|bkn|dgn|ping)\b/i.test(text)) score -= 15;
  score = Math.max(0, Math.min(100, score));

  let improved = message;
  const suggestions: string[] = [];
  for (const [pattern, replacement] of informalWords) {
    if (pattern.test(improved)) {
      pattern.lastIndex = 0;
      improved = improved.replace(pattern, replacement);
      suggestions.push(`Gunakan “${replacement}” agar lebih formal.`);
    }
    pattern.lastIndex = 0;
  }
  if (!greeting) suggestions.push("Awali dengan salam dan sapaan yang sesuai.");
  if (!identity) suggestions.push("Kenalkan nama dan identitas akademik Anda.");
  if (!purpose) suggestions.push("Sampaikan tujuan pesan secara langsung.");
  if (!politeRequest) suggestions.push("Gunakan permohonan yang santun dan jelas.");
  if (!gratitude) suggestions.push("Akhiri dengan ucapan terima kasih.");
  if (tense) suggestions.push("Hindari kata yang dapat terdengar mendesak atau menekan.");

  return {
    score,
    greeting,
    identity,
    purpose,
    politeRequest,
    gratitude,
    tense,
    suggestions: suggestions.slice(0, 4),
    improved,
  };
}

function makeReply(persona: Persona, score: number): string {
  if (persona === "friendly") {
    return score >= 50
      ? "Halo! Baik, silakan kirim detail mata kuliah dan waktu yang kamu maksud."
      : "Halo! Boleh jelaskan mata kuliah dan maksud pesanmu terlebih dahulu?";
  }
  if (persona === "busy") {
    return score >= 60
      ? "Baik. Mohon kirim ringkasan pertanyaan serta mata kuliah atau kelasnya."
      : "Mohon tuliskan nama, mata kuliah, dan tujuan pesan secara singkat.";
  }
  if (persona === "strict") {
    return score >= 80
      ? "Baik. Silakan lengkapi informasi pendukung dan ikuti ketentuan perkuliahan."
      : "Mohon lengkapi pesan dengan identitas, konteks mata kuliah, dan tujuan yang jelas.";
  }
  return score >= 60
    ? "Baik, terima kasih. Silakan sampaikan informasi pendukung terkait perkuliahan."
    : "Mohon lengkapi identitas dan konteks mata kuliah agar saya dapat memahami pertanyaan Anda.";
}

function redactSensitiveData(text: string): string {
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email disamarkan]")
    .replace(/\b(?:\+?62|0)[\d\s().-]{7,15}\d\b/g, "[nomor disamarkan]")
    .replace(
      /\b(nama|npm|nim|nomor induk mahasiswa|no\.?\s*hp|telepon)\s*[:=-]\s*[^,\n;]+/gi,
      (field) => `${field.split(/[:=-]/, 1)[0]}: [disamarkan]`,
    );
}

function createTemplate(
  id: string,
  name: string,
  npm: string,
  course: string,
  detail: string,
): string {
  const identity = `Perkenalkan, saya ${name.trim() || "[Nama]"}, NPM ${npm.trim() || "[NPM]"} dari ${course.trim() || "[Mata kuliah / program]"}.`;
  const context = detail.trim();
  const messages: Record<string, string> = {
    guidance: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nSaya ingin meminta waktu untuk bimbingan.${context ? ` Sebagai konteks tambahan, ${context}` : ""}\n\nApakah Bapak/Ibu berkenan menginformasikan waktu yang tersedia?\n\nTerima kasih.`,
    absence: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nMohon izin tidak dapat mengikuti perkuliahan${context ? ` karena ${context}` : ""}.\n\nSaya akan berusaha mengejar materi yang tertinggal. Terima kasih atas pengertiannya.`,
    question: `Selamat siang, Bapak/Ibu.\n\n${identity}\nSaya ingin bertanya mengenai ${context || "materi perkuliahan"}.\n\nApabila berkenan, mohon arahan Bapak/Ibu. Terima kasih.`,
    schedule: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nMohon informasi mengenai jadwal perkuliahan${context ? `, khususnya ${context}` : ""}.\n\nApabila ada perubahan jadwal, mohon informasinya. Terima kasih.`,
    exam: `Selamat siang, Bapak/Ibu.\n\n${identity}\nSaya ingin menanyakan informasi jadwal atau materi ujian${context ? ` terkait ${context}` : ""}.\n\nApabila informasi tersebut sudah tersedia, mohon arahannya. Terima kasih.`,
    grade: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nMohon izin bertanya mengenai nilai${context ? ` pada ${context}` : " perkuliahan ini"}. Jika berkenan, saya ingin memahami bagian yang perlu saya perbaiki.\n\nTerima kasih atas waktu dan arahannya.`,
    deadline: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nMohon izin mengajukan perpanjangan waktu pengumpulan tugas${context ? ` karena ${context}` : ""}.\n\nSaya memahami keputusan tetap mengikuti kebijakan perkuliahan. Terima kasih atas pertimbangannya.`,
    krs: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nSaya ingin berkonsultasi dengan Bapak/Ibu mengenai ${context || "pengisian KRS atau informasi KHS"}.\n\nApabila berkenan, mohon arahan akademik yang perlu saya perhatikan. Terima kasih.`,
    letter: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nSaya ingin meminta arahan Bapak/Ibu mengenai dokumen akademik${context ? ` untuk keperluan ${context}` : ""}.\n\nApabila berkenan, mohon informasi tentang hal yang perlu saya siapkan. Terima kasih.`,
    internship: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nSaya ingin meminta arahan mengenai ${context || "rencana magang atau tugas akhir"}.\n\nApabila Bapak/Ibu berkenan, mohon informasi mengenai langkah awal yang sebaiknya saya persiapkan. Terima kasih.`,
    followup: `Selamat pagi, Bapak/Ibu.\n\n${identity}\nMohon izin menindaklanjuti pesan saya sebelumnya kepada Bapak/Ibu terkait ${context || "keperluan akademik tersebut"}.\n\nApabila Bapak/Ibu berkenan, mohon informasinya. Terima kasih.`,
  };
  return messages[id] ?? "";
}

function App() {
  const [page, setPage] = useState<Page>("simulator");
  const [message, setMessage] = useState("");
  const [persona, setPersona] = useState<Persona>("formal");
  const [reply, setReply] = useState("");
  const [hasSimulated, setHasSimulated] = useState(false);
  const [templateId, setTemplateId] = useState("guidance");
  const [studentName, setStudentName] = useState("");
  const [studentNpm, setStudentNpm] = useState("");
  const [course, setCourse] = useState("");
  const [detail, setDetail] = useState("");
  const [maskData, setMaskData] = useState(true);
  const [notice, setNotice] = useState("");

  const analysis = useMemo(() => analyzeMessage(message), [message]);
  const templatePreview = createTemplate(
    templateId,
    studentName,
    studentNpm,
    course,
    detail,
  );
  const exportMessage = maskData ? redactSensitiveData(message) : message;
  const scoreLabel =
    analysis.score >= 80
      ? "Sangat baik"
      : analysis.score >= 60
        ? "Cukup sopan"
        : analysis.score >= 35
          ? "Perlu dirapikan"
          : "Perlu diperbaiki";

  function simulate() {
    if (!message.trim()) {
      setNotice("Tulis pesan terlebih dahulu untuk menjalankan simulasi.");
      return;
    }
    setNotice("");
    setReply(makeReply(persona, analysis.score));
    setHasSimulated(true);
  }

  async function copyDraft() {
    if (!exportMessage.trim()) {
      setNotice("Tulis atau buat draf pesan terlebih dahulu.");
      return;
    }
    try {
      await navigator.clipboard.writeText(exportMessage);
      setNotice("Draf berhasil disalin. Periksa kembali sebelum mengirim.");
    } catch {
      setNotice("Tidak dapat menyalin otomatis. Pilih dan salin teks draf secara manual.");
    }
  }

  function useImprovedText() {
    setMessage(analysis.improved);
    setNotice("Saran diksi diterapkan. Pastikan isi pesan tetap sesuai maksud Anda.");
  }

  function loadTemplate() {
    if (!studentName.trim() || !studentNpm.trim() || !course.trim()) {
      setNotice("Lengkapi nama, NPM, dan mata kuliah/program untuk membuat draf.");
      return;
    }
    setMessage(templatePreview);
    setHasSimulated(false);
    setReply("");
    setPage("simulator");
    setNotice("Template dimasukkan ke simulator. Lengkapi dan periksa sebelum digunakan.");
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="SapaKampus beranda">
          <span className="brand-mark">s</span>
          <span>Sapa<span className="brand-accent">Kampus</span></span>
        </a>
        <div className="privacy-pill"><span className="privacy-dot" /> Diproses di perangkat ini</div>
      </header>

      <main className="page-wrap">
        <section className="hero">
          <div>
            <p className="eyebrow">LATIHAN PESAN MAHASISWA KEPADA DOSEN</p>
            <h1>Hubungi dosen dengan<br /><span>jelas dan penuh hormat.</span></h1>
            <p className="hero-copy">Latih pesan untuk keperluan kuliah, bimbingan, dan konsultasi akademik.</p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-circle" />
            <div className="art-card art-card-one">“Selamat pagi, Bu...”</div>
            <div className="art-card art-card-two">✓ Draf untuk dosen</div>
            <div className="art-sparkle">✳</div>
          </div>
        </section>

        <nav className="tab-nav" aria-label="Navigasi utama">
          <button className={page === "simulator" ? "nav-tab active" : "nav-tab"} onClick={() => setPage("simulator")}>
            <span className="tab-icon">✎</span> Simulasi ke dosen
          </button>
          <button className={page === "templates" ? "nav-tab active" : "nav-tab"} onClick={() => setPage("templates")}>
            <span className="tab-icon">▤</span> Template ke dosen
          </button>
          <button className={page === "guide" ? "nav-tab active" : "nav-tab"} onClick={() => setPage("guide")}>
            <span className="tab-icon">☼</span> Panduan dosen
          </button>
          <span className="nav-caption">LATIHAN MAHASISWA KE DOSEN</span>
        </nav>

        {page === "simulator" && (
          <div className="content-grid">
            <section className="panel compose-panel">
              <div className="panel-heading">
                <div>
                  <p className="section-kicker">RUANG SIMULASI</p>
                  <h2>Susun pesan untuk dosen</h2>
                  <p className="muted">Latih pesan kuliah atau bimbingan sebelum menghubungi dosen.</p>
                </div>
                <span className="step-badge">01 <i>/ 02</i></span>
              </div>

              <label className="field-label" htmlFor="persona">Pilih gaya dosen dalam simulasi</label>
              <div className="persona-grid">
                {(Object.entries(personas) as Array<[Persona, (typeof personas)[Persona]]>).map(([id, item]) => (
                  <button key={id} className={`persona-option ${persona === id ? "selected" : ""}`} onClick={() => setPersona(id)}>
                    <span className="avatar">{item.name.slice(0, 1)}</span>
                    <span className="persona-text"><strong>{item.name}</strong><small>{item.description}</small></span>
                    <span className="radio-dot" />
                  </button>
                ))}
              </div>

              <div className="textarea-heading">
                <label className="field-label" htmlFor="message">Tulis pesan untuk dosen</label>
                <span className="character-count">{message.length} karakter</span>
              </div>
              <textarea
                id="message"
                className="message-input"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setHasSimulated(false);
                }}
                placeholder={"Contoh: Selamat pagi, Bu. Saya [nama] dari mata kuliah..."}
                maxLength={1200}
              />
              <div className="input-footnote"><span>⌁</span> Jangan masukkan data pribadi yang tidak diperlukan.</div>
              <button className="primary-button full-button" onClick={simulate}>Coba simulasi <span>→</span></button>

              {hasSimulated && (
                <div className="simulation-result" aria-live="polite">
                  <div className="result-topline"><strong>Contoh balasan dosen · {personas[persona].name}</strong><span>SIMULASI</span></div>
                  <p>{reply}</p>
                  <small>Balasan ini hanya simulasi otomatis, bukan balasan dari dosen sungguhan.</small>
                </div>
              )}
            </section>

            <aside className="side-column">
              <section className="panel analysis-panel">
                <div className="panel-heading compact-heading">
                  <div><p className="section-kicker">CEK SEBELUM MENGHUBUNGI DOSEN</p><h2>Analisis pesan</h2></div>
                  <span className="analysis-icon">✳</span>
                </div>
                <div className="score-row">
                  <div><strong className="score-number">{analysis.score}</strong><span className="score-max">/100</span></div>
                  <span className={`score-label score-${analysis.score >= 60 ? "good" : analysis.score >= 35 ? "mid" : "low"}`}>{scoreLabel}</span>
                </div>
                <div className="score-track"><span style={{ width: `${analysis.score}%` }} /></div>
                <p className="score-caption">Skor panduan, bukan penilaian mutlak atas kesopananmu.</p>

                <div className="check-list">
                  <CheckItem label="Salam pembuka" checked={analysis.greeting} />
                  <CheckItem label="Identitas diri" checked={analysis.identity} />
                  <CheckItem label="Tujuan yang jelas" checked={analysis.purpose} />
                  <CheckItem label="Permohonan santun" checked={analysis.politeRequest} />
                  <CheckItem label="Ucapan terima kasih" checked={analysis.gratitude} />
                </div>

                <div className="suggestion-box">
                  <div className="suggestion-title"><span>✦</span> Saran penyempurnaan</div>
                  {message.trim() ? (
                    <>
                      <ul>{analysis.suggestions.length ? analysis.suggestions.map((item) => <li key={item}>{item}</li>) : <li>Struktur pesanmu sudah mencakup unsur utama.</li>}</ul>
                      {analysis.improved !== message && <button className="text-button" onClick={useImprovedText}>Terapkan saran diksi →</button>}
                    </>
                  ) : <p className="empty-hint">Mulai menulis untuk melihat saran yang relevan.</p>}
                </div>
                <p className="local-note"><span>◉</span> Analisis berbasis aturan di browser. Teks tidak dikirim atau disimpan.</p>
              </section>

              <section className="panel export-panel">
                <div className="export-title"><span className="export-icon">↗</span><div><strong>Draf pesan ke dosen</strong><small>Periksa lagi sebelum dikirim.</small></div></div>
                <label className="privacy-toggle"><input type="checkbox" checked={maskData} onChange={(event) => setMaskData(event.target.checked)} /><span>Samarkan kontak dan identitas pada draf ekspor</span></label>
                <p className="mask-warning">Penyamaran otomatis bisa keliru; cek hasil draf secara manual.</p>
                <div className="export-actions">
                  <button className="secondary-button" onClick={copyDraft}>Salin draf</button>
                  <a className="whatsapp-button" href={exportMessage.trim() ? `https://wa.me/?text=${encodeURIComponent(exportMessage)}` : undefined} target="_blank" rel="noreferrer" onClick={(event) => {
                    if (!exportMessage.trim()) {
                      event.preventDefault();
                      setNotice("Tulis pesan terlebih dahulu sebelum membuka WhatsApp.");
                    }
                  }}>Buka WhatsApp <span>↗</span></a>
                </div>
              </section>
            </aside>
          </div>
        )}

        {page === "templates" && (
          <section className="panel template-page">
            <div className="panel-heading">
              <div><p className="section-kicker">CONTOH PESAN UNTUK DOSEN</p><h2>Template pesan ke dosen</h2><p className="muted">Pilih topik kuliah atau konsultasi untuk membuat draf yang ditujukan kepada dosen.</p></div>
              <span className="step-badge">02 <i>/ 02</i></span>
            </div>
            <div className="template-layout">
              <form className="template-form" noValidate onSubmit={(event) => {
                event.preventDefault();
                loadTemplate();
              }}>
                <label className="field-label" htmlFor="template-choice">Topik pesan untuk dosen</label>
                <select id="template-choice" className="form-control" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                  {templates.map((item) => <option key={item.id} value={item.id}>{item.category} — {item.name}</option>)}
                </select>
                <div className="form-two-col">
                  <div><label className="field-label" htmlFor="student-name">Nama <span className="required-label" aria-label="wajib diisi">*</span></label><input id="student-name" className="form-control" value={studentName} onChange={(event) => setStudentName(event.target.value)} placeholder="Nama lengkap" autoComplete="name" aria-required="true" required /></div>
                  <div><label className="field-label" htmlFor="student-npm">NPM <span className="required-label" aria-label="wajib diisi">*</span></label><input id="student-npm" className="form-control" value={studentNpm} onChange={(event) => setStudentNpm(event.target.value)} placeholder="Nomor pokok mahasiswa" aria-required="true" required /></div>
                </div>
                <label className="field-label" htmlFor="course">Mata kuliah / program <span className="required-label" aria-label="wajib diisi">*</span></label>
                <input id="course" className="form-control" value={course} onChange={(event) => setCourse(event.target.value)} placeholder="Contoh: Pemrograman Dasar atau Teknik Informatika" aria-required="true" required />
                <label className="field-label" htmlFor="detail">Detail tambahan <span className="optional-label">(opsional)</span></label>
                <textarea id="detail" className="message-input detail-input" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Tambahkan konteks kuliah atau bimbingan bila diperlukan (opsional)." maxLength={500} />
                <button className="primary-button full-button" type="submit">Buat draf pesan <span>→</span></button>
              </form>
              <div className="template-preview">
                <span className="preview-label">{templates.find((item) => item.id === templateId)?.name ?? "PRATINJAU FORMAT"}</span>
                <pre className="preview-paper">{templatePreview}</pre>
                <p className="preview-footnote">Pratinjau diperbarui otomatis. Sesuaikan draf sebelum digunakan.</p>
              </div>
            </div>
          </section>
        )}

        {page === "guide" && (
          <section className="panel guide-page">
            <div className="panel-heading"><div><p className="section-kicker">PANDUAN UNTUK MAHASISWA</p><h2>Etika menghubungi dosen</h2><p className="muted">Sampaikan konteks perkuliahan dengan jelas dan hargai waktu dosen.</p></div><span className="guide-icon">☼</span></div>
            <div className="guide-grid">
              <GuideCard number="01" title="Pilih waktu yang wajar" text="Kirim pesan pada jam kerja kecuali ada keadaan mendesak. Perhatikan juga kanal komunikasi yang dianjurkan dosen." />
              <GuideCard number="02" title="Kenalkan diri dan kelas" text="Sebutkan nama serta mata kuliah, kelas, atau topik bimbingan agar dosen memahami konteks pesan." />
              <GuideCard number="03" title="Tanyakan hal akademik dengan jelas" text="Sampaikan topik kuliah atau bimbingan, beri konteks secukupnya, lalu ajukan pertanyaan yang spesifik." />
              <GuideCard number="04" title="Gunakan bahasa santun" text="Awali dengan salam, gunakan sapaan yang sesuai, hindari singkatan yang membingungkan, dan jangan menuntut balasan segera." />
              <GuideCard number="05" title="Beri waktu untuk membalas" text="Dosen mungkin sedang mengajar atau memiliki urusan lain. Jika perlu menindaklanjuti, tunggu waktu yang pantas." />
              <GuideCard number="06" title="Jaga data pribadi" text="Bagikan hanya informasi akademik yang diperlukan dosen. Jangan mengirim kata sandi, kode verifikasi, atau data sensitif." />
            </div>
            <div className="guide-callout"><span>✦</span><p><strong>Ingat:</strong> ikuti kanal dan ketentuan komunikasi yang disampaikan dosen atau program studi. Template hanya contoh dan perlu disesuaikan dengan situasi.</p></div>
          </section>
        )}

        {notice && <div className="notice" role="status"><span>{notice}</span><button aria-label="Tutup pemberitahuan" onClick={() => setNotice("")}>×</button></div>}

        <footer className="page-footer">
          <span>© 2026 SapaKampus · Latihan komunikasi mahasiswa kepada dosen</span>
          <span>Tanpa akun · Pesan tidak disimpan · Simulasi bukan balasan dosen</span>
        </footer>
      </main>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string; checked: boolean }) {
  return <div className={`check-item ${checked ? "checked" : ""}`}><span className="check-mark">{checked ? "✓" : "·"}</span><span>{label}</span><span className="check-state">{checked ? "Ada" : "Belum"}</span></div>;
}

function GuideCard({ number, title, text }: { number: string; title: string; text: string }) {
  return <article className="guide-card"><span className="guide-number">{number}</span><h3>{title}</h3><p>{text}</p></article>;
}

export default App;
