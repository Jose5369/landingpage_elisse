import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/auth';

interface AdminUser {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
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
      .prepare('SELECT * FROM admin_users WHERE email = ?')
      .get(email) as AdminUser | undefined;

    if (!user) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const token = generateToken(user.id);

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('[POST /api/admin/login]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
