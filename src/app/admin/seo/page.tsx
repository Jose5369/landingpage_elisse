'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPut } from '@/lib/adminApi';
import { Save, Loader2, Globe } from 'lucide-react';

interface SettingsResponse {
  grouped: Record<string, Record<string, string>>;
}

interface SeoForm {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image_url: string;
  favicon_url: string;
}

const defaults: SeoForm = {
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  og_image_url: '',
  favicon_url: '',
};

export default function SeoPage() {
  const [form, setForm] = useState<SeoForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminGet<SettingsResponse>('/settings')
      .then((data) => {
        const s = data.grouped.seo ?? {};
        setForm({
          meta_title: s.meta_title ?? '',
          meta_description: s.meta_description ?? '',
          meta_keywords: s.meta_keywords ?? '',
          og_image_url: s.og_image_url ?? '',
          favicon_url: s.favicon_url ?? '',
        });
      })
      .catch(() => toast.error('Error al cargar ajustes SEO'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPut('/settings', form);
      toast.success('SEO guardado correctamente');
    } catch {
      toast.error('Error al guardar SEO');
    } finally {
      setSaving(false);
    }
  }

  function set(key: keyof SeoForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Google preview helpers
  const previewTitle = form.meta_title || 'Título del sitio';
  const previewDesc = form.meta_description || 'Descripción del sitio web que aparecerá en los resultados de búsqueda de Google.';
  const previewUrl = 'https://tudominio.com';

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
        <h2 className="text-xl font-bold text-slate-900">SEO</h2>
        <p className="text-sm text-slate-500 mt-1">Metadatos para motores de búsqueda y redes sociales</p>
      </div>

      {/* Google preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Globe size={16} />
          Vista previa en Google
        </div>
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 font-sans">
          <div className="text-xs text-slate-500 mb-1">{previewUrl}</div>
          <div className="text-blue-700 text-lg font-medium leading-tight mb-1 truncate">
            {previewTitle}
          </div>
          <div className="text-slate-600 text-sm leading-relaxed line-clamp-2">
            {previewDesc}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {/* meta_title */}
        <div className="px-6 py-5 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Meta Title
            <span className="ml-2 text-xs font-normal text-slate-400">({previewTitle.length}/60)</span>
          </label>
          <input
            type="text"
            value={form.meta_title}
            onChange={(e) => set('meta_title', e.target.value)}
            maxLength={60}
            placeholder="Mi Empresa - Solución para tu negocio"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-400">Recomendado: 50-60 caracteres</p>
        </div>

        {/* meta_description */}
        <div className="px-6 py-5 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Meta Description
            <span className="ml-2 text-xs font-normal text-slate-400">({previewDesc.length}/160)</span>
          </label>
          <textarea
            value={form.meta_description}
            onChange={(e) => set('meta_description', e.target.value)}
            maxLength={160}
            rows={3}
            placeholder="Descripción del sitio para motores de búsqueda…"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-400">Recomendado: 120-160 caracteres</p>
        </div>

        {/* meta_keywords */}
        <div className="px-6 py-5 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Meta Keywords</label>
          <input
            type="text"
            value={form.meta_keywords}
            onChange={(e) => set('meta_keywords', e.target.value)}
            placeholder="pos, ventas, inventario, sistema"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-400">Separadas por comas</p>
        </div>

        {/* og_image_url */}
        <div className="px-6 py-5 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">OG Image URL</label>
          <input
            type="url"
            value={form.og_image_url}
            onChange={(e) => set('og_image_url', e.target.value)}
            placeholder="https://tudominio.com/og-image.png"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-400">Imagen para redes sociales (1200×630 px recomendado)</p>
        </div>

        {/* favicon_url */}
        <div className="px-6 py-5 space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Favicon URL</label>
          <input
            type="url"
            value={form.favicon_url}
            onChange={(e) => set('favicon_url', e.target.value)}
            placeholder="https://tudominio.com/favicon.ico"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <p className="text-xs text-slate-400">Ícono que aparece en la pestaña del navegador</p>
        </div>

        {/* Save */}
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
