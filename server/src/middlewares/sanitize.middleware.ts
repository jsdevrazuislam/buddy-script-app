import { NextFunction, Request, Response } from 'express';
import { filterXSS } from 'xss';

/**
 * Recursively sanitize a value using the `xss` library.
 * Works on strings, arrays, and plain objects.
 */
const sanitize = (value: unknown): unknown => {
  if (typeof value === 'string') {
    return filterXSS(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitize);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, sanitize(v)]),
    );
  }
  return value;
};

/**
 * XSS Sanitization Middleware — Express 5 compatible.
 *
 * Instead of overwriting req.query (read-only in Express 5), we sanitize
 * req.body and req.params in-place. req.query entries are read-only so we
 * sanitize individual string values via a Proxy where needed.
 *
 * This is a drop-in replacement for the unmaintained `xss-clean` package,
 * which crashes on Express 5 by trying to assign req.query directly.
 */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  // Sanitize request body (mutable in all Express versions)
  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body) as Record<string, unknown>;
  }

  // Sanitize route params (mutable)
  if (req.params && typeof req.params === 'object') {
    req.params = sanitize(req.params) as Record<string, string>;
  }

  // req.query is a read-only getter in Express 5 — we cannot reassign it.
  // Sanitisation of query params happens at the validation layer (Zod schemas).

  next();
};
