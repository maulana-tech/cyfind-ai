/**
 * Terjemahan halaman push notifikasi (system/notify).
 *
 * Kunci adalah string zh-CN asli.
 */

const messages = {
  "Please fill in the channel name": "Isi nama channel",
  "Channel added": "Channel ditambahkan",
  "Test message sent ({ms} ms), please confirm in the group": "Pesan uji terkirim ({ms} ms), konfirmasi di grup",
  "Test failed: {message}": "Uji gagal: {message}",
  "Push enabled": "Push diaktifkan",
  "Push paused": "Push dijeda",
  "Push to DingTalk / Feishu / WeCom and other channels when a vulnerability is found · each channel can set its push timing and filter rules independently":
    "Push ke DingTalk / Feishu / WeCom dan channel lain saat kerentanan ditemukan · tiap channel bisa atur waktu push dan aturan filter secara independen",
  "Master switch": "Sakelar utama",
  "Push master switch": "Sakelar utama push",
  Channels: "Channel",
  "Enabled / total": "Aktif / total",
  "Delivered today": "Terkirim hari ini",
  "Longest backlog": "Backlog terlama",
  "Push may be stuck": "Push mungkin macet",
  "Global settings": "Pengaturan global",
  "Back-link address": "Alamat tautan balik",
  'The address the "View detail" button in the message points to. Leave empty to omit the button.':
    'Alamat yang dituju tombol "Lihat detail" di pesan. Kosongkan untuk menghilangkan tombol.',
  "Digest cycle (minutes)": "Siklus digest (menit)",
  'Only effective for channels in "digest" mode.': 'Hanya berlaku untuk channel mode "digest".',
  "Save global settings": "Simpan pengaturan global",
  "Delivery records": "Catatan pengiriman",
  "Add channel": "Tambah channel",
  Digest: "Digest",
  "Add notification channel": "Tambah channel notifikasi",
  "Default rate limit {n}/minute": "Batas default {n}/menit",
  "No rate limit": "Tanpa batas",
  "Channel type": "Tipe channel",
  "The channel type cannot be changed — changing the type means a different set of credentials, so create a new channel instead.":
    "Tipe channel tidak bisa diubah — mengubah tipe berarti kredensial yang berbeda, jadi buat channel baru saja.",
  "Channel name": "Nama channel",
  "Incident-response group / daily-broadcast group": "Grup respons insiden / grup siaran harian",
  "This channel's form is not yet defined (the frontend is missing a CHANNEL_FIELDS entry); please complete it and try again.":
    "Formulir channel ini belum didefinisikan (frontend tidak punya entri CHANNEL_FIELDS); lengkapi lalu coba lagi.",
  "Push timing": "Waktu push",
  "Realtime · send one message per vulnerability": "Realtime · kirim satu pesan per kerentanan",
  "Digest · merge into one message per cycle": "Digest · gabung jadi satu pesan per siklus",
  'To do "high-risk realtime, the rest digest", create two channels: one realtime + high-risk threshold, and one digest + no level limit.':
    'Untuk "risiko tinggi realtime, sisanya digest", buat dua channel: satu realtime + ambang risiko tinggi, dan satu digest + tanpa batas level.',
  "Rate limit (per minute)": "Batas (per menit)",
  "0 = unlimited": "0 = tanpa batas",
  "Leave empty to use the channel default; 0 means no rate limit. Exceeding the limit does not drop messages, it only delays sending.":
    "Kosongkan untuk pakai default channel; 0 berarti tanpa batas. Melebihi batas tidak membuang pesan, hanya menunda pengiriman.",
  "Filter rules (empty means no filtering)": "Aturan filter (kosong berarti tanpa filter)",
  "Minimum level": "Level minimum",
  "Only push these vulnerability types": "Hanya push tipe kerentanan ini",
  "SQL injection\nCommand execution": "SQL injection\nCommand execution",
  "One keyword per line, case-insensitive substring match. Empty = all types.":
    "Satu kata kunci per baris, pencocokan substring tanpa membedakan huruf besar/kecil. Kosong = semua tipe.",
  "Exclude these vulnerability types": "Kecualikan tipe kerentanan ini",
  "Information disclosure": "Kebocoran informasi",
  "Exclude takes priority over include: when both match, it is excluded.":
    "Pengecualian diutamakan daripada penyertaan: bila keduanya cocok, akan dikecualikan.",
  "Restrict to task IDs": "Batasi ke ID tugas",
  "Restrict to asset IDs": "Batasi ke ID aset",
  "Leaving task/asset empty = unrestricted; once filled, the vulnerability is required to intersect with it.":
    "Kosongkan tugas/aset = tanpa batas; setelah diisi, kerentanan wajib beririsan dengannya.",
  "Receive status changes": "Terima perubahan status",
  "Also push when a vulnerability's disposition status changes (realtime mode only)":
    "Juga push saat status penanganan kerentanan berubah (hanya mode realtime)",
  "Enable this channel": "Aktifkan channel ini",
  "Send a test message": "Kirim pesan uji",
  min: "mnt",
  h: "jam",
  "Failed to load push config: {message}": "Gagal memuat konfigurasi push: {message}",
  "Failed to load channel list: {message}": "Gagal memuat daftar channel: {message}",
} satisfies Record<string, string>;

export default messages;
