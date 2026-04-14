import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/auth';

interface AdminUserRow {
  id: number;
  email: string;
  password: string;
  name: string | null;
  created_at: string;
  role_id: number | null;
  active: number;
  last_login: string | null;
  updated_at: string | null;
  role_name: string | null;
  permissions: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email || !password) {
      return Response.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare(`
        SELECT
          u.*,
          r.name AS role_name,
          r.permissions
        FROM admin_users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.email = ?
      `)
      .get(email) as AdminUserRow | undefined;

    if (!user) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    if (user.active === 0) {
      return Response.json({ error: 'Esta cuenta está desactivada' }, { status: 401 });
    }

    // Update last_login
    db.prepare("UPDATE admin_users SET last_login = datetime('now') WHERE id = ?").run(user.id);

    const token = generateToken(user.id);

    let permissions: string[] = [];
    try {
      if (user.permissions) permissions = JSON.parse(user.permissions) as string[];
    } catch {
      permissions = [];
    }

    return Response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role_id: user.role_id,
        role_name: user.role_name,
        permissions,
      },
    });
  } catch (error) {
    console.error('[POST /api/admin/login]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
