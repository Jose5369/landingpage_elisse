import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'elise-system-jwt-secret-change-in-production';
const TOKEN_EXPIRY = '24h';

export interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
}

export interface CurrentUser {
  id: number;
  email: string;
  name: string | null;
  role_id: number | null;
  role_name: string | null;
  permissions: string[];
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId } satisfies Omit<JwtPayload, 'iat' | 'exp'>, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Extracts and verifies the Bearer token from an Authorization header.
 * Returns the decoded payload or null if the token is missing / invalid.
 */
export function getAuthPayload(request: Request): JwtPayload | null {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/** Convenience: returns a 401 Response when auth fails. */
export function unauthorizedResponse(): Response {
  return Response.json({ error: 'No autorizado' }, { status: 401 });
}

/**
 * Returns the full current user record from DB using the JWT token.
 * Returns null if token is missing, invalid, or user not found.
 */
export function getCurrentUser(request: Request): CurrentUser | null {
  const payload = getAuthPayload(request);
  if (!payload) return null;

  const db = getDb();
  const row = db
    .prepare(`
      SELECT
        u.id, u.email, u.name, u.role_id, u.active,
        r.name      AS role_name,
        r.permissions
      FROM admin_users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.id = ?
    `)
    .get(payload.userId) as {
      id: number;
      email: string;
      name: string | null;
      role_id: number | null;
      active: number;
      role_name: string | null;
      permissions: string | null;
    } | undefined;

  if (!row) return null;
  if (row.active === 0) return null;

  let permissions: string[] = [];
  try {
    if (row.permissions) permissions = JSON.parse(row.permissions) as string[];
  } catch {
    permissions = [];
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role_id: row.role_id,
    role_name: row.role_name,
    permissions,
  };
}

/**
 * Wildcard permission matching:
 *   '*'          matches everything
 *   'settings.*' matches 'settings.read', 'settings.write', 'settings.delete'
 *   '*.read'     matches 'settings.read', 'users.read', etc.
 */
export function hasPermission(permissions: string[], required: string): boolean {
  for (const p of permissions) {
    if (p === '*') return true;
    if (p === required) return true;

    // Pattern: 'resource.*'
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2); // e.g. 'settings'
      if (required.startsWith(prefix + '.')) return true;
    }

    // Pattern: '*.action'
    if (p.startsWith('*.')) {
      const suffix = p.slice(2); // e.g. 'read'
      if (required.endsWith('.' + suffix)) return true;
    }
  }
  return false;
}

/**
 * Checks auth AND permission.
 * Returns { user } on success or { user: null, error: Response } on failure.
 */
export function requirePermission(
  request: Request,
  permission: string
): { user: CurrentUser; error?: never } | { user: null; error: Response } {
  const user = getCurrentUser(request);
  if (!user) {
    return { user: null, error: unauthorizedResponse() };
  }
  if (!hasPermission(user.permissions, permission)) {
    return {
      user: null,
      error: Response.json(
        { error: 'No tienes permiso para realizar esta acción' },
        { status: 403 }
      ),
    };
  }
  return { user };
}
