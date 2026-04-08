import { getDb } from '@/lib/db';

const PUBLIC_KEYS = [
  'system_url',
  'site_name',
  'primary_color',
  'font_family',
  'logo_icon',
  'announcement_text',
  'announcement_active',
  'whatsapp_number',
  'whatsapp_active',
  'meta_title',
  'meta_description',
  'favicon_url',
];

export async function GET() {
  try {
    const db = getDb();
    const placeholders = PUBLIC_KEYS.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`)
      .all(...PUBLIC_KEYS) as { key: string; value: string }[];

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return Response.json(settings);
  } catch (error) {
    console.error('[GET /api/settings]', error);
    return Response.json({}, { status: 500 });
  }
}
