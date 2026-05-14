/**
 * Security middleware for BHAROSA backend
 * - Rate limiting
 * - Request validation
 * - Security headers
 */

// Simple in-memory rate limiter
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const key = `${ip}`;

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, windowStart: now });
    return next();
  }

  const record = requestCounts.get(key);
  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.windowStart = now;
    return next();
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((record.windowStart + RATE_LIMIT_WINDOW - now) / 1000),
    });
  }

  next();
}

function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-BHAROSA-Encryption', 'AES-256-CBC');
  res.setHeader('X-BHAROSA-TokenEngine', 'SHA-256');
  res.setHeader('X-BHAROSA-BiometricStorage', 'HASH-ONLY');
  res.setHeader('X-Data-Protection', 'DPDP-Act-2023-Compliant');
  next();
}

function validateRequest(req, res, next) {
  // Basic input sanitization
  if (req.body) {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
}

module.exports = { rateLimiter, securityHeaders, validateRequest };
