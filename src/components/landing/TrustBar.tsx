const trustItems = [
  {
    icon: "storefront",
    label: "Tiendas",
  },
  {
    icon: "medication",
    label: "Farmacias",
  },
  {
    icon: "local_grocery_store",
    label: "Supermercados",
  },
  {
    icon: "hardware",
    label: "Ferreterías",
  },
  {
    icon: "shield",
    label: "Sistema seguro",
  },
];

export default function TrustBar() {
  return (
    <section className="w-full bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-16">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
            >
              <span
                className="material-symbols-outlined text-[22px] filled"
                style={{ color: "var(--primary)" }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
