import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface Benefit {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
  activo: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM benefits ORDER BY orden ASC')
      .all() as Benefit[];
    return Response.json({ benefits: items });
  } catch (error) {
    console.error('[GET /api/admin/benefits]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { icon = '', title, description = '', orden = 0, activo = 1 } = body as Partial<Benefit>;

    if (!title) {
      return Response.json({ error: 'title es requerido' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare('INSERT INTO benefits (icon, title, description, orden, activo) VALUES (?, ?, ?, ?, ?)')
      .run(icon, title, description, orden, activo);

    const created = db
      .prepare('SELECT * FROM benefits WHERE id = ?')
      .get(result.lastInsertRowid) as Benefit;

    return Response.json({ benefit: created }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/benefits]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, icon, title, description, orden, activo } = body as Partial<Benefit>;

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `UPDATE benefits SET
        icon        = COALESCE(?, icon),
        title       = COALESCE(?, title),
        description = COALESCE(?, description),
        orden       = COALESCE(?, orden),
        activo      = COALESCE(?, activo)
      WHERE id = ?`
    ).run(icon ?? null, title ?? null, description ?? null, orden ?? null, activo ?? null, id);

    const updated = db.prepare('SELECT * FROM benefits WHERE id = ?').get(id) as Benefit | undefined;
    if (!updated) return Response.json({ error: 'Beneficio no encontrado' }, { status: 404 });

    return Response.json({ benefit: updated });
  } catch (error) {
    console.error('[PUT /api/admin/benefits]', error);
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
    const info = db.prepare('DELETE FROM benefits WHERE id = ?').run(Number(id));

    if (info.changes === 0) {
      return Response.json({ error: 'Beneficio no encontrado' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/benefits]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
