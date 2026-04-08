'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, Check, X, Loader2, ToggleLeft, ToggleRight, CheckCircle } from 'lucide-react';

interface Benefit {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
  activo: number;
}

interface BenefitsResponse {
  benefits: Benefit[];
}

const emptyForm = { icon: '', title: '', description: '', activo: 1 };

export default function BenefitsPage() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Benefit>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await adminGet<BenefitsResponse>('/benefits');
      setBenefits(data.benefits);
    } catch {
      toast.error('Error al cargar beneficios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(benefit: Benefit) {
    const updated = { ...benefit, activo: benefit.activo ? 0 : 1 };
    setBenefits((prev) => prev.map((b) => (b.id === benefit.id ? updated : b)));
    try {
      await adminPut('/benefits', { id: benefit.id, activo: updated.activo });
      toast.success(updated.activo ? 'Beneficio activado' : 'Beneficio desactivado');
    } catch {
      toast.error('Error al actualizar');
      load();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este beneficio?')) return;
    try {
      await adminDelete(`/benefits?id=${id}`);
      toast.success('Beneficio eliminado');
      setBenefits((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      await adminPut('/benefits', { id: editingId, ...editForm });
      toast.success('Beneficio actualizado');
      setEditingId(null);
      setEditForm({});
      load();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate() {
    if (!newForm.title) {
      toast.error('El título es requerido');
      return;
    }
    setSaving(true);
    try {
      await adminPost('/benefits', { ...newForm, orden: benefits.length });
      toast.success('Beneficio creado');
      setNewForm(emptyForm);
      setShowNew(false);
      load();
    } catch {
      toast.error('Error al crear beneficio');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Beneficios</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona las tarjetas de beneficios del sitio</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={16} />
          Nuevo beneficio
        </button>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Nuevo beneficio</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ícono (nombre)</label>
              <input
                type="text"
                value={newForm.icon}
                onChange={(e) => setNewForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="check-circle"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Título *</label>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Nombre del beneficio"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <textarea
              rows={2}
              value={newForm.description}
              onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Descripción del beneficio…"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={newForm.activo === 1}
                onChange={(e) => setNewForm((f) => ({ ...f, activo: e.target.checked ? 1 : 0 }))}
                className="rounded"
              />
              Activo
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crear
            </button>
            <button
              onClick={() => { setShowNew(false); setNewForm(emptyForm); }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Benefits grid */}
      {benefits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-14 text-slate-400">
          <CheckCircle size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay beneficios todavía</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit) => {
            const isEditing = editingId === benefit.id;
            return (
              <div
                key={benefit.id}
                className={`bg-white rounded-2xl border transition ${
                  isEditing ? 'border-slate-900 shadow-md' : 'border-slate-200'
                } ${!benefit.activo ? 'opacity-60' : ''}`}
              >
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Ícono</label>
                      <input
                        type="text"
                        value={editForm.icon ?? benefit.icon}
                        onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Título</label>
                      <input
                        type="text"
                        value={editForm.title ?? benefit.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
                      <textarea
                        rows={2}
                        value={editForm.description ?? benefit.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="flex items-center gap-1.5 text-slate-600 text-xs px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X size={12} />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                      <span className="text-amber-600 text-lg">{benefit.icon || '✓'}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1">{benefit.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{benefit.description}</p>
                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleToggle(benefit)}
                        className={`transition ${benefit.activo ? 'text-emerald-500' : 'text-slate-300'}`}
                        title={benefit.activo ? 'Desactivar' : 'Activar'}
                      >
                        {benefit.activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <div className="flex-1" />
                      <button
                        onClick={() => {
                          setEditingId(benefit.id);
                          setEditForm({ icon: benefit.icon, title: benefit.title, description: benefit.description });
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(benefit.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
