'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Lock,
  Users,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: number;
  created_at: string;
  user_count: number;
}

// ─── Permission resources / actions ──────────────────────────────────────────

const RESOURCES = [
  { key: 'settings',   label: 'Ajustes' },
  { key: 'menu',       label: 'Menú' },
  { key: 'sections',   label: 'Secciones' },
  { key: 'features',   label: 'Funciones' },
  { key: 'benefits',   label: 'Beneficios' },
  { key: 'industries', label: 'Industrias' },
  { key: 'pages',      label: 'Páginas' },
  { key: 'social',     label: 'Redes Sociales' },
  { key: 'users',      label: 'Usuarios' },
];

const ACTIONS = ['read', 'write', 'delete'];

function permKey(resource: string, action: string) {
  return `${resource}.${action}`;
}

function hasWildcard(permissions: string[]) {
  return permissions.includes('*');
}

function hasResourceWildcard(permissions: string[], resource: string) {
  return permissions.includes(`${resource}.*`);
}

function hasSpecific(permissions: string[], resource: string, action: string) {
  return permissions.includes(permKey(resource, action));
}

function isPermChecked(permissions: string[], resource: string, action: string): boolean {
  if (hasWildcard(permissions)) return true;
  if (hasResourceWildcard(permissions, resource)) return true;
  if (permissions.includes(`*.${action}`)) return true;
  return hasSpecific(permissions, resource, action);
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  role: Role | null; // null = new role
  onClose: () => void;
  onSaved: () => void;
}

