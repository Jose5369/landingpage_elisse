import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    // Basic validation
    if (!body.name || !body.email) {
      return Response.json(
        { error: 'name y email son requeridos' },
        { status: 400 }
      );
    }

    const db = getDb();
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'system_url'")
      .get() as { value: string } | undefined;

    const systemUrl = row?.value?.replace(/\/$/, '') ?? '';

    if (!systemUrl) {
      return Response.json({ error: 'system_url no configurado' }, { status: 503 });
    }

    const upstream = await fetch(`${systemUrl}/api_landing/contacto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (error) {
    console.error('[POST /api/contact]', error);
    return Response.json({ error: 'Error al enviar el mensaje' }, { status: 502 });
  }
}
