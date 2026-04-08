const benefits = [
  {
    icon: "psychology",
    title: "Fácil de usar",
    description:
      "Interfaz intuitiva diseñada para que cualquier empleado la maneje desde el primer día, sin necesidad de capacitación extensa.",
    color: "#eff6ff",
    iconColor: "var(--primary)",
  },
  {
    icon: "error",
    title: "Reduce errores",
    description:
      "Automatiza cálculos, validaciones y registros para eliminar errores humanos en ventas, inventario y facturación.",
    color: "#fef2f2",
    iconColor: "#ef4444",
  },
  {
    icon: "update",
    title: "Actualizaciones constantes",
    description:
      "Mejoras y nuevas funcionalidades publicadas regularmente sin costo adicional ni interrupciones en tu operación.",
    color: "#f0fdf4",
    iconColor: "#22c55e",
  },
  {
    icon: "directions_run",
    title: "Alta velocidad",
    description:
      "Tiempo de respuesta inferior a 1 segundo en todas las operaciones para que tu equipo nunca espere.",
    color: "#fff7ed",
    iconColor: "#f59e0b",
  },
  {
    icon: "settings_remote",
    title: "Acceso remoto",
    description:
      "Gestiona y supervisa tu negocio desde cualquier lugar con acceso seguro a través de cualquier dispositivo.",
    color: "#fdf4ff",
    iconColor: "#a855f7",
  },
  {
    icon: "support_agent",
    title: "Soporte dedicado",
    description:
      "Equipo de soporte especializado disponible para resolver cualquier duda o problema en el menor tiempo posible.",
    color: "#f0fdf4",
    iconColor: "#16a34a",
  },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="py-20 md:py-28 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white mb-4"
            style={{ backgroundColor: "var(--primary)" }}
          >
            <span className="material-symbols-outlined text-[14px]">
              thumb_up
            </span>
            Por qué elegirnos
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Beneficios que marcan la{" "}
            <span style={{ color: "var(--primary)" }}>diferencia</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            ELISE SYSTEM está diseñado pensando en las necesidades reales de los
            negocios latinoamericanos, con funciones que realmente importan.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="group flex gap-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 card-hover"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: benefit.color }}
              >
                <span
                  className="material-symbols-outlined text-[22px] filled"
                  style={{ color: benefit.iconColor }}
                >
                  {benefit.icon}
                </span>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
