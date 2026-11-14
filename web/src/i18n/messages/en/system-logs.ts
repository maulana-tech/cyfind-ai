/** Logs page vocabulary (source keys are the original zh-CN strings). */
const logs = {
  系统日志: "System log",

  "后端实时日志流(planner / worker / 数据库 / 流量 …)":
    "Backend real-time log stream (planner / worker / database / traffic …)",
  "{counts.warn} 警告": "{counts.warn} warning",
  "{counts.error} 错误": "{counts.error} error",
  "暂无日志。": "No log.",
} satisfies Record<string, string>;

/** Do NOT edit `src/i18n/messages/index.ts` - registry updated centrally. */
export default logs;
