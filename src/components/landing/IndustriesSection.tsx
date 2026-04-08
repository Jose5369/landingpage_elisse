const industries = [
  {
    icon: "shopping_cart",
    title: "Tiendas al detalle",
    description:
      "Desde boutiques hasta tiendas de ropa y calzado. Gestión de variantes, tallas y colores con facilidad.",
    color: "#eff6ff",
    iconColor: "var(--primary)",
  },
  {
    icon: "store",
    title: "Supermercados",
    description:
      "Control de miles de productos, vencimientos, lotes y múltiples cajas registradoras sincronizadas.",
    color: "#f0fdf4",
    iconColor: "#16a34a",
  },
  {
    icon: "medication",
    title: "Farmacias",
    description:
      "Gestión de medicamentos con alertas de caducidad, control de lotes y registro de ventas controladas.",
    color: "#fdf4ff",
    iconColor: "#a855f7",
  },
  {
    icon: "hardware",
    title: "Ferreterías",
    description:
      "Catálogo extenso de materiales, unidades de medida, precios por volumen y crédito a contratistas.",
    color: "#fff7ed",
    iconColor: "#f59e0b",
  },
  {
    icon: "styler",
    title: "Salones & Spas",
    description:
      "Gestión de servicios, citas, paquetes y productos cosméticos en un sistema integrado y sencillo.",
    color: "#fef2f2",
    iconColor: "#ef4444",
  },
];

export default function IndustriesSection() {
  return (
    <section
      id="industries"
      className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <span className="material-symbols-outlined text-[14px]">
              domain
            </span>
            Sectores que usamos
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Diseñado para{" "}
            <span style={{ color: "var(--primary)" }}>tu industria</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ELISE SYSTEM se adapta a las necesidades específicas de cada tipo de
            negocio con configuraciones y módulos especializados.
          </p>
        </div>

        {/* Industries grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {industries.map((industry) => (
            <div
              key={industry.title}
              className="group flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ backgroundColor: industry.color }}
              >
                <span
                  className="material-symbols-outlined text-[26px] filled"
                  style={{ color: industry.iconColor }}
                >
                  {industry.icon}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {industry.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                {industry.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
