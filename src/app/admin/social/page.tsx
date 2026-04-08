'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPut } from '@/lib/adminApi';
import { Save, Loader2, ToggleLeft, ToggleRight, Share2 } from 'lucide-react';

interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
  activo: number;
}

interface SocialResponse {
  social_links: SocialLink[];
}

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

const platformColors: Record<string, string> = {
  facebook: 'bg-blue-50 text-blue-700',
  instagram: 'bg-pink-50 text-pink-700',
  twitter: 'bg-slate-100 text-slate-700',
  linkedin: 'bg-blue-50 text-blue-800',
  youtube: 'bg-red-50 text-red-700',
  tiktok: 'bg-slate-100 text-slate-700',
  whatsapp: 'bg-emerald-50 text-emerald-700',
  telegram: 'bg-blue-50 text-blue-600',
};

export default function SocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    adminGet<SocialResponse>('/social')
      .then((data) => setLinks(data.social_links))
      .catch(() => toast.error('Error al cargar redes sociales'))
      .finally(() => setLoading(false));
  }, []);

  function updateLink(id: number, field: keyof SocialLink, value: string | number) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = await adminPut<SocialResponse>('/social', links);
      setLinks(data.social_links);
      setDirty(false);
      toast.success('Redes sociales guardadas');
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Redes Sociales</h2>
          <p className="text-sm text-slate-500 mt-1">Configura los enlaces de redes sociales del sitio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </div>

      {links.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-14 text-slate-400">
          <Share2 size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay redes sociales configuradas</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {links.map((link) => {
            const label = platformLabels[link.platform] ?? link.platform;
            const color = platformColors[link.platform] ?? 'bg-slate-100 text-slate-700';

            return (
              <div key={link.id} className={`flex items-center gap-4 px-5 py-4 ${!link.activo ? 'opacity-60' : ''}`}>
                {/* Platform badge */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <span className="text-xs font-bold uppercase">
                    {link.platform.slice(0, 2)}
                  </span>
                </div>

                {/* Platform name */}
                <div className="w-28 shrink-0">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>

                {/* URL input */}
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateLink(link.id, 'url', e.target.value)}
                  placeholder={`https://${link.platform}.com/tu-perfil`}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono min-w-0"
                />

                {/* Toggle */}
                <button
                  onClick={() => updateLink(link.id, 'activo', link.activo ? 0 : 1)}
                  title={link.activo ? 'Desactivar' : 'Activar'}
                  className={`transition shrink-0 ${link.activo ? 'text-emerald-500' : 'text-slate-300'}`}
                >
                  {link.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {dirty && (
        <p className="text-xs text-amber-600 text-center">
          Tienes cambios sin guardar
        </p>
      )}
    </div>
  );
}
