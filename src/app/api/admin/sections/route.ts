import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface Section {
  id: number;
  section_key: string;
  title: string;
  subtitle: string;
  content: string;
  activo: number;
  orden: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const sections = db
      .prepare('SELECT * FROM sections ORDER BY orden ASC')
      .all() as Section[];
    return Response.json({ sections });
  } catch (error) {
    console.error('[GET /api/admin/sections]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();

    // Accept either a single section object or an array for batch updates
    const updates: Partial<Section>[] = Array.isArray(body) ? body : [body];

    const db = getDb();
    const stmt = db.prepare(
      `UPDATE sections SET
        title    = COALESCE(?, title),
        subtitle = COALESCE(?, subtitle),
        content  = COALESCE(?, content),
        activo   = COALESCE(?, activo),
        orden    = COALESCE(?, orden)
      WHERE section_key = ?`
    );

    const applyUpdates = db.transaction(() => {
      for (const s of updates) {
        if (!s.section_key) continue;
        stmt.run(
          s.title ?? null,
          s.subtitle ?? null,
          s.content ?? null,
          s.activo ?? null,
          s.orden ?? null,
          s.section_key
        );
      }
    });
    applyUpdates();

    const sections = db
      .prepare('SELECT * FROM sections ORDER BY orden ASC')
      .all() as Section[];

    return Response.json({ sections });
  } catch (error) {
    console.error('[PUT /api/admin/sections]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
