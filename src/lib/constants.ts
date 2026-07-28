/** Maximum file upload size: 10MB */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Allowed image MIME types */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Maximum failed login attempts before lockout */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Lockout duration in minutes */
export const LOCK_DURATION_MINUTES = 15;

/** Session max age in seconds (30 minutes) */
export const SESSION_MAX_AGE = 30 * 60;
