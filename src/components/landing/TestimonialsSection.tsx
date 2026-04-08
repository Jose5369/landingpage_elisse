const testimonials = [
  {
    name: "María García",
    role: "Propietaria",
    business: "Boutique Eleganza",
    avatar: "MG",
    avatarColor: "#eff6ff",
    avatarTextColor: "var(--primary)",
    rating: 5,
    text: "ELISE SYSTEM transformó completamente mi boutique. Antes perdía horas cuadrando inventario, ahora lo hago en minutos. Las ventas aumentaron un 30% en tres meses.",
  },
  {
    name: "Roberto Martínez",
    role: "Gerente General",
    business: "Supermercado La Familia",
    avatar: "RM",
    avatarColor: "#f0fdf4",
    avatarTextColor: "#16a34a",
    rating: 5,
    text: "Con tres sucursales era imposible tener control total. ELISE SYSTEM nos dio visibilidad completa en tiempo real. El soporte técnico es excepcional, siempre disponibles.",
  },
  {
    name: "Ana Rodríguez",
    role: "Administradora",
    business: "Farmacia San José",
    avatar: "AR",
    avatarColor: "#fdf4ff",
    avatarTextColor: "#a855f7",
    rating: 5,
    text: "La gestión de medicamentos con alertas de vencimiento es una maravilla. Nunca más vendemos productos expirados. La facturación electrónica funciona perfectamente.",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-[16px] filled"
          style={{ color: i < rating ? "#f59e0b" : "#d1d5db" }}
        >
          star
        </span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
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
              format_quote
            </span>
            Testimonios
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Lo que dicen nuestros{" "}
            <span style={{ color: "var(--primary)" }}>clientes</span>
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Cientos de negocios en la República Dominicana ya confían en ELISE
            SYSTEM para gestionar su operación diaria.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm card-hover"
            >
              {/* Rating */}
              <StarRating rating={t.rating} />

              {/* Quote */}
              <blockquote className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                &ldquo;{t.text}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    backgroundColor: t.avatarColor,
                    color: t.avatarTextColor,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.role} · {t.business}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
