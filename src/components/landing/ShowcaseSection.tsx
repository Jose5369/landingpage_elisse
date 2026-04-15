'use client';

import { useRef } from 'react';
import { useSection } from '@/lib/useLandingContent';
import Editable from '@/components/editor/Editable';
import { useEditMode } from '@/lib/editMode';

interface Highlight {
  icon: string;
  title: string;
  description: string;
}

const DEFAULT_HIGHLIGHTS: Highlight[] = [
  {
    icon: 'dashboard',
    title: 'Dashboard en tiempo real',
    description:
      'Visualiza ventas, inventario y rendimiento de tu negocio con gráficas actualizadas al instante.',
  },
  {
    icon: 'qr_code_scanner',
    title: 'Escaneo rápido de productos',
    description:
      'Agrega productos a la venta con un escaneo de código de barras. Rápido, preciso y sin errores.',
  },
  {
    icon: 'cloud_sync',
    title: 'Sincronización en la nube',
    description:
      'Tus datos siempre respaldados y disponibles en todos tus dispositivos sin interrupciones.',
  },
];

function parseHighlights(extraJson: string | null | undefined): Highlight[] {
  if (!extraJson) return DEFAULT_HIGHLIGHTS;
  try {
    const parsed = JSON.parse(extraJson);
    if (Array.isArray(parsed?.highlights)) return parsed.highlights;
  } catch {
    // fall through
  }
  return DEFAULT_HIGHLIGHTS;
}

