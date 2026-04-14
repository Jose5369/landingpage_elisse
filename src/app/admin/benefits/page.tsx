'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, Check, X, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';

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

const emptyForm = { icon: 'star', title: '', description: '', activo: 1 };

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
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <CheckCircle size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Beneficios</h2>
          </div>
          <p className="text-sm text-slate-500 ml-[52px]">
            Gestiona las tarjetas de beneficios que destacan en la landing
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Nuevo beneficio
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{benefits.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activos</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {benefits.filter((b) => b.activo).length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ocultos</div>
          <div className="text-2xl font-bold text-slate-400 mt-1">
            {benefits.filter((b) => !b.activo).length}
          </div>
        </div>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-amber-500/50 p-6 space-y-4 shadow-xl shadow-amber-500/5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus size={16} className="text-amber-600" />
              Nuevo beneficio
            </h3>
            <button
              onClick={() => { setShowNew(false); setNewForm(emptyForm); }}
              className="text-slate-400 hover:text-slate-900 transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-[140px_1fr] gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Ícono
              </label>
              <div className="aspect-square bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl flex items-center justify-center mb-2 border border-slate-200">
                <span className="material-symbols-outlined text-[44px] text-amber-600">
                  {newForm.icon || 'star'}
                </span>
              </div>
              <IconPicker
                value={newForm.icon}
                onChange={(icon) => setNewForm((f) => ({ ...f, icon }))}
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newForm.title}
                  onChange={(e) => setNewForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: Soporte 24/7"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={newForm.description}
                  onChange={(e) => setNewForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe brevemente este beneficio…"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newForm.activo === 1}
                  onChange={(e) => setNewForm((f) => ({ ...f, activo: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                Mostrar en la landing
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 shadow-lg shadow-amber-500/20"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crear beneficio
            </button>
            <button
              onClick={() => { setShowNew(false); setNewForm(emptyForm); }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Benefits grid */}
      {benefits.length === 0 && !showNew ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No hay beneficios todavía</p>
          <p className="text-slate-400 text-sm mb-4">Crea tu primer beneficio para empezar</p>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} />
            Crear beneficio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit) => {
            const isEditing = editingId === benefit.id;
            return (
              <div
                key={benefit.id}
                className={`group relative bg-white rounded-2xl border transition-all ${
                  isEditing
                    ? 'border-amber-500 shadow-xl shadow-amber-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                } ${!benefit.activo && !isEditing ? 'opacity-60' : ''}`}
              >
                {isEditing ? (
                  <div className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-200">
                        <span className="material-symbols-outlined text-[36px] text-amber-600">
                          {editForm.icon ?? benefit.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Ícono
                        </label>
                        <IconPicker
                          value={editForm.icon ?? benefit.icon}
                          onChange={(icon) => setEditForm((f) => ({ ...f, icon }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editForm.title ?? benefit.title}
                        onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                        Descripción
                      </label>
                      <textarea
                        rows={3}
                        value={editForm.description ?? benefit.description}
                        onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!benefit.activo && (
                      <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                        Oculto
                      </div>
                    )}

                    <div className="p-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[32px] text-amber-600">
                          {benefit.icon || 'star'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-1.5">{benefit.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 mb-4 min-h-[60px]">
                        {benefit.description || <span className="italic text-slate-400">Sin descripción</span>}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <button
                          onClick={() => handleToggle(benefit)}
                          className={`flex items-center gap-1.5 text-xs font-medium transition ${
                            benefit.activo
                              ? 'text-emerald-600 hover:text-emerald-700'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={benefit.activo ? 'Desactivar' : 'Activar'}
                        >
                          {benefit.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                          {benefit.activo ? 'Visible' : 'Oculto'}
                        </button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(benefit.id);
                              setEditForm({
                                icon: benefit.icon,
                                title: benefit.title,
                                description: benefit.description,
                              });
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(benefit.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
