import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, requirePermission, unauthorizedResponse } from '@/lib/auth';

interface RoleRow {
  id: number;
  name: string;
  description: string | null;
  permissions: string;
  is_system: number;
  created_at: string;
  user_count?: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const roles = db
      .prepare(`
        SELECT
          r.*,
          COUNT(u.id) AS user_count
        FROM roles r
        LEFT JOIN admin_users u ON u.role_id = r.id
        GROUP BY r.id
        ORDER BY r.id ASC
      `)
      .all() as RoleRow[];

    const parsed = roles.map((r) => ({
      ...r,
      permissions: (() => {
        try { return JSON.parse(r.permissions) as string[]; } catch { return []; }
      })(),
    }));

    return Response.json({ roles: parsed });
  } catch (error) {
    console.error('[GET /api/admin/roles]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const body = await request.json() as {
      name?: string;
      description?: string;
      permissions?: unknown;
    };
    const { name, description = '', permissions } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return Response.json({ error: 'El nombre es requerido' }, { status: 400 });
    }
    if (!Array.isArray(permissions)) {
      return Response.json({ error: 'permissions debe ser un array' }, { status: 400 });
    }

    const db = getDb();

    const existing = db.prepare('SELECT id FROM roles WHERE name = ?').get(name.trim()) as { id: number } | undefined;
    if (existing) {
      return Response.json({ error: 'Ya existe un rol con ese nombre' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const result = db
      .prepare('INSERT INTO roles (name, description, permissions, is_system, created_at) VALUES (?, ?, ?, 0, ?)')
      .run(name.trim(), description, JSON.stringify(permissions), now);

    const created = db.prepare('SELECT * FROM roles WHERE id = ?').get(result.lastInsertRowid) as RoleRow;

    console.log(`[roles] Created role "${name}" by user ${user.id}`);

    return Response.json({
      role: {
        ...created,
        permissions: (() => {
          try { return JSON.parse(created.permissions) as string[]; } catch { return []; }
        })(),
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/roles]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { user, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const body = await request.json() as {
      id?: number;
      name?: string;
      description?: string;
      permissions?: unknown;
    };
    const { id, name, description, permissions } = body;

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as RoleRow | undefined;
    if (!role) {
      return Response.json({ error: 'Rol no encontrado' }, { status: 404 });
    }

    if (role.is_system) {
      // For system roles, only description can be updated
      db.prepare('UPDATE roles SET description = COALESCE(?, description) WHERE id = ?')
        .run(description ?? null, id);
    } else {
      // For custom roles, all fields can be updated
      if (name !== undefined && name.trim() !== role.name) {
        const existing = db.prepare('SELECT id FROM roles WHERE name = ? AND id != ?').get(name.trim(), id) as { id: number } | undefined;
        if (existing) {
          return Response.json({ error: 'Ya existe un rol con ese nombre' }, { status: 409 });
        }
      }
      if (permissions !== undefined && !Array.isArray(permissions)) {
        return Response.json({ error: 'permissions debe ser un array' }, { status: 400 });
      }

      db.prepare(`
        UPDATE roles SET
          name        = COALESCE(?, name),
          description = COALESCE(?, description),
          permissions = COALESCE(?, permissions)
        WHERE id = ?
      `).run(
        name !== undefined ? name.trim() : null,
        description ?? null,
        permissions !== undefined ? JSON.stringify(permissions) : null,
        id
      );
    }

    const updated = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as RoleRow;
    console.log(`[roles] Updated role ${id} by user ${user.id}`);

    return Response.json({
      role: {
        ...updated,
        permissions: (() => {
          try { return JSON.parse(updated.permissions) as string[]; } catch { return []; }
        })(),
      },
    });
  } catch (err) {
    console.error('[PUT /api/admin/roles]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, error } = requirePermission(request, 'users.write');
  if (error) return error;

  try {
    const { searchParams } = request.nextUrl;
    const idStr = searchParams.get('id');
    if (!idStr) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }
    const id = Number(idStr);

    const db = getDb();
    const role = db.prepare('SELECT * FROM roles WHERE id = ?').get(id) as RoleRow | undefined;
    if (!role) {
      return Response.json({ error: 'Rol no encontrado' }, { status: 404 });
    }
    if (role.is_system) {
      return Response.json({ error: 'No se pueden eliminar roles del sistema' }, { status: 409 });
    }

    const assigned = db.prepare('SELECT COUNT(*) as c FROM admin_users WHERE role_id = ?').get(id) as { c: number };
    if (assigned.c > 0) {
      return Response.json({ error: 'No se puede eliminar un rol que tiene usuarios asignados' }, { status: 409 });
    }

    db.prepare('DELETE FROM roles WHERE id = ?').run(id);
    console.log(`[roles] Deleted role ${id} by user ${user.id}`);

    return Response.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/roles]', err);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
