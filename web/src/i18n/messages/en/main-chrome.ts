/**
 * Topbar & account chrome: update badge, user menu, change-password dialog.
 */

const messages = {
  "发现新版本 {latest}，点击前往更新": "New version {latest} available — click to update",
  新版本: "New version",

  修改密码: "Change Password",

  退出登录: "Sign Out",

  请填写当前密码和新密码: "Enter your current password and new password",

  两次输入的新密码不一致: "The new passwords do not match",

  密码已修改: "Password changed",

  "修改失败：{error}": "Change failed: {error}",
  "用户名固定为 ": "The username is fixed as ",
  "。需先输入当前密码验证；修改后已签发的登录 token 仍有效直至过期。":
    ". Enter your current password first for verification; issued login tokens stay valid until they expire.",
  当前密码: "Current password",

  新密码: "New password",

  确认新密码: "Confirm new password",

  "修改中…": "Saving…",
  确认修改: "Confirm Change",

  // Sidebar engine indicator
  引擎空闲: "Engine idle",
  引擎运行中: "Engine running",
} satisfies Record<string, string>;

export default messages;
