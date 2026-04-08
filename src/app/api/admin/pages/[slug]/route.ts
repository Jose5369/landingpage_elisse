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

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const { slug } = await params;
    const db = getDb();
    const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as Page | undefined;

    if (!page) {
      return Response.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    return Response.json({ page });
  } catch (error) {
    console.error('[GET /api/admin/pages/[slug]]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const { slug } = await params;
    const body = await request.json();
    const {
      title,
      slug: newSlug,
      content,
      meta_title,
      meta_description,
      published,
    } = body as Partial<Page>;

    const db = getDb();
    const existing = db.prepare('SELECT * FROM pages WHERE slug = ?').get(slug) as Page | undefined;

    if (!existing) {
      return Response.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    const now = new Date().toISOString();

    try {
      db.prepare(
        `UPDATE pages SET
          title            = COALESCE(?, title),
          slug             = COALESCE(?, slug),
          content          = COALESCE(?, content),
          meta_title       = COALESCE(?, meta_title),
          meta_description = COALESCE(?, meta_description),
          published        = COALESCE(?, published),
          updated_at       = ?
        WHERE slug = ?`
      ).run(
        title ?? null,
        newSlug ?? null,
        content ?? null,
        meta_title ?? null,
        meta_description ?? null,
        published ?? null,
        now,
        slug
      );
    } catch (dbError: unknown) {
      if ((dbError as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return Response.json({ error: 'El slug ya existe' }, { status: 409 });
      }
      throw dbError;
    }

    const updated = db
      .prepare('SELECT * FROM pages WHERE slug = ?')
      .get(newSlug ?? slug) as Page;

    return Response.json({ page: updated });
  } catch (error) {
    console.error('[PUT /api/admin/pages/[slug]]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const payload = getAuthPayload(request);
  if (!payload) return unauthorizedResponse();

  try {
    const { slug } = await params;
    const db = getDb();
    const info = db.prepare('DELETE FROM pages WHERE slug = ?').run(slug);

    if (info.changes === 0) {
      return Response.json({ error: 'Página no encontrada' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/admin/pages/[slug]]', error);
    return Response.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
