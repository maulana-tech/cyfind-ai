/**
 * API client (lib/api.ts) user-visible errors and demo content
 * (source keys are the original zh-CN strings).
 */

const messages = {
  Unauthorized: "Unauthorized",
  "Upload failed: {status}": "Upload failed: {status}",
  "Upload failed: {status} {body}": "Upload failed: {status} {body}",
  "Upload failed ({status})": "Upload failed ({status})",
  "Download failed: {status}": "Download failed: {status}",
  "Download failed": "Download failed",
  "(demo) Sample download content for {path}.": "(demo) Sample download content for {path}.",
} satisfies Record<string, string>;

export default messages;
