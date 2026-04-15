'use client';

import { useLandingContent } from '@/lib/useLandingContent';
import Editable from '@/components/editor/Editable';

const DEFAULT_BENEFITS = [
  { id: 1, icon: 'psychology', title: 'Fácil de usar', description: 'Interfaz intuitiva diseñada para que cualquier empleado la maneje desde el primer día.' },
  { id: 2, icon: 'error', title: 'Reduce errores', description: 'Automatiza cálculos, validaciones y registros para eliminar errores humanos.' },
  { id: 3, icon: 'update', title: 'Actualizaciones', description: 'Mejoras y nuevas funcionalidades publicadas regularmente sin costo adicional.' },
];

// Rotating accent colors for cards (applied by index)
const ACCENT_COLORS = [
  { bg: '#eff6ff', icon: 'var(--primary)' },
  { bg: '#fef2f2', icon: '#ef4444' },
  { bg: '#f0fdf4', icon: '#22c55e' },
  { bg: '#fff7ed', icon: '#f59e0b' },
  { bg: '#fdf4ff', icon: '#a855f7' },
  { bg: '#ecfeff', icon: '#06b6d4' },
];

export default function BenefitsSection() {
  const content = useLandingContent();
  const section = content?.sections?.benefits;
  const benefits = content?.benefits && content.benefits.length > 0 ? content.benefits : DEFAULT_BENEFITS;

  const title = section?.title || 'Beneficios que marcan la diferencia';
  const subtitle =
    section?.subtitle ||
    'ELISE SYSTEM está diseñado pensando en las necesidades reales de los negocios, con funciones que realmente importan.';

  return (
    <section id="benefits" className="py-20 md:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="material-symbols-outlined text-[14px]">thumb_up</span>
            <Editable
              as="span"
              resource="section"
              resourceKey="benefits"
              field="badge"
              value={section?.badge || 'Por qué elegirnos'}
            />
          </div>
          <Editable
            as="h2"
            resource="section"
            resourceKey="benefits"
            field="title"
            value={title}
            className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight block"
          />
          <Editable
            as="p"
            resource="section"
            resourceKey="benefits"
            field="subtitle"
            value={subtitle}
            className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto block"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => {
            const accent = ACCENT_COLORS[i % ACCENT_COLORS.length];
            return (
              <div
                key={benefit.id}
                className="group flex gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 card-hover"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: accent.bg }}
                >
                  <span
                    className="material-symbols-outlined text-[22px] filled"
                    style={{ color: accent.icon }}
                  >
                    {benefit.icon || 'check_circle'}
                  </span>
                </div>
                <div>
                  <Editable
                    as="h3"
                    resource="benefit"
                    resourceKey={String(benefit.id)}
                    field="title"
                    value={benefit.title}
                    className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 block"
                  />
                  <Editable
                    as="p"
                    resource="benefit"
                    resourceKey={String(benefit.id)}
                    field="description"
                    value={benefit.description}
                    className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed block"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
