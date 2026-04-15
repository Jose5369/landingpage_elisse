import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Section {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  badge: string | null;
  extra_json: string | null;
  orden: number;
}

interface Feature {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
}

interface Benefit {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
}

interface Industry {
  id: number;
  icon: string;
  name: string;
  orden: number;
}

interface MenuItem {
  id: number;
  label: string;
  href: string;
  orden: number;
}

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

export async function GET() {
  try {
    const db = getDb();

    // Settings (public only) — flat key/value
    const settingRows = db
      .prepare(
        `SELECT key, value FROM settings
         WHERE key IN (
           'site_name','primary_color','font_family','logo_url','logo_white_url',
           'favicon_url','logo_height','logo_icon','system_url',
           'announcement_text','announcement_active','announcement_link_text','announcement_link_href',
           'whatsapp_number','whatsapp_active','whatsapp_message',
           'footer_description','footer_copyright',
           'meta_title','meta_description','meta_keywords','og_image_url',
           'contact_email','contact_phone','contact_address'
         )`
      )
      .all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const row of settingRows) settings[row.key] = row.value;

    // Sections — keyed by section_key for easy lookup
    const sectionRows = db
      .prepare(
        `SELECT section_key, title, subtitle, content, badge, extra_json, orden
         FROM sections
         WHERE activo = 1
         ORDER BY orden`
      )
      .all() as Section[];
    const sections: Record<string, Section> = {};
    for (const row of sectionRows) sections[row.section_key] = row;

    // Features (active, ordered)
    const features = db
      .prepare(
        `SELECT id, icon, title, description, orden
         FROM features
         WHERE activo = 1
         ORDER BY orden, id`
      )
      .all() as Feature[];

    // Benefits (active, ordered)
    const benefits = db
      .prepare(
        `SELECT id, icon, title, description, orden
         FROM benefits
         WHERE activo = 1
         ORDER BY orden, id`
      )
      .all() as Benefit[];

    // Industries (active, ordered)
    const industries = db
      .prepare(
        `SELECT id, icon, name, orden
         FROM industries
         WHERE activo = 1
         ORDER BY orden, id`
      )
      .all() as Industry[];

    // Menu items (active, ordered)
    const menu = db
      .prepare(
        `SELECT id, label, href, orden
         FROM menu_items
         WHERE activo = 1
         ORDER BY orden, id`
      )
      .all() as MenuItem[];

    // Social links (active)
    const social = db
      .prepare(
        `SELECT id, platform, url, icon
         FROM social_links
         WHERE activo = 1
         ORDER BY id`
      )
      .all() as SocialLink[];

    return Response.json({
      settings,
      sections,
      features,
      benefits,
      industries,
      menu,
      social,
    });
  } catch (error) {
    console.error('[GET /api/content]', error);
    return Response.json({ error: 'Error al obtener contenido' }, { status: 500 });
  }
}
