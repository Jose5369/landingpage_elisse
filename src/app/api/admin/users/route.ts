import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { getAuthPayload, requirePermission, unauthorizedResponse } from '@/lib/auth';

interface UserRow {
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
}

function sanitize(u: UserRow): Omit<UserRow, 'password'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...rest } = u;
  return rest;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const users = db
      .prepare(`
        SELECT
          u.id, u.email, u.name, u.created_at,
          u.role_id, u.active, u.last_login, u.updated_at,
          r.name AS role_name
        FROM admin_users u
        LEFT JOIN roles r ON r.id = u.role_id
        ORDER BY u.id ASC
      `)
      .all() as Omit<UserRow, 'password'>[];

    return Response.json({ users });
  } catch (error) {
    console.error('[GET /api/admin/users]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user: actor, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const body = await request.json() as {
      name?: string;
      email?: string;
      password?: string;
      role_id?: number;
      active?: number;
    };
    const { name = '', email, password, role_id, active = 1 } = body;

    if (!email || typeof email !== 'string') {
      return Response.json({ error: 'email es requerido' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return Response.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }
    if (!role_id) {
      return Response.json({ error: 'role_id es requerido' }, { status: 400 });
    }

    const db = getDb();

    const existing = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email) as { id: number } | undefined;
    if (existing) {
      return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }

    const roleExists = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id) as { id: number } | undefined;
    if (!roleExists) {
      return Response.json({ error: 'El rol especificado no existe' }, { status: 400 });
    }

    const hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    const result = db
      .prepare('INSERT INTO admin_users (email, password, name, created_at, role_id, active) VALUES (?, ?, ?, ?, ?, ?)')
      .run(email.toLowerCase().trim(), hash, name, now, role_id, active);

    const created = db
      .prepare(`
        SELECT u.id, u.email, u.name, u.created_at, u.role_id, u.active, u.last_login, u.updated_at,
               r.name AS role_name
        FROM admin_users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
      `)
      .get(result.lastInsertRowid) as Omit<UserRow, 'password'>;

    console.log(`[users] Created user "${email}" by actor ${actor.id}`);

    return Response.json({ user: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/users]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user: actor, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const body = await request.json() as {
      id?: number;
      name?: string;
      email?: string;
      role_id?: number;
      active?: number;
      password?: string;
    };
    const { id, name, email, role_id, active, password } = body;

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    const target = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id) as UserRow | undefined;
    if (!target) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check email uniqueness if changing
    if (email !== undefined && email.toLowerCase().trim() !== target.email) {
      const dup = db.prepare('SELECT id FROM admin_users WHERE email = ? AND id != ?').get(email, id) as { id: number } | undefined;
      if (dup) {
        return Response.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
      }
    }

    if (role_id !== undefined) {
      const roleExists = db.prepare('SELECT id FROM roles WHERE id = ?').get(role_id) as { id: number } | undefined;
      if (!roleExists) {
        return Response.json({ error: 'El rol especificado no existe' }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    let hashedPassword: string | null = null;
    if (password && typeof password === 'string' && password.length >= 6) {
      hashedPassword = bcrypt.hashSync(password, 10);
    } else if (password !== undefined && password !== '') {
      return Response.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    db.prepare(`
      UPDATE admin_users SET
        name       = COALESCE(?, name),
        email      = COALESCE(?, email),
        role_id    = COALESCE(?, role_id),
        active     = COALESCE(?, active),
        password   = COALESCE(?, password),
        updated_at = ?
      WHERE id = ?
    `).run(
      name ?? null,
      email !== undefined ? email.toLowerCase().trim() : null,
      role_id ?? null,
      active ?? null,
      hashedPassword,
      now,
      id
    );

    const updated = db
      .prepare(`
        SELECT u.id, u.email, u.name, u.created_at, u.role_id, u.active, u.last_login, u.updated_at,
               r.name AS role_name
        FROM admin_users u
        LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = ?
      `)
      .get(id) as Omit<UserRow, 'password'>;

    console.log(`[users] Updated user ${id} by actor ${actor.id}`);

    return Response.json({ user: updated });
  } catch (err) {
    console.error('[PUT /api/admin/users]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user: actor, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const { searchParams } = request.nextUrl;
    const idStr = searchParams.get('id');
    if (!idStr) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }
    const id = Number(idStr);

    if (id === actor.id) {
      return Response.json({ error: 'No puedes eliminar tu propio usuario' }, { status: 409 });
    }

    const db = getDb();
    const target = db.prepare('SELECT * FROM admin_users WHERE id = ?').get(id) as UserRow | undefined;
    if (!target) {
      return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Get the super_admin role id
    const superAdminRole = db.prepare("SELECT id FROM roles WHERE name = 'super_admin'").get() as { id: number } | undefined;
    if (superAdminRole && target.role_id === superAdminRole.id) {
      const superAdminCount = db
        .prepare('SELECT COUNT(*) as c FROM admin_users WHERE role_id = ? AND active = 1')
        .get(superAdminRole.id) as { c: number };
      if (superAdminCount.c <= 1) {
        return Response.json({ error: 'No puedes eliminar al último super_admin' }, { status: 409 });
      }
    }

    db.prepare('DELETE FROM admin_users WHERE id = ?').run(id);
    console.log(`[users] Deleted user ${id} by actor ${actor.id}`);

    return Response.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/users]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
