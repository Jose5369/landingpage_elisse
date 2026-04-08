import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  activo: number;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const links = db
      .prepare('SELECT * FROM social_links ORDER BY id ASC')
      .all() as SocialLink[];
    return Response.json({ social_links: links });
  } catch (error) {
    console.error('[GET /api/admin/social]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();

    // Accept a single object or an array for batch updates
    const updates: Partial<SocialLink>[] = Array.isArray(body) ? body : [body];

    const db = getDb();
    const stmt = db.prepare(
      `UPDATE social_links SET
        url    = COALESCE(?, url),
        icon   = COALESCE(?, icon),
        activo = COALESCE(?, activo)
      WHERE id = ?`
    );

    const applyUpdates = db.transaction(() => {
      for (const link of updates) {
        if (!link.id) continue;
        stmt.run(link.url ?? null, link.icon ?? null, link.activo ?? null, link.id);
      }
    });
    applyUpdates();

    const links = db
      .prepare('SELECT * FROM social_links ORDER BY id ASC')
      .all() as SocialLink[];

    return Response.json({ social_links: links });
  } catch (error) {
    console.error('[PUT /api/admin/social]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
