/**
 * Error user-facing dari klien API (lib/api.ts) dan konten demo
 * (kunci sumber adalah string zh-CN asli).
 */

const messages = {
  Unauthorized: "Tidak terautentikasi",
  "Upload failed: {status}": "Unggahan gagal: {status}",
  "Upload failed: {status} {body}": "Unggahan gagal: {status} {body}",
  "Upload failed ({status})": "Unggahan gagal ({status})",
  "Download failed: {status}": "Unduhan gagal: {status}",
  "Download failed": "Unduhan gagal",
  "(demo) Sample download content for {path}.": "(demo) Contoh konten unduhan untuk {path}.",
} satisfies Record<string, string>;

export default messages;
