/** First-run setup page: validation errors, labels, and known backend auth errors. */

const messages = {
  无法连接到后端服务: "Unable to connect to the backend service",

  两次输入的密码不一致: "The two passwords you entered do not match",

  "密码长度至少 8 位": "Password must be at least 8 characters",
  初始化失败: "Initialization failed",

  无法确认初始化状态: "Unable to confirm the initialization status",

  初始化密码: "Initialize password",

  "后端或数据库暂时不可用。为避免覆盖实例上已有的密码，初始化入口已临时关闭——请恢复服务后重试。":
    "The backend or database is temporarily unavailable. To avoid overwriting the existing password on this instance, the setup entry has been temporarily disabled — please restore the service and try again.",
  "首次使用 CYFIND，请为账户设置一个登录密码（至少 8 位）":
    "First time using CYFIND? Set a sign-in password for your account (at least 8 characters).",
  重试: "Retry",

  新密码: "New password",

  "至少 8 位": "At least 8 characters",
  确认密码: "Confirm password",

  再次输入密码: "Re-enter your password",

  "保存中...": "Saving…",
  设置密码并登录: "Set password and sign in",

  "数据源暂时不可用，请稍后重试": "The data source is temporarily unavailable. Please try again later.",
  密码已设置: "A password has already been set",

  密码不能为空: "Password cannot be empty",

  "密码长度不能超过 72 字节": "Password must not exceed 72 bytes",
  密码加密失败: "Failed to hash the password",

  "token 生成失败": "Failed to generate token",
} satisfies Record<string, string>;

export default messages;
