/**
 * Update card (system/settings/_components/update-card) translations.
 *
 * Keys are the original zh-CN strings. Includes the static backend
 * update-progress messages (server/update.go, selfupdate/stage.go) — rendered
 * via t(progress.message) with a safe fallback.
 */

const messages = {
  "Failed to check for updates: {message}": "Failed to check for updates: {message}",
  "New version {version} found": "New version {version} found",
  "Already the latest version": "Already the latest version",
  "Updated to {version}, reloading the page": "Updated to {version}, reloading the page",
  "Timed out waiting for the service to restart. Check the backend log, or confirm cyfind was started via start.sh / start.bat.":
    "Timed out waiting for the service to restart. Check the backend log, or confirm cyfind was started via start.sh / start.bat.",
  "Update failed: {message}": "Update failed: {message}",
  "Update failed": "Update failed",
  "Update to {version}?": "Update to {version}?",
  "Updating restarts the program; running tasks will be interrupted.\n":
    "Updating restarts the program; running tasks will be interrupted.\n",
  "\nNote: an in-container update only replaces the program itself, not the playwright / nmap toolchain in the image; ":
    "\nNote: an in-container update only replaces the program itself, not the playwright / nmap toolchain in the image; ",
  "if the new version needs new tools, use docker compose pull instead.":
    "if the new version needs new tools, use docker compose pull instead.",
  "Roll back to the previous version?\n\nThe program will restart and running tasks will be interrupted.\nNote: the database schema is not rolled back, and the old version may not recognize data written by the new one.":
    "Roll back to the previous version?\n\nThe program will restart and running tasks will be interrupted.\nNote: the database schema is not rolled back, and the old version may not recognize data written by the new one.",
  "Switched to the previous version, restarting…": "Switched to the previous version, restarting…",
  "Rollback failed: {message}": "Rollback failed: {message}",
  "An update is already in progress": "An update is already in progress",
  "An update is in progress; rollback is not possible": "An update is in progress; rollback is not possible",
  "Failed to start the update: {message}": "Failed to start the update: {message}",
  "Version & updates": "Version & updates",
  "Check for and install a new version from GitHub. Updating restarts the program; running tasks will be interrupted.":
    "Check for and install a new version from GitHub. Updating restarts the program; running tasks will be interrupted.",
  "Current version": "Current version",
  Standalone: "Standalone",
  "Latest version": "Latest version",
  "Release notes": "Release notes",
  "Preparing…": "Preparing…",
  "Fetching the checksum manifest…": "Fetching the checksum manifest…",
  "Verifying SHA256…": "Verifying SHA256…",
  "Extracting and smoke-testing…": "Extracting and smoke-testing…",
  "Warning: failed to write the upgrade marker; this upgrade will have no automatic rollback protection":
    "Warning: failed to write the upgrade marker; this upgrade will have no automatic rollback protection",
  "The new version is ready, restarting…": "The new version is ready, restarting…",
  "Cannot connect to GitHub: ": "Cannot connect to GitHub: ",
  "Configure the global proxy above and try again.": "Configure the global proxy above and try again.",
  "{latest} does not provide a release package for {os}/{arch} (missing {asset}), so automatic update is not possible.":
    "{latest} does not provide a release package for {os}/{arch} (missing {asset}), so automatic update is not possible.",
  "Will download ": "Will download ",
  "（{size}）": " ({size})",
  ", and it is replaced only after SHA256 verification and a smoke test; on failure the current version is kept automatically.":
    ", and it is replaced only after SHA256 verification and a smoke test; on failure the current version is kept automatically.",
  "Already on the latest version.": "Already on the latest version.",
  "An update under Docker only replaces the program itself, not the playwright / nmap toolchain in the image, and":
    "An update under Docker only replaces the program itself, not the playwright / nmap toolchain in the image, and",
  "after rebuilding the container it reverts to the image-bundled version. To upgrade the image too, run":
    "after rebuilding the container it reverts to the image-bundled version. To upgrade the image too, run",
  "。": ".",
  "Restarting and applying the new version, please wait (the page will refresh automatically)…":
    "Restarting and applying the new version, please wait (the page will refresh automatically)…",
  "Check for updates": "Check for updates",
  "Update to {version}": "Update to {version}",
  "Update now": "Update now",
  "Roll back to the previous version": "Roll back to the previous version",
  "One-click update relies on the watchdog script to restart the program. Please use ":
    "One-click update relies on the watchdog script to restart the program. Please use ",
  " (on Windows: ": " (on Windows: ",
  ") to start CYFIND; when running the cyfind binary directly, it is not relaunched automatically after it exits.":
    ") to start CYFIND; when running the cyfind binary directly, it is not relaunched automatically after it exits.",
} satisfies Record<string, string>;

export default messages;
