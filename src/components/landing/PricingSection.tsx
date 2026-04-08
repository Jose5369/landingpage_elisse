"use client";

import { useEffect, useState, useCallback } from "react";

interface ApiPlan {
  id: number;
  nombre: string;
  descripcion: string;
  monto: number;
  periodo: string;
  destacado: number;
  max_usuarios: number;
  max_clientes: number;
  max_facturas: number;
  max_facturas_electronicas: number;
  max_productos: number;
  soporte_email: number;
  soporte_chat: number;
  soporte_telefono: number;
  reportes_avanzados: number;
  multi_sucursal: number;
  control_inventario: number;
}

interface DisplayPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  periodo: string;
  isRecommended: boolean;
  features: string[];
}

function buildFeatures(plan: ApiPlan): string[] {
  const features: string[] = [];
  features.push(`Hasta ${plan.max_usuarios} usuarios`);
  features.push(`Hasta ${plan.max_productos.toLocaleString("es-DO")} productos`);
  features.push(`Hasta ${plan.max_facturas.toLocaleString("es-DO")} facturas`);
  if (plan.max_facturas_electronicas > 0)
    features.push(`${plan.max_facturas_electronicas} facturas electrónicas`);
  if (plan.control_inventario) features.push("Control de inventario");
  if (plan.multi_sucursal) features.push("Multi-sucursal");
  if (plan.reportes_avanzados) features.push("Reportes avanzados");
  if (plan.soporte_telefono) features.push("Soporte telefónico");
  else if (plan.soporte_chat) features.push("Soporte por chat");
  else if (plan.soporte_email) features.push("Soporte por email");
  return features;
}

function mapPlan(plan: ApiPlan): DisplayPlan {
  return {
    id: plan.id,
    name: plan.nombre.replace("Plan ", ""),
    description: plan.descripcion,
    price: plan.monto,
    periodo: plan.periodo,
    isRecommended: plan.destacado === 1,
    features: buildFeatures(plan),
  };
}

function PlanCard({ plan, systemUrl }: { plan: DisplayPlan; systemUrl: string }) {
  const rec = plan.isRecommended;
  const price = plan.price.toLocaleString("es-DO", { minimumFractionDigits: 2 });
  const ciclo = plan.periodo === "anual" ? "año" : "mes";
  const registroUrl = `${systemUrl}/registration?plan=${plan.id}`;

  return (
    <div
      className={`relative flex flex-col rounded-3xl p-10 transition-all duration-300 ${
        rec
          ? "bg-slate-900 text-white border-2 border-[#007fff] shadow-2xl"
          : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
      }`}
    >
      {rec && (
        <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#007fff] text-white px-4 py-1 rounded-full text-xs font-bold uppercase">
          Recomendado
        </div>
      )}

      <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
      <p className={`text-sm mb-6 ${rec ? "text-slate-400" : "text-slate-500"}`}>
        {plan.description}
      </p>

      <div className="mb-8">
        <span className="text-4xl font-black">USD ${price}</span>
        <span className={`${rec ? "text-slate-400" : "text-slate-500"}`}>
          /{ciclo}
        </span>
      </div>

      <ul className="space-y-4 mb-10 flex-grow">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span
              className="material-symbols-outlined text-sm"
              style={{ color: rec ? "#007fff" : "#22c55e" }}
            >
              check_circle
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <a
        href={registroUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-4 rounded-xl font-bold transition-all text-center block ${
          rec
            ? "bg-[#007fff] text-white hover:brightness-110 shadow-lg shadow-[#007fff]/30"
            : "border-2 border-[#007fff] text-[#007fff] hover:bg-[#007fff]/5"
        }`}
      >
        <span className="material-symbols-outlined text-sm align-middle mr-1">rocket_launch</span>
        Probar 15 días gratis
      </a>
    </div>
  );
}

const POLL_INTERVAL = 30000; // 30 segundos

export default function PricingSection() {
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [systemUrl, setSystemUrl] = useState("http://localhost:8080");
  const [loading, setLoading] = useState(true);
  const [showAnual, setShowAnual] = useState(false);

  const fetchPlans = useCallback(() => {
    fetch("/api/plans", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPlans(json.data.map(mapPlan));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Obtener la URL del sistema (endpoint público, sin auth)
    fetch("/api/settings")
      .then((res) => res.json())
      .then((json) => {
        if (json.system_url) setSystemUrl(json.system_url);
      })
      .catch(() => {});

    // Fetch inicial
    fetchPlans();

    // Polling cada 30 segundos para actualización en tiempo real
    const interval = setInterval(fetchPlans, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPlans]);

  const filteredPlans = plans.filter(
    (p) => p.periodo === (showAnual ? "anual" : "mensual")
  );

  return (
    <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h3 className="text-4xl font-black mb-4 text-slate-900 dark:text-white">
          Planes que crecen contigo
        </h3>
        <p className="text-slate-500 mb-8">
          Elige la opción que mejor se adapte a tu etapa actual. Todos incluyen{" "}
          <span className="font-bold text-[#007fff]">15 días de prueba gratis</span>.
        </p>

        {/* Toggle mensual/anual */}
        {plans.some((p) => p.periodo === "anual") && (
          <div className="inline-flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => setShowAnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                !showAnual
                  ? "bg-[#007fff] text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setShowAnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                showAnual
                  ? "bg-[#007fff] text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Anual
              <span className="ml-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                Ahorra
              </span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPlans.length > 0 ? (
        <div
          className={`grid gap-8 ${
            filteredPlans.length <= 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {filteredPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} systemUrl={systemUrl} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500">
          No hay planes disponibles para este periodo.
        </p>
      )}
    </section>
  );
}
