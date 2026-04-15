'use client';

import { useLandingContent } from '@/lib/useLandingContent';

const DEFAULT_INDUSTRIES = [
  { id: 1, icon: 'shopping_cart', name: 'Tiendas al detalle' },
  { id: 2, icon: 'store', name: 'Supermercados' },
  { id: 3, icon: 'medication', name: 'Farmacias' },
  { id: 4, icon: 'hardware', name: 'Ferreterías' },
  { id: 5, icon: 'restaurant', name: 'Restaurantes' },
];

const ACCENT_COLORS = [
  { bg: '#eff6ff', icon: 'var(--primary)' },
  { bg: '#f0fdf4', icon: '#16a34a' },
  { bg: '#fdf4ff', icon: '#a855f7' },
  { bg: '#fff7ed', icon: '#f59e0b' },
  { bg: '#fef2f2', icon: '#ef4444' },
  { bg: '#ecfeff', icon: '#06b6d4' },
];

export default function IndustriesSection() {
  const content = useLandingContent();
  const section = content?.sections?.industries;
  const industries = content?.industries && content.industries.length > 0 ? content.industries : DEFAULT_INDUSTRIES;

  const title = section?.title || 'Diseñado para tu industria';
  const subtitle =
    section?.subtitle ||
    'ELISE SYSTEM se adapta a las necesidades específicas de cada tipo de negocio con configuraciones y módulos especializados.';

  return (
    <section id="industries" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="material-symbols-outlined text-[14px]">domain</span>
            Sectores que atendemos
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {industries.map((industry, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div
                key={industry.id}
                className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: accent.bg }}
                >
                  <span
                    className="material-symbols-outlined text-[28px] filled"
                    style={{ color: accent.icon }}
                  >
                    {industry.icon || 'storefront'}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {industry.name}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
