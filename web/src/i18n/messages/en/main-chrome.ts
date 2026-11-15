/**
 * Topbar & account chrome: update badge, user menu, change-password dialog.
 */

const messages = {
  "New version {latest} available — click to update": "New version {latest} available — click to update",
  "New version": "New version",
  "Change Password": "Change Password",
  "Sign Out": "Sign Out",
  "Enter your current password and new password": "Enter your current password and new password",
  "The new passwords do not match": "The new passwords do not match",
  "Password changed": "Password changed",
  "Change failed: {error}": "Change failed: {error}",
  "The username is fixed as ": "The username is fixed as ",
  ". Enter your current password first for verification; issued login tokens stay valid until they expire.":
    ". Enter your current password first for verification; issued login tokens stay valid until they expire.",
  "Current password": "Current password",
  "New password": "New password",
  "Confirm new password": "Confirm new password",
  "Saving…": "Saving…",
  "Confirm Change": "Confirm Change",
  "Engine idle": "Engine idle",
  "Engine running": "Engine running",
} satisfies Record<string, string>;

export default messages;
