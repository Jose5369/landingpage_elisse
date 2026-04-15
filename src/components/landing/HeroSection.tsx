'use client';

import { useRef } from 'react';
import { useSection } from '@/lib/useLandingContent';
import Editable from '@/components/editor/Editable';
import { useEditMode } from '@/lib/editMode';

const DEFAULT_TITLE = 'El sistema POS inteligente que transforma tu negocio';
const DEFAULT_SUBTITLE =
  'ELISE SYSTEM unifica ventas, inventario, facturación y reportes en una sola plataforma. Aumenta tus ingresos y reduce errores desde el primer día.';
const DEFAULT_CTAS = 'Probar 15 días gratis|Ver Precios';

/**
 * Renders the hero title allowing a single word to be highlighted by wrapping
 * it in double-asterisks, e.g. "El sistema POS **inteligente** que...".
 * If no markers are present, the full title is rendered as-is.
 */
function renderTitle(title: string) {
  const parts = title.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={{ color: 'var(--primary)' }}>
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function HeroSection() {
  const section = useSection('hero');
  const { isAdmin, isEditMode, recordChange, pendingChanges } = useEditMode();
  const primaryRef = useRef<HTMLSpanElement>(null);
  const secondaryRef = useRef<HTMLSpanElement>(null);

  const title = section?.title || DEFAULT_TITLE;
  const subtitle = section?.subtitle || DEFAULT_SUBTITLE;

  // Read content from pending change first, then from section, then fallback
  const pendingContent = pendingChanges.find(
    (c) => c.resource === 'section' && c.key === 'hero' && c.field === 'content'
  )?.value;
  const ctas = (pendingContent ?? section?.content ?? DEFAULT_CTAS).split('|').map((s) => s.trim());
  const ctaPrimary = ctas[0] || 'Probar gratis';
  const ctaSecondary = ctas[1] || 'Ver Precios';

  const editable = isAdmin && isEditMode;
  const editableCls = editable
    ? 'ring-1 ring-white/50 rounded outline-none cursor-text'
    : '';

  function handleCtaBlur() {
    const newPrimary = primaryRef.current?.innerText.trim() || ctaPrimary;
    const newSecondary = secondaryRef.current?.innerText.trim() || ctaSecondary;
    const newContent = `${newPrimary}|${newSecondary}`;
    if (newContent !== (section?.content ?? DEFAULT_CTAS)) {
      recordChange({
        resource: 'section',
        key: 'hero',
        field: 'content',
        value: newContent,
      });
    }
  }

  return (
    <section className="relative overflow-hidden py-20 md:py-28 lg:py-32 gradient-hero dark:bg-gray-950">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column: text */}
          <div className="flex flex-col gap-6">
            <div
              className="inline-flex items-center gap-2 w-fit px-3 py-1.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <Editable
                as="span"
                resource="section"
                resourceKey="hero"
                field="badge"
                value={section?.badge || 'Tecnología de próxima generación'}
              />
            </div>

            <Editable
              as="h1"
              resource="section"
              resourceKey="hero"
              field="title"
              value={title}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight block"
            />

            <Editable
              as="p"
              resource="section"
              resourceKey="hero"
              field="subtitle"
              value={subtitle}
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl"
            />

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={editable ? undefined : '#pricing'}
                onClick={(e) => editable && e.preventDefault()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                <span
                  ref={primaryRef}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={handleCtaBlur}
                  className={editableCls}
                >
                  {ctaPrimary}
                </span>
              </a>
              <a
                href={editable ? undefined : '#pricing'}
                onClick={(e) => editable && e.preventDefault()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5"
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: 'var(--primary)' }}
                >
                  sell
                </span>
                <span
                  ref={secondaryRef}
                  contentEditable={editable}
                  suppressContentEditableWarning
                  onBlur={handleCtaBlur}
                  className={editable ? 'ring-1 ring-blue-400 rounded outline-none cursor-text' : ''}
                >
                  {ctaSecondary}
                </span>
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {['Sin tarjeta de crédito', 'Soporte 24/7', 'Configura en minutos'].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                >
                  <span
                    className="material-symbols-outlined text-[16px] filled"
                    style={{ color: '#22c55e' }}
                  >
                    verified
                  </span>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Right column: dashboard mockup */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-lg animate-float">
              <div className="w-full aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700">
                <div className="p-4 h-full flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div
                      className="text-xs font-bold text-white px-2 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      ELISE POS
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 flex-shrink-0">
                    {[
                      { label: 'Ventas', value: 'RD$ 45K', color: '#22c55e' },
                      { label: 'Órdenes', value: '128', color: 'var(--primary)' },
                      { label: 'Productos', value: '1,240', color: '#f59e0b' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-gray-800 rounded-lg p-2 flex flex-col gap-0.5"
                      >
                        <span className="text-[10px] text-gray-400">{stat.label}</span>
                        <span className="text-sm font-bold" style={{ color: stat.color }}>
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex-1 bg-gray-800 rounded-lg p-2 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="flex-1 flex items-end">
                        <div
                          className="w-full rounded-sm opacity-80"
                          style={{
                            height: `${h}%`,
                            backgroundColor: i === 10 ? 'var(--primary)' : '#374151',
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                    <div className="bg-gray-800 rounded-lg p-2 flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ color: 'var(--primary)' }}
                      >
                        inventory_2
                      </span>
                      <span className="text-[10px] text-gray-300">Inventario OK</span>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-2 flex items-center gap-1.5">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ color: '#22c55e' }}
                      >
                        cloud_done
                      </span>
                      <span className="text-[10px] text-gray-300">Sincronizado</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#dcfce7' }}
                >
                  <span
                    className="material-symbols-outlined text-[18px] filled"
                    style={{ color: '#16a34a' }}
                  >
                    trending_up
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Ventas Hoy</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">+RD$ 45,280.00</p>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#eff6ff' }}
                >
                  <span
                    className="material-symbols-outlined text-[18px] filled"
                    style={{ color: 'var(--primary)' }}
                  >
                    group
                  </span>
                </div>
                <div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Clientes activos</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">2,847</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
