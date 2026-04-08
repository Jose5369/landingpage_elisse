const features = [
  {
    icon: "bolt",
    title: "Ventas Rápidas",
    description:
      "Procesa ventas en segundos con nuestra interfaz intuitiva. Acepta múltiples métodos de pago y genera recibos al instante.",
  },
  {
    icon: "inventory_2",
    title: "Control de Inventario",
    description:
      "Gestiona tu stock en tiempo real. Recibe alertas de bajo inventario y genera órdenes de compra automáticamente.",
  },
  {
    icon: "category",
    title: "Gestión de Productos",
    description:
      "Organiza tu catálogo con categorías, variantes, códigos de barra y precios personalizados por cliente.",
  },
  {
    icon: "group",
    title: "Gestión de Clientes",
    description:
      "Registra y fideliza clientes con historial de compras, créditos, puntos y promociones personalizadas.",
  },
  {
    icon: "local_shipping",
    title: "Control de Proveedores",
    description:
      "Administra tus proveedores, órdenes de compra y pagos pendientes desde un solo panel.",
  },
  {
    icon: "bar_chart",
    title: "Reportes Avanzados",
    description:
      "Toma decisiones basadas en datos con reportes de ventas, rentabilidad, inventario y proyecciones.",
  },
  {
    icon: "receipt_long",
    title: "Facturación Electrónica",
    description:
      "Genera y envía comprobantes fiscales digitales (NCF) de forma automática según la normativa local.",
  },
  {
    icon: "business",
    title: "Multi-sucursal",
    description:
      "Controla todas tus sucursales desde un solo lugar con datos consolidados y permisos por usuario.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
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
              star
            </span>
            Características principales
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Todo lo que necesitas para{" "}
            <span style={{ color: "var(--primary)" }}>crecer</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ELISE SYSTEM integra todas las herramientas que tu negocio necesita
            en una plataforma poderosa y fácil de usar.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors"
                style={{ backgroundColor: "#eff6ff" }}
              >
                <span
                  className="material-symbols-outlined text-[22px] filled"
                  style={{ color: "var(--primary)" }}
                >
                  {feature.icon}
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
