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

    CREATE TABLE IF NOT EXISTS admin_users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      name       TEXT,
      created_at TEXT NOT NULL
    );
  `);

  seedDefaultData(db);
}

function seedDefaultData(db: Database.Database): void {
  // Only seed if tables are empty
  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as { c: number }).c;
  if (settingsCount > 0) return;

  const now = new Date().toISOString();

  // ── Settings ──────────────────────────────────────────────────────────────
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value, category) VALUES (?, ?, ?)'
  );

  const settings: [string, string, string][] = [
    ['site_name',            'ELISE SYSTEM',                                    'general'],
    ['primary_color',        '#007fff',                                         'general'],
    ['font_family',          'Inter',                                           'general'],
    ['logo_icon',            'point_of_sale',                                   'general'],
    ['favicon_url',          '',                                                'general'],
    ['og_image_url',         '',                                                'general'],
    ['meta_title',           'ELISE SYSTEM – Sistema POS e Inventario',        'seo'],
    ['meta_description',     'La plataforma líder para gestión de ventas, inventario y facturación para pequeñas y medianas empresas.', 'seo'],
    ['meta_keywords',        'POS, inventario, facturación, ventas, PYME',     'seo'],
    ['announcement_text',    'Moderniza tu negocio con ELISE SYSTEM – ¡Prueba gratis 30 días!', 'announcement'],
    ['announcement_active',  '1',                                               'announcement'],
    ['whatsapp_number',      '',                                                'contact'],
    ['whatsapp_active',      '1',                                               'contact'],
    ['footer_description',   'La plataforma líder para gestión de ventas, inventario y facturación para pequeñas y medianas empresas.',  'footer'],
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
      ['point_of_sale', 'POS Rápido', 'Procesa ventas en segundos con interfaz intuitiva, múltiples métodos de pago y cierre de caja automatizado.', 1],
      ['inventory_2',   'Inventario en Tiempo Real', 'Control total de stock, alertas de mínimos, movimientos y ajustes de inventario al instante.', 2],
      ['category',      'Gestión de Productos', 'Crea catálogos ilimitados con variantes, precios por lista, imágenes y códigos de barras.', 3],
      ['people',        'Clientes y CxC', 'Administra tu cartera de clientes, créditos, estado de cuenta y cobranzas en un solo lugar.', 4],
      ['local_shipping','Compras y Proveedores', 'Gestiona órdenes de compra, recepciones, cuentas por pagar y relación con proveedores.', 5],
      ['bar_chart',     'Reportes y Analítica', 'Dashboard en tiempo real con ventas, utilidades, productos más vendidos y desempeño por vendedor.', 6],
      ['receipt_long',  'Facturación Electrónica', 'Emite facturas, notas de crédito y débito con cumplimiento fiscal, envío por correo y almacenamiento en la nube.', 7],
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
      ['bolt',          'Implementación Inmediata', 'Comienza a vender el mismo día. Sin instalaciones complejas, sin necesidad de técnicos.', 1],
      ['cloud_sync',    'Siempre Actualizado',      'Actualizaciones automáticas sin costo adicional. Siempre tendrás la versión más reciente.', 2],
      ['lock',          'Seguridad Garantizada',    'Tus datos protegidos con cifrado de grado bancario y respaldos automáticos en la nube.', 3],
      ['support_agent', 'Soporte Experto',           'Equipo de soporte disponible para ayudarte a sacar el máximo provecho del sistema.', 4],
      ['devices',       'Multiplataforma',           'Accede desde cualquier dispositivo: computador, tablet o celular, sin apps adicionales.', 5],
      ['trending_up',   'Escala con Tu Negocio',    'Desde emprendedores hasta empresas medianas, ELISE crece contigo sin cambiar de plataforma.', 6],
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
      ['storefront',       'Tiendas y Retail',         1],
      ['restaurant',       'Restaurantes y Cafeterías', 2],
      ['medical_services', 'Salud y Farmacias',         3],
      ['hardware',         'Ferreterías',               4],
      ['spa',              'Belleza y Estética',        5],
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
      ['hero',          'El Sistema POS que Impulsa tu Negocio', 'Todo lo que necesitas para gestionar ventas, inventario y clientes en una sola plataforma.', '', 1],
      ['trust_bar',     'Con la confianza de cientos de empresas', '', '', 2],
      ['showcase',      'Diseñado para la Velocidad y la Claridad', 'Cada pantalla pensada para que tú y tu equipo trabajen sin fricciones.', '', 3],
      ['whatsapp_cta',  '¿Tienes preguntas? Hablemos por WhatsApp', 'Nuestro equipo está listo para ayudarte a elegir el plan ideal para tu negocio.', '', 4],
      ['pricing',       'Planes y Precios', 'Elige el plan que mejor se adapta a tu negocio. Sin sorpresas, sin letra pequeña.', '', 5],
      ['testimonials',  'Lo que dicen nuestros clientes', 'Negocios como el tuyo ya están creciendo con ELISE SYSTEM.', '', 6],
      ['final_cta',     '¿Listo para transformar tu negocio?', 'Únete a cientos de empresas que ya confían en ELISE SYSTEM para gestionar sus operaciones.', '', 7],
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
        'Política de Privacidad',
        'politica-privacidad',
        '<h2>Política de Privacidad</h2><p>En ELISE SYSTEM nos comprometemos a proteger tu información personal. Este documento describe cómo recopilamos, usamos y protegemos tus datos.</p><p><em>Contenido pendiente de redacción.</em></p>',
        'Política de Privacidad – ELISE SYSTEM',
        'Conoce cómo ELISE SYSTEM protege y gestiona tu información personal.',
      ],
      [
        'Términos de Servicio',
        'terminos-servicio',
        '<h2>Términos de Servicio</h2><p>Al utilizar ELISE SYSTEM aceptas los presentes términos y condiciones. Por favor léelos detenidamente.</p><p><em>Contenido pendiente de redacción.</em></p>',
        'Términos de Servicio – ELISE SYSTEM',
        'Lee los términos y condiciones de uso de la plataforma ELISE SYSTEM.',
      ],
      [
        'Política de Devoluciones',
        'politica-devoluciones',
        '<h2>Política de Devoluciones</h2><p>Describe las condiciones bajo las cuales se aceptan devoluciones y reembolsos de suscripciones.</p><p><em>Contenido pendiente de redacción.</em></p>',
        'Política de Devoluciones – ELISE SYSTEM',
        'Conoce la política de devoluciones y reembolsos de ELISE SYSTEM.',
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