function RoleModal({ role, onClose, onSaved }: ModalProps) {
  const isEdit    = role !== null;
  const isSystem  = role?.is_system === 1;

  const [name, setName]        = useState(role?.name ?? '');
  const [desc, setDesc]        = useState(role?.description ?? '');
  const [perms, setPerms]      = useState<string[]>(role?.permissions ?? []);
  const [saving, setSaving]    = useState(false);

  function toggleAll() {
    if (hasWildcard(perms)) {
      setPerms((p) => p.filter((x) => x !== '*'));
    } else {
      setPerms(['*']);
    }
  }

  function toggleResourceAll(resource: string) {
    const wildcard = `${resource}.*`;
    if (perms.includes(wildcard) || hasWildcard(perms)) {
      setPerms((p) => p.filter((x) => x !== wildcard && !x.startsWith(`${resource}.`)));
    } else {
      setPerms((p) => [
        ...p.filter((x) => !x.startsWith(`${resource}.`)),
        wildcard,
      ]);
    }
  }

  function togglePerm(resource: string, action: string) {
    const key = permKey(resource, action);
    if (perms.includes(key)) {
      setPerms((p) => p.filter((x) => x !== key));
    } else {
      setPerms((p) => [...p, key]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isSystem && !name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    setSaving(true);
    try {
      if (isEdit) {
        const payload: Record<string, unknown> = { id: role!.id, description: desc };
        if (!isSystem) {
          payload.name        = name.trim();
          payload.permissions = perms;
        }
        await adminPut('/roles', payload);
        toast.success('Rol actualizado');
      } else {
        await adminPost('/roles', { name: name.trim(), description: desc, permissions: perms });
        toast.success('Rol creado');
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  const allChecked = hasWildcard(perms);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            {isEdit ? 'Editar rol' : 'Nuevo rol'}
            {isSystem && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock size={9} /> Sistema
              </span>
            )}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body (scrollable) */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSystem}
                placeholder="ej: moderator"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
              />
              {isSystem && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Lock size={10} /> El nombre de roles del sistema no se puede modificar
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Descripción
              </label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Describe brevemente este rol…"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Permissions */}
            {(!isSystem || !isEdit) && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Permisos
                  </label>
                  {/* Master all checkbox */}
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    Todo (*) — Acceso completo
                  </label>
                </div>

                {!allChecked && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_repeat(4,_auto)] gap-x-0 bg-slate-50 border-b border-slate-200 px-4 py-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Recurso</span>
                      <span className="w-16 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Todo</span>
                      {ACTIONS.map((a) => (
                        <span key={a} className="w-16 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{a}</span>
                      ))}
                    </div>
                    {RESOURCES.map((res, i) => {
                      const resAllChecked = hasResourceWildcard(perms, res.key) || allChecked;
                      return (
                        <div
                          key={res.key}
                          className={`grid grid-cols-[1fr_repeat(4,_auto)] gap-x-0 px-4 py-2.5 items-center ${i % 2 === 0 ? '' : 'bg-slate-50/50'} hover:bg-blue-50/30 transition-colors`}
                        >
                          <span className="text-sm font-medium text-slate-700">{res.label}</span>
                          {/* Resource wildcard */}
                          <div className="w-16 flex justify-center">
                            <input
                              type="checkbox"
                              checked={resAllChecked}
                              onChange={() => toggleResourceAll(res.key)}
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                            />
                          </div>
                          {/* Action checkboxes */}
                          {ACTIONS.map((action) => (
                            <div key={action} className="w-16 flex justify-center">
                              <input
                                type="checkbox"
                                checked={isPermChecked(perms, res.key, action)}
                                onChange={() => !resAllChecked && togglePerm(res.key, action)}
                                disabled={resAllChecked}
                                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-40"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}

                {allChecked && (
                  <p className="text-xs text-slate-500 italic">
                    Este rol tiene acceso a todas las operaciones del sistema.
                  </p>
                )}
              </div>
            )}

            {isSystem && isEdit && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <Lock size={14} className="inline mr-1.5" />
                Los permisos de roles del sistema no se pueden modificar.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 flex gap-2 px-6 py-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? 'Guardar cambios' : 'Crear rol'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-4 py-2.5 rounded-lg hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────

const ROLE_CARD_COLORS: Record<string, { bg: string; icon: string; badge: string }> = {
  super_admin: { bg: 'from-purple-500 to-violet-600', icon: 'text-white', badge: 'bg-purple-100 text-purple-700' },
  admin:       { bg: 'from-blue-500 to-indigo-600',   icon: 'text-white', badge: 'bg-blue-100 text-blue-700' },
  editor:      { bg: 'from-emerald-500 to-teal-600',  icon: 'text-white', badge: 'bg-emerald-100 text-emerald-700' },
  viewer:      { bg: 'from-slate-400 to-slate-600',   icon: 'text-white', badge: 'bg-slate-100 text-slate-600' },
};

function cardColors(name: string) {
  return ROLE_CARD_COLORS[name] ?? { bg: 'from-indigo-400 to-indigo-600', icon: 'text-white', badge: 'bg-indigo-100 text-indigo-700' };
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RolesPage() {
  const [roles, setRoles]     = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState<Role | null | undefined>(undefined);
  // undefined = closed, null = new, Role = editing

  async function load() {
    try {
      const data = await adminGet<{ roles: Role[] }>('/roles');
      setRoles(data.roles);
    } catch {
      toast.error('Error al cargar roles');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(r: Role) {
    if (r.is_system) {
      toast.error('No se pueden eliminar roles del sistema');
      return;
    }
    if (r.user_count > 0) {
      toast.error(`Este rol tiene ${r.user_count} usuario(s) asignado(s)`);
      return;
    }
    if (!confirm(`¿Eliminar el rol "${r.name}"?`)) return;
    try {
      await adminDelete(`/roles?id=${r.id}`);
      toast.success('Rol eliminado');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(msg);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Roles</h2>
          </div>
          <p className="text-sm text-slate-500 ml-[52px]">
            Gestiona los roles y permisos de acceso al panel
          </p>
        </div>
        <button
          onClick={() => setEditRole(null)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Nuevo rol
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total roles</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{roles.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Del sistema</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{roles.filter((r) => r.is_system).length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Personalizados</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{roles.filter((r) => !r.is_system).length}</div>
        </div>
      </div>

      {/* Roles grid */}
      {roles.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium">No hay roles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((r) => {
            const colors = cardColors(r.name);
            const permCount = r.permissions.length;
            return (
              <div
                key={r.id}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${colors.bg}`} />

                <div className="p-5">
                  {/* Icon + name row */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center shrink-0 shadow-md`}>
                        <Shield size={20} className={colors.icon} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                        {r.is_system === 1 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                            <Lock size={8} /> Sistema
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-500 min-h-[40px] mb-4 leading-relaxed">
                    {r.description || <span className="italic text-slate-400">Sin descripción</span>}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Shield size={11} />
                      {r.permissions.includes('*')
                        ? 'Todos los permisos'
                        : `${permCount} permiso${permCount !== 1 ? 's' : ''}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {r.user_count} usuario{r.user_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Permissions preview */}
                  {!r.permissions.includes('*') && r.permissions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {r.permissions.slice(0, 5).map((p) => (
                        <span key={p} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                          {p}
                        </span>
                      ))}
                      {r.permissions.length > 5 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          +{r.permissions.length - 5}
                        </span>
                      )}
                    </div>
                  )}

                  {r.permissions.includes('*') && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-mono font-bold">
                        * (all)
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => setEditRole(r)}
                      className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Pencil size={13} />
                      Editar
                    </button>
                    {r.is_system ? (
                      <button
                        disabled
                        title="Rol del sistema — no se puede eliminar"
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-300 px-2.5 py-1.5 rounded-lg cursor-not-allowed"
                      >
                        <Lock size={13} />
                        Protegido
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDelete(r)}
                        className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={13} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {editRole !== undefined && (
        <RoleModal
          role={editRole}
          onClose={() => setEditRole(undefined)}
          onSaved={load}
        />
      )}
    </div>
  );
}
