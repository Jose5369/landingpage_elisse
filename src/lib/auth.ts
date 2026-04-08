import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'elise-system-jwt-secret-change-in-production';
const TOKEN_EXPIRY = '24h';

export interface JwtPayload {
  userId: number;
  iat?: number;
  exp?: number;
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
