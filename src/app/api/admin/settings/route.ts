import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface Setting {
  key: string;
  value: string;
  category: string;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const rows = db.prepare('SELECT key, value, category FROM settings ORDER BY category, key').all() as Setting[];

    // Group by category for convenience
    const grouped = rows.reduce<Record<string, Record<string, string>>>((acc, row) => {
      if (!acc[row.category]) acc[row.category] = {};
      acc[row.category][row.key] = row.value;
      return acc;
    }, {});

    return Response.json({ settings: rows, grouped });
  } catch (error) {
    console.error('[GET /api/admin/settings]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const updates = body as Record<string, string>;

    if (!updates || typeof updates !== 'object') {
      return Response.json({ error: 'Body inválido' }, { status: 400 });
    }

    const db = getDb();
    const upsert = db.prepare(
      'INSERT INTO settings (key, value, category) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
    );

    const applyUpdates = db.transaction(() => {
      for (const [key, value] of Object.entries(updates)) {
        // Fetch existing category or default to 'general'
        const existing = db
          .prepare('SELECT category FROM settings WHERE key = ?')
          .get(key) as { category: string } | undefined;
        upsert.run(key, String(value), existing?.category ?? 'general');
      }
    });
    applyUpdates();

    return Response.json({ success: true });
  } catch (error) {
    console.error('[PUT /api/admin/settings]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
