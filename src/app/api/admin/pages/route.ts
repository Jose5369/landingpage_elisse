import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  published: number;
  created_at: string;
  updated_at: string;
}

export async function GET(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const db = getDb();
    const pages = db
      .prepare('SELECT * FROM pages ORDER BY created_at DESC')
      .all() as Page[];
    return Response.json({ pages });
  } catch (error) {
    console.error('[GET /api/admin/pages]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const body = await request.json();
    const {
      title,
      slug,
      content = '',
      meta_title = '',
      meta_description = '',
      published = 0,
    } = body as Partial<Page>;

    if (!title || !slug) {
      return Response.json({ error: 'title y slug son requeridos' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const db = getDb();

    try {
      const result = db
        .prepare(
          `INSERT INTO pages (title, slug, content, meta_title, meta_description, published, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(title, slug, content, meta_title, meta_description, published, now, now);

      const created = db
        .prepare('SELECT * FROM pages WHERE id = ?')
        .get(result.lastInsertRowid) as Page;

      return Response.json({ page: created }, { status: 201 });
    } catch (dbError: unknown) {
      if ((dbError as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return Response.json({ error: 'El slug ya existe' }, { status: 409 });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[POST /api/admin/pages]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
