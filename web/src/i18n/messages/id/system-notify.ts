/**
 * Terjemahan halaman push notifikasi (system/notify).
 *
 * Kunci adalah string zh-CN asli.
 */

const messages = {
  // page
  请填写渠道名称: "Isi nama channel",
  已添加渠道: "Channel ditambahkan",
  "已发出测试消息（{ms} ms），请到群里确认": "Pesan uji terkirim ({ms} ms), konfirmasi di grup",
  "测试失败：{message}": "Uji gagal: {message}",
  推送已开启: "Push diaktifkan",
  推送已暂停: "Push dijeda",
  "发现漏洞时推送到钉钉 / 飞书 / 企业微信等渠道 · 每个渠道可独立设推送时机与过滤规则":
    "Push ke DingTalk / Feishu / WeCom dan channel lain saat kerentanan ditemukan · tiap channel bisa atur waktu push dan aturan filter secara independen",
  总开关: "Sakelar utama",
  推送总开关: "Sakelar utama push",
  渠道: "Channel",
  "启用 / 总数": "Aktif / total",
  今日送达: "Terkirim hari ini",
  最久积压: "Backlog terlama",
  推送可能卡住了: "Push mungkin macet",
  全局设置: "Pengaturan global",
  回链地址: "Alamat tautan balik",
  "消息里「查看详情」按钮指向的地址。留空则不带按钮。":
    'Alamat yang dituju tombol "Lihat detail" di pesan. Kosongkan untuk menghilangkan tombol.',
  "汇总周期（分钟）": "Siklus digest (menit)",
  "仅对「汇总」模式的渠道生效。": 'Hanya berlaku untuk channel mode "digest".',
  保存全局设置: "Simpan pengaturan global",
  投递记录: "Catatan pengiriman",
  添加渠道: "Tambah channel",
  汇总: "Digest",
  添加通知渠道: "Tambah channel notifikasi",
  "默认限流 {n} 条/分钟": "Batas default {n}/menit",
  不限流: "Tanpa batas",
  渠道类型: "Tipe channel",
  "渠道类型不可修改——改了类型等于换一套凭据，请新建渠道。":
    "Tipe channel tidak bisa diubah — mengubah tipe berarti kredensial yang berbeda, jadi buat channel baru saja.",
  渠道名称: "Nama channel",
  "应急响应群 / 日常播报群": "Grup respons insiden / grup siaran harian",
  "该渠道的表单尚未定义（前端缺 CHANNEL_FIELDS 条目），请补全后再试。":
    "Formulir channel ini belum didefinisikan (frontend tidak punya entri CHANNEL_FIELDS); lengkapi lalu coba lagi.",
  推送时机: "Waktu push",
  "实时 · 每条漏洞单独发一条": "Realtime · kirim satu pesan per kerentanan",
  "汇总 · 按周期合并成一条": "Digest · gabung jadi satu pesan per siklus",
  "想做「高危实时、其余汇总」就建两个渠道：一个实时 + 门槛高危，一个汇总 + 不限级别。":
    'Untuk "risiko tinggi realtime, sisanya digest", buat dua channel: satu realtime + ambang risiko tinggi, dan satu digest + tanpa batas level.',
  "限流（条/分钟）": "Batas (per menit)",
  "0 = 不限": "0 = tanpa batas",
  "留空用渠道默认值；0 表示不限流。超限不会丢消息，只会推迟发送。":
    "Kosongkan untuk pakai default channel; 0 berarti tanpa batas. Melebihi batas tidak membuang pesan, hanya menunda pengiriman.",
  "过滤规则（留空即不过滤）": "Aturan filter (kosong berarti tanpa filter)",
  最低级别: "Level minimum",
  只推这些漏洞类型: "Hanya push tipe kerentanan ini",
  "SQL注入\n命令执行": "SQL injection\nCommand execution",
  "每行一个关键词，大小写不敏感的子串匹配。留空=全部类型。":
    "Satu kata kunci per baris, pencocokan substring tanpa membedakan huruf besar/kecil. Kosong = semua tipe.",
  排除这些漏洞类型: "Kecualikan tipe kerentanan ini",
  信息泄露: "Kebocoran informasi",
  "排除优先于包含：同时命中时会被排除。":
    "Pengecualian diutamakan daripada penyertaan: bila keduanya cocok, akan dikecualikan.",
  "限定任务 ID": "Batasi ke ID tugas",
  "限定资产 ID": "Batasi ke ID aset",
  "任务/资产留空=不限；填写后要求与漏洞有交集。":
    "Kosongkan tugas/aset = tanpa batas; setelah diisi, kerentanan wajib beririsan dengannya.",
  接收状态变更: "Terima perubahan status",
  "漏洞处置状态变更时也推送（仅实时模式）": "Juga push saat status penanganan kerentanan berubah (hanya mode realtime)",
  启用该渠道: "Aktifkan channel ini",
  发送测试消息: "Kirim pesan uji",

  // stat-tile (system/notify/_components/stat-tile)
  分钟: "mnt",
  小时: "jam",
} satisfies Record<string, string>;

export default messages;
