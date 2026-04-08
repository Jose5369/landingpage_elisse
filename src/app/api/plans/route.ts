import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(_request: NextRequest) {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'system_url'")
      .get() as { value: string } | undefined;

    const systemUrl = row?.value?.replace(/\/$/, '') ?? '';

    if (!systemUrl) {
      return Response.json({ error: 'system_url no configurado' }, { status: 503 });
    }

    const upstream = await fetch(`${systemUrl}/api_landing/planes`, {
      headers: { 'Content-Type': 'application/json' },
      // Propagate cache behaviour: do not cache at edge so plans stay fresh
      cache: 'no-store',
    });

    const data = await upstream.json();
    return Response.json(data, { status: upstream.status });
  } catch (error) {
    console.error('[GET /api/plans]', error);
    return Response.json({ error: 'Error al obtener planes' }, { status: 502 });
  }
}
