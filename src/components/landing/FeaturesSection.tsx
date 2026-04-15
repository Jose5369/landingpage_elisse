'use client';

import { useLandingContent } from '@/lib/useLandingContent';

const DEFAULT_FEATURES = [
  { id: 1, icon: 'bolt', title: 'Ventas Rápidas', description: 'Procesa ventas en segundos con nuestra interfaz intuitiva.' },
  { id: 2, icon: 'inventory_2', title: 'Control de Inventario', description: 'Gestiona tu stock en tiempo real con alertas de bajo inventario.' },
  { id: 3, icon: 'category', title: 'Gestión de Productos', description: 'Organiza tu catálogo con categorías, variantes y códigos de barra.' },
  { id: 4, icon: 'group', title: 'Gestión de Clientes', description: 'Registra y fideliza clientes con historial de compras y promociones.' },
];

export default function FeaturesSection() {
  const content = useLandingContent();
  const section = content?.sections?.features;
  const features = content?.features && content.features.length > 0 ? content.features : DEFAULT_FEATURES;

  const title = section?.title || 'Todo lo que necesitas para crecer';
  const subtitle =
    section?.subtitle ||
    'ELISE SYSTEM integra todas las herramientas que tu negocio necesita en una plataforma poderosa y fácil de usar.';

  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <span className="material-symbols-outlined text-[14px]">star</span>
            Características principales
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: '#eff6ff' }}
              >
                <span
                  className="material-symbols-outlined text-[22px] filled"
                  style={{ color: 'var(--primary)' }}
                >
                  {feature.icon || 'bolt'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
