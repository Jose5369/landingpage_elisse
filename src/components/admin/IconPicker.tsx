'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

const POPULAR_ICONS = [
  // POS / Commerce
  'point_of_sale', 'storefront', 'sell', 'shopping_cart', 'shopping_bag', 'receipt_long', 'receipt', 'local_offer', 'price_check', 'price_change',
  // Inventory
  'inventory_2', 'inventory', 'category', 'qr_code_scanner', 'barcode_reader', 'deployed_code', 'all_inbox',
  // People / Clients
  'people', 'group', 'person', 'account_circle', 'contacts', 'support_agent', 'person_add',
  // Reports / Analytics
  'bar_chart', 'insights', 'analytics', 'trending_up', 'monitoring', 'query_stats', 'pie_chart',
  // Business
  'business', 'business_center', 'apartment', 'domain', 'store', 'corporate_fare',
  // Shipping / Suppliers
  'local_shipping', 'local_mall', 'package_2', 'inventory', 'warehouse',
  // Finance
  'payments', 'credit_card', 'account_balance', 'savings', 'attach_money', 'paid',
  // Fiscal / Legal
  'gavel', 'verified', 'verified_user', 'fact_check', 'approval', 'task_alt',
  // Cloud / Tech
  'cloud', 'cloud_sync', 'cloud_done', 'bolt', 'flash_on', 'settings', 'hub', 'integration_instructions',
  // Security
  'lock', 'security', 'shield', 'encrypted', 'admin_panel_settings',
  // Support
  'headset_mic', 'help', 'chat', 'support', 'call', 'mail',
  // Misc
  'rocket_launch', 'star', 'favorite', 'check_circle', 'thumb_up', 'workspace_premium', 'diamond', 'auto_awesome',
];

interface Props {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

export default function IconPicker({ value, onChange, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? POPULAR_ICONS.filter((i) => i.includes(search.toLowerCase().replace(/\s/g, '_')))
    : POPULAR_ICONS;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:border-slate-400 transition bg-white"
      >
        {value ? (
          <>
            <span className="material-symbols-outlined text-[20px] text-slate-700">{value}</span>
            <span className="text-slate-700 text-xs font-mono">{value}</span>
          </>
        ) : (
          <span className="text-slate-400 text-xs">Seleccionar ícono…</span>
        )}
        <span className="material-symbols-outlined text-[16px] text-slate-400 ml-auto">expand_more</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-[320px] bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar ícono…"
                  className="w-full pl-8 pr-8 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  autoFocus
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto grid grid-cols-6 gap-1">
              {filtered.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => {
                    onChange(icon);
                    setOpen(false);
                    setSearch('');
                  }}
                  title={icon}
                  className={`aspect-square flex items-center justify-center rounded-lg hover:bg-slate-100 transition ${
                    value === icon ? 'bg-blue-50 ring-2 ring-blue-500' : ''
                  }`}
                >
                  <span className="material-symbols-outlined text-[22px] text-slate-700">{icon}</span>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-6 text-center text-xs text-slate-400 py-6">
                  Sin resultados
                </div>
              )}
            </div>
            <div className="p-2 border-t border-slate-100 bg-slate-50">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="O escribe el nombre del ícono…"
                className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
