/**
 * Log Sanitizer - Prevents log injection attacks
 *
 * Sanitizes user input before logging to prevent:
 * - Log injection (inserting fake log entries)
 * - Log forging (manipulating log analysis tools)
 * - Control character injection
 */

/**
 * Sanitize input for safe logging
 * Removes or escapes characters that could be used for log injection
 *
 * @param {any} input - The input to sanitize
 * @returns {string} - Sanitized string safe for logging
 */
function sanitizeForLog(input) {
  if (input === null || input === undefined) {
    return String(input);
  }

  // Convert to string
  let str = String(input);

  // Remove or escape dangerous characters:
  // - Newlines (LF, CR) - prevent log forging
  // - Control characters - prevent terminal manipulation
  // - ANSI escape codes - prevent log colorization attacks

  str = str
    .replace(/\r\n/g, '\\r\\n')  // Windows newline
    .replace(/\n/g, '\\n')        // Unix newline
    .replace(/\r/g, '\\r')        // Carriage return
    .replace(/\t/g, '\\t')        // Tab
    .replace(/\x1b/g, '\\x1b')    // ANSI escape sequences
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, ''); // Other control chars

  // Limit length to prevent log flooding
  const MAX_LOG_LENGTH = 1000;
  if (str.length > MAX_LOG_LENGTH) {
    str = str.substring(0, MAX_LOG_LENGTH) + '... [truncated]';
  }

  return str;
}

/**
 * Create a safe log message from multiple inputs
 *
 * @param {...any} args - Arguments to sanitize and join
 * @returns {string} - Safe log message
 */
function createSafeLogMessage(...args) {
  return args.map(arg => sanitizeForLog(arg)).join(' ');
}

module.exports = {
  sanitizeForLog,
  createSafeLogMessage
};