export default function ShowcaseSection() {
  const section = useSection('showcase');
  const { isAdmin, isEditMode, recordChange, pendingChanges } = useEditMode();
  const title = section?.title || 'Tu negocio siempre bajo control';
  const subtitle =
    section?.subtitle ||
    'Un dashboard completo que te da visibilidad total de tu operación, desde el punto de venta hasta los reportes ejecutivos.';

  // Pending edit overrides stored value
  const pendingExtra = pendingChanges.find(
    (c) => c.resource === 'section' && c.key === 'showcase' && c.field === 'extra_json'
  )?.value;
  const highlights = parseHighlights(pendingExtra ?? section?.extra_json);

  const editable = isAdmin && isEditMode;
  const highlightRefs = useRef<Array<{ title: HTMLElement | null; description: HTMLElement | null }>>([]);

  function handleHighlightBlur() {
    const updated = highlights.map((h, i) => ({
      icon: h.icon,
      title: highlightRefs.current[i]?.title?.innerText.trim() || h.title,
      description: highlightRefs.current[i]?.description?.innerText.trim() || h.description,
    }));
    const newExtra = JSON.stringify({ highlights: updated });
    if (newExtra !== (section?.extra_json ?? JSON.stringify({ highlights: DEFAULT_HIGHLIGHTS }))) {
      recordChange({
        resource: 'section',
        key: 'showcase',
        field: 'extra_json',
        value: newExtra,
      });
    }
  }

  function setRef(idx: number, kind: 'title' | 'description', el: HTMLElement | null) {
    if (!highlightRefs.current[idx]) {
      highlightRefs.current[idx] = { title: null, description: null };
    }
    highlightRefs.current[idx][kind] = el;
  }

  return (
    <section
      id="showcase"
      className="py-20 md:py-28 bg-gray-900 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: simulated dashboard */}
          <div className="relative order-2 lg:order-1">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    E
                  </div>
                  <span className="text-xs font-semibold text-white">
                    ELISE SYSTEM
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px] text-gray-400">
                    notifications
                  </span>
                  <div className="w-5 h-5 rounded-full bg-gray-600" />
                </div>
              </div>

              <div className="flex h-[calc(100%-44px)]">
                {/* Sidebar */}
                <div className="w-12 bg-gray-900 flex flex-col items-center py-3 gap-4 border-r border-gray-700">
                  {["dashboard", "inventory_2", "receipt_long", "group", "bar_chart"].map(
                    (icon, i) => (
                      <span
                        key={icon}
                        className="material-symbols-outlined text-[16px]"
                        style={{
                          color: i === 0 ? "var(--primary)" : "#6b7280",
                        }}
                      >
                        {icon}
                      </span>
                    )
                  )}
                </div>

                {/* Main content */}
                <div className="flex-1 p-3 flex flex-col gap-2 overflow-hidden">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Ventas", value: "RD$ 128K", icon: "trending_up", color: "#22c55e" },
                      { label: "Clientes", value: "2,847", icon: "group", color: "var(--primary)" },
                      { label: "Productos", value: "1,240", icon: "inventory_2", color: "#f59e0b" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-gray-900 rounded-lg p-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] text-gray-400">{stat.label}</span>
                          <span
                            className="material-symbols-outlined text-[10px] filled"
                            style={{ color: stat.color }}
                          >
                            {stat.icon}
                          </span>
                        </div>
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: stat.color }}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="flex-1 bg-gray-900 rounded-lg p-2 flex flex-col gap-1">
                    <span className="text-[9px] text-gray-400 font-medium">
                      Ventas por mes
                    </span>
                    <div className="flex-1 flex items-end gap-0.5">
                      {[30, 55, 40, 75, 50, 85, 65, 90, 70, 95, 80, 100].map(
                        (h, i) => (
                          <div key={i} className="flex-1 flex items-end">
                            <div
                              className="w-full rounded-sm"
                              style={{
                                height: `${h}%`,
                                backgroundColor:
                                  i === 11 ? "var(--primary)" : "#374151",
                                opacity: i === 11 ? 1 : 0.7,
                              }}
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Bottom table stub */}
                  <div className="bg-gray-900 rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] text-gray-400">
                        Últimas ventas
                      </span>
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: "var(--primary)" }}
                      >
                        Ver todas
                      </span>
                    </div>
                    {[
                      { name: "Producto A", amount: "RD$ 1,200", status: "Pagado" },
                      { name: "Producto B", amount: "RD$ 850", status: "Pendiente" },
                    ].map((row) => (
                      <div
                        key={row.name}
                        className="flex justify-between items-center py-0.5 border-t border-gray-800"
                      >
                        <span className="text-[9px] text-gray-300">
                          {row.name}
                        </span>
                        <span className="text-[9px] font-medium text-gray-300">
                          {row.amount}
                        </span>
                        <span
                          className="text-[8px] px-1 rounded"
                          style={{
                            backgroundColor:
                              row.status === "Pagado" ? "#14532d" : "#422006",
                            color:
                              row.status === "Pagado" ? "#86efac" : "#fcd34d",
                          }}
                        >
                          {row.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: highlights */}
          <div className="order-1 lg:order-2 flex flex-col gap-6">
            <div>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
                style={{ backgroundColor: "var(--primary)" }}
              >
                <span className="material-symbols-outlined text-[14px]">
                  visibility
                </span>
                <Editable
                  as="span"
                  resource="section"
                  resourceKey="showcase"
                  field="badge"
                  value={section?.badge || 'Potente y visual'}
                />
              </div>
              <Editable
                as="h2"
                resource="section"
                resourceKey="showcase"
                field="title"
                value={title}
                className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight block"
              />
              <Editable
                as="p"
                resource="section"
                resourceKey="showcase"
                field="subtitle"
                value={subtitle}
                className="mt-4 text-lg text-gray-300 leading-relaxed block"
              />
            </div>

            <div className="flex flex-col gap-4">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "rgba(0, 127, 255, 0.15)" }}
                  >
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: "var(--primary)" }}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <div>
                    <h3
                      ref={(el) => setRef(idx, 'title', el)}
                      contentEditable={editable}
                      suppressContentEditableWarning
                      onBlur={handleHighlightBlur}
                      className={`text-sm font-semibold text-white mb-1 outline-none ${editable ? 'ring-1 ring-blue-400/60 rounded px-0.5 cursor-text' : ''}`}
                    >
                      {item.title}
                    </h3>
                    <p
                      ref={(el) => setRef(idx, 'description', el)}
                      contentEditable={editable}
                      suppressContentEditableWarning
                      onBlur={handleHighlightBlur}
                      className={`text-sm text-gray-400 leading-relaxed outline-none ${editable ? 'ring-1 ring-blue-400/60 rounded px-0.5 cursor-text' : ''}`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
