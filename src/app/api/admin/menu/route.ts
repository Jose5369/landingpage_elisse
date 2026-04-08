import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface MenuItem {
  id: number;
  label: string;
  href: string;
  orden: number;
  activo: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const items = db
      .prepare('SELECT * FROM menu_items ORDER BY orden ASC')
      .all() as MenuItem[];
    return Response.json({ items });
  } catch (error) {
    console.error('[GET /api/admin/menu]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { label, href, orden = 0, activo = 1 } = body as Partial<MenuItem>;

    if (!label || !href) {
      return Response.json({ error: 'label y href son requeridos' }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare('INSERT INTO menu_items (label, href, orden, activo) VALUES (?, ?, ?, ?)')
      .run(label, href, orden, activo);

    const created = db
      .prepare('SELECT * FROM menu_items WHERE id = ?')
      .get(result.lastInsertRowid) as MenuItem;

    return Response.json({ item: created }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/admin/menu]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const { id, label, href, orden, activo } = body as Partial<MenuItem>;

    if (!id) {
      return Response.json({ error: 'id es requerido' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      'UPDATE menu_items SET label = COALESCE(?, label), href = COALESCE(?, href), orden = COALESCE(?, orden), activo = COALESCE(?, activo) WHERE id = ?'
    ).run(label ?? null, href ?? null, orden ?? null, activo ?? null, id);

    const updated = db.prepare('SELECT * FROM menu_items WHERE id = ?').get(id) as MenuItem | undefined;
    if (!updated) return Response.json({ error: 'Item no encontrado' }, { status: 404 });

    return Response.json({ item: updated });
  } catch (error) {
    console.error('[PUT /api/admin/menu]', error);
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
    const info = db.prepare('DELETE FROM menu_items WHERE id = ?').run(Number(id));

    if (info.changes === 0) {
      return Response.json({ error: 'Item no encontrado' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/menu]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
