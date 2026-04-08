'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPut } from '@/lib/adminApi';
import { Save, Loader2 } from 'lucide-react';

interface SettingsResponse {
  grouped: Record<string, Record<string, string>>;
}

interface GeneralSettings {
  site_name: string;
  primary_color: string;
  font_family: string;
  logo_icon: string;
  system_url: string;
}

const defaultSettings: GeneralSettings = {
  site_name: '',
  primary_color: '#007fff',
  font_family: 'Inter',
  logo_icon: '',
  system_url: '',
};

export default function SettingsPage() {
  const [form, setForm] = useState<GeneralSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGet<SettingsResponse>('/settings')
      .then((data) => {
        const g = data.grouped.general ?? {};
        setForm({
          site_name: g.site_name ?? '',
          primary_color: g.primary_color ?? '#007fff',
          font_family: g.font_family ?? 'Inter',
          logo_icon: g.logo_icon ?? '',
          system_url: g.system_url ?? '',
        });
      })
      .catch(() => toast.error('Error al cargar ajustes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPut('/settings', form);
      toast.success('Ajustes guardados correctamente');
    } catch {
      toast.error('Error al guardar ajustes');
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof GeneralSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Ajustes Generales</h2>
        <p className="text-sm text-slate-500 mt-1">Configuración principal del sitio</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {/* site_name */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Nombre del sitio</label>
            <p className="text-xs text-slate-400 mt-0.5">Título principal del negocio</p>
          </div>
          <input
            type="text"
            value={form.site_name}
            onChange={(e) => set('site_name', e.target.value)}
            placeholder="Mi Empresa"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* primary_color */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Color primario</label>
            <p className="text-xs text-slate-400 mt-0.5">Color principal de la marca</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => set('primary_color', e.target.value)}
              className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => set('primary_color', e.target.value)}
              placeholder="#007fff"
              className="w-36 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* font_family */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Fuente tipográfica</label>
            <p className="text-xs text-slate-400 mt-0.5">Familia de fuente principal</p>
          </div>
          <select
            value={form.font_family}
            onChange={(e) => set('font_family', e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Poppins">Poppins</option>
            <option value="Lato">Lato</option>
            <option value="Nunito">Nunito</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        {/* logo_icon */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Ícono del logo</label>
            <p className="text-xs text-slate-400 mt-0.5">Nombre de ícono o código</p>
          </div>
          <input
            type="text"
            value={form.logo_icon}
            onChange={(e) => set('logo_icon', e.target.value)}
            placeholder="store"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* system_url */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">URL del sistema</label>
            <p className="text-xs text-slate-400 mt-0.5">Link de acceso al sistema</p>
          </div>
          <input
            type="url"
            value={form.system_url}
            onChange={(e) => set('system_url', e.target.value)}
            placeholder="https://app.miempresa.com"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Save button */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
