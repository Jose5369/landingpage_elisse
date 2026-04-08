import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface Industry {
  id: number;
  icon: string;
  name: string;
  orden: number;
  activo: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM industries ORDER BY orden ASC')
      .all() as Industry[];
    return Response.json({ industries: items });
  } catch (error) {
    console.error('[GET /api/admin/industries]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { icon = '', name, orden = 0, activo = 1 } = body as Partial<Industry>;

    if (!name) {
      return Response.json({ error: 'name es requerido' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare('INSERT INTO industries (icon, name, orden, activo) VALUES (?, ?, ?, ?)')
      .run(icon, name, orden, activo);

    const created = db
      .prepare('SELECT * FROM industries WHERE id = ?')
      .get(result.lastInsertRowid) as Industry;

    return Response.json({ industry: created }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/industries]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, icon, name, orden, activo } = body as Partial<Industry>;

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `UPDATE industries SET
        icon   = COALESCE(?, icon),
        name   = COALESCE(?, name),
        orden  = COALESCE(?, orden),
        activo = COALESCE(?, activo)
      WHERE id = ?`
    ).run(icon ?? null, name ?? null, orden ?? null, activo ?? null, id);

    const updated = db
      .prepare('SELECT * FROM industries WHERE id = ?')
      .get(id) as Industry | undefined;

    if (!updated) return Response.json({ error: 'Industria no encontrada' }, { status: 404 });

    return Response.json({ industry: updated });
  } catch (error) {
    console.error('[PUT /api/admin/industries]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    const info = db.prepare('DELETE FROM industries WHERE id = ?').run(Number(id));

    if (info.changes === 0) {
      return Response.json({ error: 'Industria no encontrada' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/industries]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
