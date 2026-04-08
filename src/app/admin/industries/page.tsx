'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import { Plus, Pencil, Trash2, Check, X, Loader2, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';

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

const emptyForm = { icon: '', name: '', activo: 1 };

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
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Industrias</h2>
          <p className="text-sm text-slate-500 mt-1">Sectores o industrias que atiende tu solución</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={16} />
          Nueva industria
        </button>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Nueva industria</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Ícono (nombre o emoji)</label>
              <input
                type="text"
                value={newForm.icon}
                onChange={(e) => setNewForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="🏪 o building"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
              <input
                type="text"
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Retail"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
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

      {/* List */}
      {industries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-14 text-slate-400">
          <Building2 size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay industrias todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {industries.map((industry) => {
              const isEditing = editingId === industry.id;
              return (
                <li
                  key={industry.id}
                  className={`flex items-center gap-4 px-5 py-3.5 ${!industry.activo ? 'opacity-60' : ''}`}
                >
                  {/* Icon */}
                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-base shrink-0">
                    {industry.icon || <Building2 size={16} className="text-slate-400" />}
                  </div>

                  {/* Name / edit */}
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        value={editForm.icon ?? industry.icon}
                        onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-24"
                        placeholder="Ícono"
                      />
                      <input
                        type="text"
                        value={editForm.name ?? industry.name}
                        onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Nombre"
                      />
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      </button>
                      <button
                        onClick={() => { setEditingId(null); setEditForm({}); }}
                        className="p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-slate-800">{industry.name}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          industry.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {industry.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </>
                  )}

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleToggle(industry)}
                        className={`transition ${industry.activo ? 'text-emerald-500' : 'text-slate-300'}`}
                      >
                        {industry.activo ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => { setEditingId(industry.id); setEditForm({ icon: industry.icon, name: industry.name }); }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(industry.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
