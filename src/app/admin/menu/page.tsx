'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  X,
  Loader2,
  GripVertical,
} from 'lucide-react';

interface MenuItem {
  id: number;
  label: string;
  href: string;
  orden: number;
  activo: number;
}

interface MenuResponse {
  items: MenuItem[];
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<MenuItem>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ label: '', href: '', activo: 1 });
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await adminGet<MenuResponse>('/menu');
      setItems(data.items);
    } catch {
      toast.error('Error al cargar el menú');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleMove(index: number, dir: -1 | 1) {
    const next = [...items];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= next.length) return;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];

    // Reassign orden
    const updates = next.map((item, i) => ({ ...item, orden: i }));
    setItems(updates);

    try {
      await Promise.all(
        updates.map((item) => adminPut('/menu', { id: item.id, orden: item.orden }))
      );
    } catch {
      toast.error('Error al reordenar');
      load();
    }
  }

  async function handleToggleActive(item: MenuItem) {
    const updated = { ...item, activo: item.activo ? 0 : 1 };
    setItems((prev) => prev.map((m) => (m.id === item.id ? updated : m)));
    try {
      await adminPut('/menu', { id: item.id, activo: updated.activo });
      toast.success(updated.activo ? 'Item activado' : 'Item desactivado');
    } catch {
      toast.error('Error al actualizar');
      load();
    }
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      await adminPut<MenuResponse>('/menu', { id: editingId, ...editForm });
      toast.success('Item actualizado');
      setEditingId(null);
      setEditForm({});
      load();
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este item del menú?')) return;
    try {
      await adminDelete(`/menu?id=${id}`);
      toast.success('Item eliminado');
      setItems((prev) => prev.filter((m) => m.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  }

  async function handleCreate() {
    if (!newForm.label || !newForm.href) {
      toast.error('Label y URL son requeridos');
      return;
    }
    setSaving(true);
    try {
      await adminPost('/menu', { ...newForm, orden: items.length });
      toast.success('Item creado');
      setNewForm({ label: '', href: '', activo: 1 });
      setShowNew(false);
      load();
    } catch {
      toast.error('Error al crear item');
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
          <h2 className="text-xl font-bold text-slate-900">Gestión del Menú</h2>
          <p className="text-sm text-slate-500 mt-1">Administra los ítems de navegación del sitio</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={16} />
          Nuevo item
        </button>
      </div>

      {/* New item form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Nuevo ítem de menú</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Etiqueta *</label>
              <input
                type="text"
                value={newForm.label}
                onChange={(e) => setNewForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Inicio"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">URL *</label>
              <input
                type="text"
                value={newForm.href}
                onChange={(e) => setNewForm((f) => ({ ...f, href: e.target.value }))}
                placeholder="/#inicio"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crear
            </button>
            <button
              onClick={() => { setShowNew(false); setNewForm({ label: '', href: '', activo: 1 }); }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {items.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="text-sm">No hay ítems en el menú</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                {/* Grip icon */}
                <GripVertical size={16} className="text-slate-300 shrink-0" />

                {/* Order buttons */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMove(index, 1)}
                    disabled={index === items.length - 1}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Content */}
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={editForm.label ?? item.label}
                      onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 w-32"
                      placeholder="Etiqueta"
                    />
                    <input
                      type="text"
                      value={editForm.href ?? item.href}
                      onChange={(e) => setEditForm((f) => ({ ...f, href: e.target.value }))}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 flex-1 min-w-24"
                      placeholder="URL"
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition"
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
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-800">{item.label}</span>
                    <span className="text-xs text-slate-400 font-mono truncate">{item.href}</span>
                    <span
                      className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.activo
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                )}

                {/* Actions */}
                {editingId !== item.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleActive(item)}
                      title={item.activo ? 'Desactivar' : 'Activar'}
                      className={`p-1.5 rounded-lg text-xs transition ${
                        item.activo
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => { setEditingId(item.id); setEditForm({ label: item.label, href: item.href }); }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
