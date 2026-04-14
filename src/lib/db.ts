import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'landing.db');

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  _db = new Database(DB_PATH);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');

  initializeTables(_db);

  return _db;
}

function initializeTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      label  TEXT NOT NULL,
      href   TEXT NOT NULL,
      orden  INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pages (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      title            TEXT NOT NULL,
      slug             TEXT UNIQUE NOT NULL,
      content          TEXT,
      meta_title       TEXT,
      meta_description TEXT,
      published        INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sections (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT UNIQUE NOT NULL,
      title       TEXT,
      subtitle    TEXT,
      content     TEXT,
      activo      INTEGER NOT NULL DEFAULT 1,
      orden       INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS features (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      icon        TEXT,
      title       TEXT NOT NULL,
      description TEXT,
      orden       INTEGER NOT NULL DEFAULT 0,
      activo      INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS benefits (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      icon        TEXT,
      title       TEXT NOT NULL,
      description TEXT,
      orden       INTEGER NOT NULL DEFAULT 0,
      activo      INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS industries (
      id     INTEGER PRIMARY KEY AUTOINCREMENT,
      icon   TEXT,
      name   TEXT NOT NULL,
      orden  INTEGER NOT NULL DEFAULT 0,
      activo INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS social_links (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      platform TEXT NOT NULL,
      url      TEXT NOT NULL DEFAULT '',
      icon     TEXT,
      activo   INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS roles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT UNIQUE NOT NULL,
      description TEXT,
      permissions TEXT NOT NULL DEFAULT '[]',
      is_system   INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      name       TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Add new columns to admin_users if they don't exist yet (table already existed)
  const alterColumns: [string, string][] = [
    ['role_id',    'INTEGER REFERENCES roles(id)'],
    ['active',     'INTEGER NOT NULL DEFAULT 1'],
    ['last_login', 'TEXT'],
    ['updated_at', 'TEXT'],
  ];

  for (const [col, def] of alterColumns) {
    try {
      db.exec(`ALTER TABLE admin_users ADD COLUMN ${col} ${def}`);
    } catch {
      // Column already exists – that's fine
    }
  }

  seedDefaultData(db);
  seedRoles(db);
}

function seedRoles(db: Database.Database): void {
  const now = new Date().toISOString();

  const rolesCount = (db.prepare('SELECT COUNT(*) as c FROM roles').get() as { c: number }).c;
  if (rolesCount === 0) {
    const insertRole = db.prepare(
      'INSERT INTO roles (name, description, permissions, is_system, created_at) VALUES (?, ?, ?, ?, ?)'
    );

    const defaultRoles: [string, string, string, number][] = [
      [
        'super_admin',
        'Acceso total al sistema',
        JSON.stringify(['*']),
        1,
      ],
      [
        'admin',
        'Administrador con acceso a la mayoría de secciones',
        JSON.stringify(['settings.*', 'menu.*', 'sections.*', 'features.*', 'benefits.*', 'industries.*', 'pages.*', 'social.*', 'users.read']),
        1,
      ],
      [
        'editor',
        'Editor de contenido',
        JSON.stringify(['pages.*', 'features.read', 'benefits.read', 'industries.read']),
        1,
      ],
      [
        'viewer',
        'Solo lectura',
        JSON.stringify(['*.read']),
        1,
      ],
    ];

    const seedRolesTransaction = db.transaction(() => {
      for (const [name, description, permissions, is_system] of defaultRoles) {
        insertRole.run(name, description, permissions, is_system, now);
      }
    });
    seedRolesTransaction();
  }

  // Assign role_id = 1 (super_admin) to existing admin users if not set
  db.prepare("UPDATE admin_users SET role_id = 1 WHERE role_id IS NULL").run();
}

function seedDefaultData(db: Database.Database): void {
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value, category) VALUES (?, ?, ?)'
  );

  // ── Branding settings — always seed if missing (safe to run on existing DBs) ─
  const brandingDefaults: [string, string, string][] = [
    ['logo_url',       '/logos/logo-elise.png',  'branding'],
    ['logo_white_url', '/logos/logo-white.png',  'branding'],
    ['favicon_url',    '/logos/icono-elise.png', 'branding'],
    ['logo_height',    '40',                      'branding'],
  ];
  db.transaction(() => {
    for (const [key, value, category] of brandingDefaults) {
      insertSetting.run(key, value, category);
    }
  })();

  // Only seed remaining data if full defaults have not been inserted yet
  const alreadySeeded = db
    .prepare("SELECT COUNT(*) as c FROM settings WHERE key = 'site_name'")
    .get() as { c: number };
  if (alreadySeeded.c > 0) return;

  const now = new Date().toISOString();

  // ── Settings ──────────────────────────────────────────────────────────────
  const settings: [string, string, string][] = [
    ['site_name',            'ELISE SYSTEM',                                    'general'],
    ['primary_color',        '#007fff',                                         'general'],
    ['font_family',          'Inter',                                           'general'],
    ['logo_icon',            'point_of_sale',                                   'general'],
    ['favicon_url',          '',                                                'general'],
    ['og_image_url',         '',                                                'general'],
    ['meta_title',           'ELISE SYSTEM \u2013 Sistema POS e Inventario',   'seo'],
    ['meta_description',     'La plataforma l\u00EDder para gesti\u00F3n de ventas, inventario y facturaci\u00F3n para peque\u00F1as y medianas empresas.', 'seo'],
    ['meta_keywords',        'POS, inventario, facturaci\u00F3n, ventas, PYME', 'seo'],
    ['announcement_text',    'Moderniza tu negocio con ELISE SYSTEM \u2013 \u00A1Prueba gratis 30 d\u00EDas!', 'announcement'],
    ['announcement_active',  '1',                                               'announcement'],
    ['whatsapp_number',      '',                                                'contact'],
    ['whatsapp_active',      '1',                                               'contact'],
    ['footer_description',   'La plataforma l\u00EDder para gesti\u00F3n de ventas, inventario y facturaci\u00F3n para peque\u00F1as y medianas empresas.', 'footer'],
    ['system_url',           'https://app.elisesystem.com',                    'integrations'],
  ];

  const seedSettings = db.transaction(() => {
    for (const [key, value, category] of settings) {
      insertSetting.run(key, value, category);
    }
  });
  seedSettings();

  // ── Menu items ─────────────────────────────────────────────────────────────
  const menuCount = (db.prepare('SELECT COUNT(*) as c FROM menu_items').get() as { c: number }).c;
  if (menuCount === 0) {
    const insertMenu = db.prepare(
      'INSERT INTO menu_items (label, href, orden, activo) VALUES (?, ?, ?, 1)'
    );
    const menuItems: [string, string, number][] = [
      ['Funciones', '#funciones', 1],
      ['Precios',   '#precios',   2],
      ['Soporte',   '#soporte',   3],
      ['Acceder',   '#acceder',   4],
    ];
    const seedMenu = db.transaction(() => {
      for (const [label, href, orden] of menuItems) {
        insertMenu.run(label, href, orden);
      }
    });
    seedMenu();
  }

  // ── Features ───────────────────────────────────────────────────────────────
  const featuresCount = (db.prepare('SELECT COUNT(*) as c FROM features').get() as { c: number }).c;
  if (featuresCount === 0) {
    const insertFeature = db.prepare(
      'INSERT INTO features (icon, title, description, orden, activo) VALUES (?, ?, ?, ?, 1)'
    );
    const features: [string, string, string, number][] = [
      ['point_of_sale', 'POS R\u00E1pido', 'Procesa ventas en segundos con interfaz intuitiva, m\u00FAltiples m\u00E9todos de pago y cierre de caja automatizado.', 1],
      ['inventory_2',   'Inventario en Tiempo Real', 'Control total de stock, alertas de m\u00EDnimos, movimientos y ajustes de inventario al instante.', 2],
      ['category',      'Gesti\u00F3n de Productos', 'Crea cat\u00E1logos ilimitados con variantes, precios por lista, im\u00E1genes y c\u00F3digos de barras.', 3],
      ['people',        'Clientes y CxC', 'Administra tu cartera de clientes, cr\u00E9ditos, estado de cuenta y cobranzas en un solo lugar.', 4],
      ['local_shipping','Compras y Proveedores', 'Gestiona \u00F3rdenes de compra, recepciones, cuentas por pagar y relaci\u00F3n con proveedores.', 5],
      ['bar_chart',     'Reportes y Anal\u00EDtica', 'Dashboard en tiempo real con ventas, utilidades, productos m\u00E1s vendidos y desempe\u00F1o por vendedor.', 6],
      ['receipt_long',  'Facturaci\u00F3n Electr\u00F3nica', 'Emite facturas, notas de cr\u00E9dito y d\u00E9bito con cumplimiento fiscal, env\u00EDo por correo y almacenamiento en la nube.', 7],
      ['business',      'Multiempresa', 'Administra varias empresas o sucursales desde una sola cuenta con permisos diferenciados.', 8],
    ];
    const seedFeatures = db.transaction(() => {
      for (const [icon, title, description, orden] of features) {
        insertFeature.run(icon, title, description, orden);
      }
    });
    seedFeatures();
  }

  // ── Benefits ───────────────────────────────────────────────────────────────
  const benefitsCount = (db.prepare('SELECT COUNT(*) as c FROM benefits').get() as { c: number }).c;
  if (benefitsCount === 0) {
    const insertBenefit = db.prepare(
      'INSERT INTO benefits (icon, title, description, orden, activo) VALUES (?, ?, ?, ?, 1)'
    );
    const benefits: [string, string, string, number][] = [
      ['bolt',          'Implementaci\u00F3n Inmediata', 'Comienza a vender el mismo d\u00EDa. Sin instalaciones complejas, sin necesidad de t\u00E9cnicos.', 1],
      ['cloud_sync',    'Siempre Actualizado',           'Actualizaciones autom\u00E1ticas sin costo adicional. Siempre tendr\u00E1s la versi\u00F3n m\u00E1s reciente.', 2],
      ['lock',          'Seguridad Garantizada',         'Tus datos protegidos con cifrado de grado bancario y respaldos autom\u00E1ticos en la nube.', 3],
      ['support_agent', 'Soporte Experto',               'Equipo de soporte disponible para ayudarte a sacar el m\u00E1ximo provecho del sistema.', 4],
      ['devices',       'Multiplataforma',               'Accede desde cualquier dispositivo: computador, tablet o celular, sin apps adicionales.', 5],
      ['trending_up',   'Escala con Tu Negocio',         'Desde emprendedores hasta empresas medianas, ELISE crece contigo sin cambiar de plataforma.', 6],
    ];
    const seedBenefits = db.transaction(() => {
      for (const [icon, title, description, orden] of benefits) {
        insertBenefit.run(icon, title, description, orden);
      }
    });
    seedBenefits();
  }

  // ── Industries ─────────────────────────────────────────────────────────────
  const industriesCount = (db.prepare('SELECT COUNT(*) as c FROM industries').get() as { c: number }).c;
  if (industriesCount === 0) {
    const insertIndustry = db.prepare(
      'INSERT INTO industries (icon, name, orden, activo) VALUES (?, ?, ?, 1)'
    );
    const industries: [string, string, number][] = [
      ['storefront',       'Tiendas y Retail',          1],
      ['restaurant',       'Restaurantes y Caf\u00E9ter\u00EDas', 2],
      ['medical_services', 'Salud y Farmacias',          3],
      ['hardware',         'Ferreter\u00EDas',           4],
      ['spa',              'Belleza y Est\u00E9tica',    5],
    ];
    const seedIndustries = db.transaction(() => {
      for (const [icon, name, orden] of industries) {
        insertIndustry.run(icon, name, orden);
      }
    });
    seedIndustries();
  }

  // ── Social links ───────────────────────────────────────────────────────────
  const socialCount = (db.prepare('SELECT COUNT(*) as c FROM social_links').get() as { c: number }).c;
  if (socialCount === 0) {
    const insertSocial = db.prepare(
      'INSERT INTO social_links (platform, url, icon, activo) VALUES (?, ?, ?, 1)'
    );
    const socials: [string, string, string][] = [
      ['Facebook',  '', 'facebook'],
      ['Instagram', '', 'instagram'],
      ['Twitter',   '', 'twitter'],
      ['YouTube',   '', 'youtube'],
      ['LinkedIn',  '', 'linkedin'],
    ];
    const seedSocials = db.transaction(() => {
      for (const [platform, url, icon] of socials) {
        insertSocial.run(platform, url, icon);
      }
    });
    seedSocials();
  }

  // ── Sections ───────────────────────────────────────────────────────────────
  const sectionsCount = (db.prepare('SELECT COUNT(*) as c FROM sections').get() as { c: number }).c;
  if (sectionsCount === 0) {
    const insertSection = db.prepare(
      'INSERT INTO sections (section_key, title, subtitle, content, activo, orden) VALUES (?, ?, ?, ?, 1, ?)'
    );
    const sections: [string, string, string, string, number][] = [
      ['hero',         'El Sistema POS que Impulsa tu Negocio', 'Todo lo que necesitas para gestionar ventas, inventario y clientes en una sola plataforma.', '', 1],
      ['trust_bar',    'Con la confianza de cientos de empresas', '', '', 2],
      ['showcase',     'Dise\u00F1ado para la Velocidad y la Claridad', 'Cada pantalla pensada para que t\u00FA y tu equipo trabajen sin fricciones.', '', 3],
      ['whatsapp_cta', '\u00BFTienes preguntas? Hablemos por WhatsApp', 'Nuestro equipo est\u00E1 listo para ayudarte a elegir el plan ideal para tu negocio.', '', 4],
      ['pricing',      'Planes y Precios', 'Elige el plan que mejor se adapta a tu negocio. Sin sorpresas, sin letra peque\u00F1a.', '', 5],
      ['testimonials', 'Lo que dicen nuestros clientes', 'Negocios como el tuyo ya est\u00E1n creciendo con ELISE SYSTEM.', '', 6],
      ['final_cta',    '\u00BFListo para transformar tu negocio?', '\u00DAnete a cientos de empresas que ya conf\u00EDan en ELISE SYSTEM para gestionar sus operaciones.', '', 7],
    ];
    const seedSections = db.transaction(() => {
      for (const [section_key, title, subtitle, content, orden] of sections) {
        insertSection.run(section_key, title, subtitle, content, orden);
      }
    });
    seedSections();
  }

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminCount = (db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number }).c;
  if (adminCount === 0) {
    const hash = bcrypt.hashSync('admin123', 12);
    db.prepare(
      'INSERT INTO admin_users (email, password, name, created_at) VALUES (?, ?, ?, ?)'
    ).run('admin@elisesystem.com', hash, 'Administrador', now);
  }

  // ── Default pages ──────────────────────────────────────────────────────────
  const pagesCount = (db.prepare('SELECT COUNT(*) as c FROM pages').get() as { c: number }).c;
  if (pagesCount === 0) {
    const insertPage = db.prepare(`
      INSERT INTO pages (title, slug, content, meta_title, meta_description, published, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?)
    `);
    const defaultPages: [string, string, string, string, string][] = [
      [
        'Pol\u00EDtica de Privacidad',
        'politica-privacidad',
        '<h2>Pol\u00EDtica de Privacidad</h2><p>En ELISE SYSTEM nos comprometemos a proteger tu informaci\u00F3n personal.</p>',
        'Pol\u00EDtica de Privacidad \u2013 ELISE SYSTEM',
        'Conoce c\u00F3mo ELISE SYSTEM protege y gestiona tu informaci\u00F3n personal.',
      ],
      [
        'T\u00E9rminos de Servicio',
        'terminos-servicio',
        '<h2>T\u00E9rminos de Servicio</h2><p>Al utilizar ELISE SYSTEM aceptas los presentes t\u00E9rminos y condiciones.</p>',
        'T\u00E9rminos de Servicio \u2013 ELISE SYSTEM',
        'Lee los t\u00E9rminos y condiciones de uso de la plataforma ELISE SYSTEM.',
      ],
      [
        'Pol\u00EDtica de Devoluciones',
        'politica-devoluciones',
        '<h2>Pol\u00EDtica de Devoluciones</h2><p>Describe las condiciones bajo las cuales se aceptan devoluciones y reembolsos.</p>',
        'Pol\u00EDtica de Devoluciones \u2013 ELISE SYSTEM',
        'Conoce la pol\u00EDtica de devoluciones y reembolsos de ELISE SYSTEM.',
      ],
    ];
    const seedPages = db.transaction(() => {
      for (const [title, slug, content, meta_title, meta_description] of defaultPages) {
        insertPage.run(title, slug, content, meta_title, meta_description, now, now);
      }
    });
    seedPages();
  }
}
