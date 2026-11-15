/** First-run setup page: validation errors, labels, and known backend auth errors. */

const messages = {
  "Unable to connect to the backend service": "Unable to connect to the backend service",
  "The two passwords you entered do not match": "The two passwords you entered do not match",
  "Password must be at least 8 characters": "Password must be at least 8 characters",
  "Initialization failed": "Initialization failed",
  "Unable to confirm the initialization status": "Unable to confirm the initialization status",
  "Initialize password": "Initialize password",
  "The backend or database is temporarily unavailable. To avoid overwriting the existing password on this instance, the setup entry has been temporarily disabled — please restore the service and try again.":
    "The backend or database is temporarily unavailable. To avoid overwriting the existing password on this instance, the setup entry has been temporarily disabled — please restore the service and try again.",
  "First time using CYFIND? Set a sign-in password for your account (at least 8 characters).":
    "First time using CYFIND? Set a sign-in password for your account (at least 8 characters).",
  Retry: "Retry",
  "New password": "New password",
  "At least 8 characters": "At least 8 characters",
  "Confirm password": "Confirm password",
  "Re-enter your password": "Re-enter your password",
  "Saving…": "Saving…",
  "Set password and sign in": "Set password and sign in",
  "The data source is temporarily unavailable. Please try again later.":
    "The data source is temporarily unavailable. Please try again later.",
  "A password has already been set": "A password has already been set",
  "Password cannot be empty": "Password cannot be empty",
  "Password must not exceed 72 bytes": "Password must not exceed 72 bytes",
  "Failed to hash the password": "Failed to hash the password",
  "Failed to generate token": "Failed to generate token",
} satisfies Record<string, string>;

export default messages;
