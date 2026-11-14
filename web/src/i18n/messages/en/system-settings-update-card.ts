/**
 * Update card (system/settings/_components/update-card) translations.
 *
 * Keys are the original zh-CN strings. Includes the static backend
 * update-progress messages (server/update.go, selfupdate/stage.go) — rendered
 * via t(progress.message) with a safe fallback.
 */

const messages = {
  "检查更新失败：{message}": "Failed to check for updates: {message}",
  "发现新版本 {version}": "New version {version} found",
  当前已是最新版本: "Already the latest version",

  "已更新到 {version}，正在重新加载页面": "Updated to {version}, reloading the page",
  "等待服务重启超时。请检查后端日志，或确认 cyfind 是通过 start.sh / start.bat 启动的。":
    "Timed out waiting for the service to restart. Check the backend log, or confirm cyfind was started via start.sh / start.bat.",
  "更新失败：{message}": "Update failed: {message}",
  更新失败: "Update failed",

  "确定更新到 {version}？": "Update to {version}?",
  "更新会重启程序，正在运行的任务会被中断。\n": "Updating restarts the program; running tasks will be interrupted.\n",
  "\n注意：容器内更新只替换程序本身，不会更新镜像里的 playwright / nmap 等工具链；":
    "\nNote: an in-container update only replaces the program itself, not the playwright / nmap toolchain in the image; ",
  "若新版本依赖新工具，请改用 docker compose pull。":
    "if the new version needs new tools, use docker compose pull instead.",
  "回滚到上一版本？\n\n程序会重启，正在运行的任务会被中断。\n注意：数据库结构不会回退，旧版本可能无法识别新版写入的数据。":
    "Roll back to the previous version?\n\nThe program will restart and running tasks will be interrupted.\nNote: the database schema is not rolled back, and the old version may not recognize data written by the new one.",
  "已切换到上一版本，正在重启…": "Switched to the previous version, restarting…",

  "回滚失败：{message}": "Rollback failed: {message}",
  已有一个更新正在进行中: "An update is already in progress",

  "更新正在进行中，无法回滚": "An update is in progress; rollback is not possible",

  "启动更新失败：{message}": "Failed to start the update: {message}",
  版本与更新: "Version & updates",

  "从 GitHub 检查并安装新版本。更新会重启程序，正在运行的任务会被中断。":
    "Check for and install a new version from GitHub. Updating restarts the program; running tasks will be interrupted.",
  当前版本: "Current version",

  独立程序: "Standalone",

  最新版本: "Latest version",

  更新日志: "Release notes",

  // static backend update-progress messages (server/update.go, selfupdate/stage.go)
  "准备中…": "Preparing…",
  "获取校验和清单…": "Fetching the checksum manifest…",
  "校验 SHA256…": "Verifying SHA256…",
  "解压并冒烟测试…": "Extracting and smoke-testing…",

  "警告：写入升级标记失败，本次升级将没有自动回滚保护":
    "Warning: failed to write the upgrade marker; this upgrade will have no automatic rollback protection",
  "新版本已就绪，正在重启…": "The new version is ready, restarting…",
  "无法连接 GitHub：": "Cannot connect to GitHub: ",

  "可在上方配置全局代理后重试。": "Configure the global proxy above and try again.",

  "{latest} 没有提供 {os}/{arch} 的发布包（缺少 {asset}），无法自动更新。":
    "{latest} does not provide a release package for {os}/{arch} (missing {asset}), so automatic update is not possible.",
  "将下载 ": "Will download ",
  "（{size}）": " ({size})",
  "，校验 SHA256 并冒烟测试后才会替换，失败自动保留当前版本。":
    ", and it is replaced only after SHA256 verification and a smoke test; on failure the current version is kept automatically.",
  "当前已是最新版本。": "Already on the latest version.",
  "Docker 下的更新只替换程序本身，不更新镜像里的 playwright / nmap 等工具链，且":
    "An update under Docker only replaces the program itself, not the playwright / nmap toolchain in the image, and",
  "重建容器后会退回镜像自带的版本。需要连镜像一起升级请执行":
    "after rebuilding the container it reverts to the image-bundled version. To upgrade the image too, run",
  "。": ".",

  "正在重启并应用新版本，请稍候（页面会自动刷新）…":
    "Restarting and applying the new version, please wait (the page will refresh automatically)…",
  检查更新: "Check for updates",

  "更新到 {version}": "Update to {version}",
  立即更新: "Update now",

  回滚到上一版本: "Roll back to the previous version",

  "一键更新依赖守护脚本重启程序。请通过 ":
    "One-click update relies on the watchdog script to restart the program. Please use ",
  "（Windows 为": " (on Windows: ",
  "）启动 CYFIND；直接运行 cyfind 本体时，程序退出后不会被自动拉起。":
    ") to start CYFIND; when running the cyfind binary directly, it is not relaunched automatically after it exits.",
} satisfies Record<string, string>;

export default messages;
