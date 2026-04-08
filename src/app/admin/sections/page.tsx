'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPut } from '@/lib/adminApi';
import { Pencil, Check, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Section {
  id: number;
  section_key: string;
  title: string;
  subtitle: string;
  content: string;
  activo: number;
  orden: number;
}

interface SectionsResponse {
  sections: Section[];
}

const sectionLabels: Record<string, string> = {
  hero: 'Hero / Portada',
  trust_bar: 'Barra de confianza',
  showcase: 'Showcase / Demostración',
  features: 'Funcionalidades',
  benefits: 'Beneficios',
  industries: 'Industrias',
  pricing: 'Precios',
  testimonials: 'Testimonios',
  cta: 'Llamada a la acción',
  faq: 'Preguntas frecuentes',
  contact: 'Contacto',
  footer: 'Footer',
};

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Section>>({});
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await adminGet<SectionsResponse>('/sections');
      setSections(data.sections);
    } catch {
      toast.error('Error al cargar secciones');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(section: Section) {
    const updated = { ...section, activo: section.activo ? 0 : 1 };
    setSections((prev) => prev.map((s) => (s.section_key === section.section_key ? updated : s)));
    try {
      await adminPut('/sections', { section_key: section.section_key, activo: updated.activo });
      toast.success(updated.activo ? 'Sección activada' : 'Sección desactivada');
    } catch {
      toast.error('Error al actualizar');
      load();
    }
  }

  async function handleSaveEdit() {
    if (!editingKey) return;
    setSaving(true);
    try {
      await adminPut<SectionsResponse>('/sections', { section_key: editingKey, ...editForm });
      toast.success('Sección actualizada');
      setEditingKey(null);
      setEditForm({});
      load();
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Secciones de la Landing</h2>
        <p className="text-sm text-slate-500 mt-1">Activa, desactiva y edita cada sección de tu página</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const isEditing = editingKey === section.section_key;
          const label = sectionLabels[section.section_key] ?? section.section_key;

          return (
            <div
              key={section.section_key}
              className={`bg-white rounded-2xl border transition ${
                isEditing ? 'border-slate-900 shadow-md' : 'border-slate-200'
              }`}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 text-sm">{label}</span>
                    <code className="text-xs text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                      {section.section_key}
                    </code>
                  </div>
                  {!isEditing && section.title && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{section.title}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(section)}
                    title={section.activo ? 'Desactivar' : 'Activar'}
                    className={`transition ${section.activo ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {section.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>

                  {/* Edit / cancel */}
                  {!isEditing ? (
                    <button
                      onClick={() => {
                        setEditingKey(section.section_key);
                        setEditForm({ title: section.title, subtitle: section.subtitle, content: section.content });
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Pencil size={15} />
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => { setEditingKey(null); setEditForm({}); }}
                        className="p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Editable fields */}
              {isEditing && (
                <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
                    <input
                      type="text"
                      value={editForm.title ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="Título de la sección"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Subtítulo</label>
                    <input
                      type="text"
                      value={editForm.subtitle ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="Subtítulo de la sección"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contenido</label>
                    <textarea
                      rows={4}
                      value={editForm.content ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                      placeholder="Contenido de la sección…"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
