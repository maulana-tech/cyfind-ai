/** Vokabur log (kunci = string zh-CN asli). */
const logs = {
  系统日志: "Log sistem",

  "后端实时日志流(planner / worker / 数据库 / 流量 …)":
    "Backend real-time log stream (planner / worker / database / traffic …)",
  "{counts.warn} 警告": "{counts.warn} peringatan",
  "{counts.error} 错误": "{counts.error} error",
  "暂无日志。": "Tidak ada log.",
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default logs;
