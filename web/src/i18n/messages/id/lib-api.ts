/**
 * Error user-facing dari klien API (lib/api.ts) dan konten demo
 * (kunci sumber adalah string zh-CN asli).
 */

const messages = {
  未授权: "Tidak terautentikasi",

  "上传失败: {status}": "Unggahan gagal: {status}",
  "上传失败: {status} {body}": "Unggahan gagal: {status} {body}",
  "上传失败({status})": "Unggahan gagal ({status})",
  "下载失败: {status}": "Unduhan gagal: {status}",
  下载失败: "Unduhan gagal",

  "（demo）{path} 的下载内容示例。": "(demo) Contoh konten unduhan untuk {path}.",
} satisfies Record<string, string>;

export default messages;
