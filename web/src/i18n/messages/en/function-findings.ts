/**
 * Findings list page translations (keys are the original zh-CN strings).
 */

const messages = {
  // header & views
  发现: "Findings",
  跨任务漏洞汇总: "Findings across tasks",
  全部发现: "All findings",
  按任务分组: "By task",
  按资产: "By asset",
  发现总数: "Total findings",
  // filters
  检索漏洞内容: "Search findings",
  "按{label}等级筛选": "Filter by {label}",
  状态: "Status",
  全部状态: "All statuses",
  全部: "All",
  漏洞类型: "Vulnerability type",
  全部类型: "All types",
  任务: "Tasks",
  全部任务: "All tasks",
  "未关联 / 任务已删除": "Unassigned / task deleted",
  "任务 #{id}（已删除）": "Task #{id} (deleted)",
  "任务 #{id}": "Task #{id}",
  "{name}（任务 #{id}）": "{name} (Task #{id})",
  按严重度: "By severity",
  按时间: "By time",
  "已选 {n} 条": "{n} selected",
  导出: "Export",
  // selection / counts
  选择当前页全部: "Select all on this page",
  选择本组当前页全部: "Select all on this page of the group",
  全部资产: "All assets",
  "共 {n} 条": "{n} items",
  "没有匹配的发现。": "No matching findings.",
  来源任务不可用: "Source task unavailable",
  "查看任务 #{id}": "View task #{id}",
  // toasts
  "加载复测状态失败：{message}": "Failed to load retest status: {message}",
  已开始下载导出文件: "The export download has started",
  "导出失败：{message}": "Export failed: {message}",
  "资产树加载失败：{message}": "Failed to load the asset tree: {message}",
  "已标记为「{label}」": "Marked as “{label}”",
  "更新失败：{message}": "Update failed: {message}",
  已保存: "Saved",
  "保存失败：{message}": "Save failed: {message}",
  已删除漏洞: "Finding deleted",
  "删除失败：{message}": "Delete failed: {message}",
  "深入意图 #{id} 已进入任务队列": "Deepen intent #{id} queued",
  "已创建高优先级 Worker 意图 #{id}": "High-priority Worker intent #{id} created",
  "提交失败：{message}": "Submission failed: {message}",
  // deepen dialog
  深入利用漏洞: "Deepen exploitation",
  "将在原任务 #{id} 中创建优先级 10 的 Worker 意图，基于当前漏洞开展二次验证：":
    "A priority-10 Worker intent will be created in the original task #{id} for second-pass verification of the current finding: ",
  利用描述: "Exploitation description",
  "描述需要验证的利用路径、边界条件、目标或期望证据":
    "Describe the exploit path, boundary conditions, target, or expected evidence to verify",
  "新意图会继承该漏洞的资产锚点。": "The new intent inherits this finding's asset anchors.",
  取消: "Cancel",
  创建深入意图: "Create deepen intent",
  // export dialog
  导出发现: "Export findings",
  "选择导出范围与格式,生成后浏览器会自动下载。":
    "Choose the export scope and format; the browser downloads the file when it is ready.",
  导出范围: "Export scope",
  "导出当前筛选结果（共 {n} 条）": "Export current filtered results ({n} items)",
  导出全部: "Export all",
  "导出勾选的 {n} 条": "Export the {n} checked",
  导出格式: "Export format",
  "Markdown 汇总报告（单个 .md 文件）": "Markdown consolidated report (single .md file)",
  "Markdown 分文件（一漏洞一 .md,打包 .zip）": "Markdown per-finding files (one .md each, packed into a .zip)",
  "CSV 表格（.csv）": "CSV table (.csv)",
  "JSON（.json）": "JSON (.json)",
  "导出中…": "Exporting…",

  // asset tree (function/findings/_components/asset-tree)
  "当前筛选下没有关联到资产的发现。": "No findings associated with an asset under the current filter.",
  "没有匹配的资产。": "No matching assets.",
  过滤资产: "Filter assets",
  刷新资产树: "Refresh the asset tree",
  "资产过多，已隐藏": "Too many assets, hidden",
  "层级（计数仍已计入上层）。用筛选或过滤框收窄可看到完整层级。":
    "levels (the count is still included in the upper level). Narrow with a filter or the filter box to see the full hierarchy.",
  折叠: "Collapse",
  展开: "Expand",
  "共 {n} 条发现": "{n} findings",
} satisfies Record<string, string>;

export default messages;
