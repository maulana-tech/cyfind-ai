/**
 * Shared UI vocabulary (buttons, states, common labels) used across pages.
 * Add entries here only when a string appears in multiple areas; anything
 * page-specific belongs in that page's own namespace file.
 */

const common = {
  保存: "Save",

  取消: "Cancel",

  确认: "Confirm",

  删除: "Delete",

  编辑: "Edit",

  搜索: "Search",

  重试: "Retry",

  关闭: "Close",

  加载中: "Loading…",

  版本: "Version",

  切换语言: "Switch language",

  确定: "OK",

  是: "Yes",

  否: "No",

  全部: "All",

  状态: "Status",

  名称: "Name",

  类型: "Type",

  操作: "Actions",

  时间: "Time",

  详情: "Details",
} satisfies Record<string, string>;

export default common;
