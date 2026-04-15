'use client';

import { useSection } from '@/lib/useLandingContent';

const DEFAULT_TRUST_ITEMS = [
  { icon: 'storefront', label: 'Tiendas' },
  { icon: 'medication', label: 'Farmacias' },
  { icon: 'local_grocery_store', label: 'Supermercados' },
  { icon: 'hardware', label: 'Ferreterías' },
  { icon: 'shield', label: 'Sistema seguro' },
];

/**
 * Parses the `content` field of the trust_bar section for custom items.
 * Format: "icon:label|icon:label|..." (e.g. "storefront:Tiendas|shield:Seguro")
 */
function parseTrustItems(content: string | null): { icon: string; label: string }[] {
  if (!content) return DEFAULT_TRUST_ITEMS;
  const items = content
    .split('|')
    .map((part) => {
      const [icon, label] = part.split(':').map((s) => s.trim());
      if (!label) return null;
      return { icon: icon || 'check', label };
    })
    .filter((x): x is { icon: string; label: string } => x !== null);
  return items.length > 0 ? items : DEFAULT_TRUST_ITEMS;
}

export default function TrustBar() {
  const section = useSection('trust_bar');
  const items = parseTrustItems(section?.content ?? null);

  return (
    <section className="w-full bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section?.title && (
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            {section.title}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 lg:gap-16">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400"
            >
              <span
                className="material-symbols-outlined text-[22px] filled"
                style={{ color: 'var(--primary)' }}
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
