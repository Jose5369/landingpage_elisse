'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, Check, X, Loader2, Building2, Eye, EyeOff } from 'lucide-react';
import IconPicker from '@/components/admin/IconPicker';

interface Industry {
  id: number;
  icon: string;
  name: string;
  orden: number;
  activo: number;
}

interface IndustriesResponse {
  industries: Industry[];
}

const emptyForm = { icon: 'storefront', name: '', activo: 1 };

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Industry>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await adminGet<IndustriesResponse>('/industries');
      setIndustries(data.industries);
    } catch {
      toast.error('Error al cargar industrias');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(industry: Industry) {
    const updated = { ...industry, activo: industry.activo ? 0 : 1 };
    setIndustries((prev) => prev.map((i) => (i.id === industry.id ? updated : i)));
    try {
      await adminPut('/industries', { id: industry.id, activo: updated.activo });
      toast.success(updated.activo ? 'Industria activada' : 'Industria desactivada');
    } catch {
      toast.error('Error al actualizar');
      load();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar esta industria?')) return;
    try {
      await adminDelete(`/industries?id=${id}`);
      toast.success('Industria eliminada');
      setIndustries((prev) => prev.filter((i) => i.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      await adminPut('/industries', { id: editingId, ...editForm });
      toast.success('Industria actualizada');
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
    if (!newForm.name) {
      toast.error('El nombre es requerido');
      return;
    }
    setSaving(true);
    try {
      await adminPost('/industries', { ...newForm, orden: industries.length });
      toast.success('Industria creada');
      setNewForm(emptyForm);
      setShowNew(false);
      load();
    } catch {
      toast.error('Error al crear industria');
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Building2 size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Industrias</h2>
          </div>
          <p className="text-sm text-slate-500 ml-[52px]">
            Sectores e industrias que atiende tu solución
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Nueva industria
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{industries.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activas</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {industries.filter((i) => i.activo).length}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ocultas</div>
          <div className="text-2xl font-bold text-slate-400 mt-1">
            {industries.filter((i) => !i.activo).length}
          </div>
        </div>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-emerald-500/50 p-6 space-y-4 shadow-xl shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Plus size={16} className="text-emerald-600" />
              Nueva industria
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
              <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mb-2 border border-slate-200">
                <span className="material-symbols-outlined text-[44px] text-emerald-600">
                  {newForm.icon || 'storefront'}
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
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newForm.name}
                  onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ej: Retail, Farmacias, Restaurantes…"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={newForm.activo === 1}
                  onChange={(e) => setNewForm((f) => ({ ...f, activo: e.target.checked ? 1 : 0 }))}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                />
                Mostrar en la landing
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 shadow-lg shadow-emerald-500/20"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crear industria
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

      {/* Industries grid */}
      {industries.length === 0 && !showNew ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No hay industrias todavía</p>
          <p className="text-slate-400 text-sm mb-4">Crea tu primera industria para empezar</p>
          <button
            onClick={() => setShowNew(true)}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} />
            Crear industria
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {industries.map((industry) => {
            const isEditing = editingId === industry.id;
            return (
              <div
                key={industry.id}
                className={`group relative bg-white rounded-2xl border transition-all ${
                  isEditing
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                } ${!industry.activo && !isEditing ? 'opacity-60' : ''}`}
              >
                {isEditing ? (
                  <div className="p-4 space-y-3">
                    <div className="w-full aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl flex items-center justify-center border border-slate-200">
                      <span className="material-symbols-outlined text-[48px] text-emerald-600">
                        {editForm.icon ?? industry.icon}
                      </span>
                    </div>
                    <IconPicker
                      value={editForm.icon ?? industry.icon}
                      onChange={(icon) => setEditForm((f) => ({ ...f, icon }))}
                    />
                    <input
                      type="text"
                      value={editForm.name ?? industry.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Nombre"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                        Guardar
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs px-3 py-2 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {!industry.activo && (
                      <div className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                        Oculta
                      </div>
                    )}

                    <div className="p-5 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined text-[36px] text-emerald-600">
                          {industry.icon || 'storefront'}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm mb-3">{industry.name}</h3>

                      <div className="flex items-center justify-center gap-1 pt-3 border-t border-slate-100 w-full">
                        <button
                          onClick={() => handleToggle(industry)}
                          className={`flex items-center gap-1 text-[11px] font-medium transition ${
                            industry.activo
                              ? 'text-emerald-600 hover:text-emerald-700'
                              : 'text-slate-400 hover:text-slate-600'
                          }`}
                          title={industry.activo ? 'Desactivar' : 'Activar'}
                        >
                          {industry.activo ? <Eye size={12} /> : <EyeOff size={12} />}
                          {industry.activo ? 'Visible' : 'Oculta'}
                        </button>
                        <div className="flex-1" />
                        <button
                          onClick={() => {
                            setEditingId(industry.id);
                            setEditForm({ icon: industry.icon, name: industry.name });
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(industry.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 size={13} />
                        </button>
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
