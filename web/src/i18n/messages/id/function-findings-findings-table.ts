/**
 * Terjemahan tabel temuan (kunci adalah string zh-CN asli).
 */

const messages = {
  // kotak centang pilih-semua (label dikirim mentah dari pemanggil)
  选择当前页全部: "Pilih semua di halaman ini",
  选择本组当前页全部: "Pilih semua di halaman ini dalam grup",
  // kepala kolom
  严重度: "Severity",
  漏洞名称: "Nama temuan",
  资产: "Aset",
  状态: "Status",
  所属任务: "Tugas induk",
  时间: "Waktu",
  操作: "Aksi",
  // aksi baris
  选择该漏洞: "Pilih temuan ini",
  查看发现详情: "Lihat detail temuan",
  未分类: "Tidak terklasifikasi",
  "流量证据 {n} 条": "{n} bukti lalu lintas",
  查看正在进行的复测会话: "Lihat sesi uji ulang yang sedang berjalan",
  复测中: "Sedang uji ulang",
  在独立会话中复测该漏洞: "Uji ulang temuan ini di sesi terpisah",
  复测: "Uji ulang",
  深入: "Pendalaman",
  // konfirmasi hapus
  删除漏洞: "Hapus temuan",
  "确认删除该漏洞？": "Hapus temuan ini?",
  "「": "“",
  "」将被永久删除， 同时从发现列表、任务发现 Tab 与探索图中移除，此操作不可撤销。":
    "” akan dihapus permanen, beserta catatannya di daftar temuan, tab Temuan pada tugas, dan graf eksplorasi. Tindakan ini tidak dapat dibatalkan.",
  取消: "Batal",
  删除: "Hapus",
  // penyuntingan sebaris
  "可读标题，留空回退类别": "Judul yang mudah dibaca; biarkan kosong untuk memakai kelas",
  类别: "Kelas",
  "如 SQL Injection": "mis. SQL Injection",
  严重等级: "Tingkat keparahan",
  "保存中…": "Menyimpan…",
  保存: "Simpan",
  // bukti
  证据: "Bukti",
  "· 类型：": "· Jenis: ",
  "· 资产：": "· Aset: ",
  // laporan detail
  详细报告: "Laporan detail",
  已复制详细报告: "Laporan detail disalin",
  "加载中…": "Memuat…",
  "报告加载失败。": "Gagal memuat laporan.",
  "暂无详细报告。": "Belum ada laporan detail.",
  // status kosong
  "没有匹配的发现。": "Tidak ada temuan yang cocok.",
} satisfies Record<string, string>;

export default messages;
