'use client';

import { useSection } from '@/lib/useLandingContent';
import Editable from '@/components/editor/Editable';

export default function FinalCTA() {
  const section = useSection('final_cta');
  const title = section?.title || 'Empieza hoy y transforma tu negocio con ELISE SYSTEM';
  const subtitle =
    section?.subtitle ||
    'Únete a cientos de negocios que ya usan ELISE SYSTEM para crecer, vender más y gestionar mejor. Sin complicaciones, sin contratos largos.';
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#eff6ff" }}
        >
          <span
            className="material-symbols-outlined text-[30px] filled"
            style={{ color: "var(--primary)" }}
          >
            rocket_launch
          </span>
        </div>

        <Editable
          as="h2"
          resource="section"
          resourceKey="final_cta"
          field="title"
          value={title}
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight mb-5 block"
        />

        <Editable
          as="p"
          resource="section"
          resourceKey="final_cta"
          field="subtitle"
          value={subtitle}
          className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8 block"
        />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-10 max-w-xl mx-auto">
          {[
            { value: "500+", label: "Negocios activos" },
            { value: "99.9%", label: "Uptime garantizado" },
            { value: "24/7", label: "Soporte disponible" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl sm:text-3xl font-extrabold mb-1"
                style={{ color: "var(--primary)" }}
              >
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:opacity-90 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <span className="material-symbols-outlined text-[18px]">
              bolt
            </span>
            Ver planes y precios
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:-translate-y-0.5"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ color: "var(--primary)" }}
            >
              calendar_month
            </span>
            Agendar demostración
          </a>
        </div>

        <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
          Sin tarjeta de crédito requerida · Cancela cuando quieras · Soporte incluido
        </p>
      </div>
    </section>
  );
}
