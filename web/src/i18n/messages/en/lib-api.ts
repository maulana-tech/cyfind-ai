/**
 * API client (lib/api.ts) user-visible errors and demo content
 * (source keys are the original zh-CN strings).
 */

const messages = {
  未授权: "Unauthorized",

  "上传失败: {status}": "Upload failed: {status}",
  "上传失败: {status} {body}": "Upload failed: {status} {body}",
  "上传失败({status})": "Upload failed ({status})",
  "下载失败: {status}": "Download failed: {status}",
  下载失败: "Download failed",

  "（demo）{path} 的下载内容示例。": "(demo) Sample download content for {path}.",
} satisfies Record<string, string>;

export default messages;
