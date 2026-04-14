'use client';

import { useEffect, useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminPut, adminDelete } from '@/lib/adminApi';
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Pencil,
  Trash2,
  Loader2,
  X,
  Check,
  Search,
  Lock,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
  role_id: number | null;
  role_name: string | null;
  active: number;
  last_login: string | null;
  updated_at: string | null;
}

interface Role {
  id: number;
  name: string;
  description: string | null;
  permissions: string[];
  is_system: number;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 border-purple-200',
  admin:       'bg-blue-100 text-blue-700 border-blue-200',
  editor:      'bg-emerald-100 text-emerald-700 border-emerald-200',
  viewer:      'bg-slate-100 text-slate-600 border-slate-200',
};

function roleColor(name: string | null): string {
  if (!name) return 'bg-slate-100 text-slate-500 border-slate-200';
  return ROLE_COLORS[name] ?? 'bg-indigo-100 text-indigo-700 border-indigo-200';
}

function initials(name: string | null, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(' ');
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return email[0].toUpperCase();
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-purple-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-rose-500 to-pink-600',
];

function avatarGradient(id: number): string {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

function relativeTime(dt: string | null): string {
  if (!dt) return 'Nunca';
  const diff = Date.now() - new Date(dt).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)  return 'Hace un momento';
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 30)  return `Hace ${days}d`;
  return new Date(dt).toLocaleDateString('es');
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  user: User | null; // null = new user
  roles: Role[];
  currentUserId: number;
  onClose: () => void;
  onSaved: () => void;
}

function UserModal({ user, roles, currentUserId: _cuid, onClose, onSaved }: ModalProps) {
  const isEdit = user !== null;
  const [form, setForm] = useState({
    name:     user?.name ?? '',
    email:    user?.email ?? '',
    password: '',
    role_id:  String(user?.role_id ?? (roles[0]?.id ?? '')),
    active:   user?.active ?? 1,
  });
  const [saving, setSaving] = useState(false);

  function field<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.email) { toast.error('El email es requerido'); return; }
    if (!form.role_id) { toast.error('El rol es requerido'); return; }
    if (!isEdit && !form.password) { toast.error('La contraseña es requerida'); return; }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name:    form.name,
        email:   form.email,
        role_id: Number(form.role_id),
        active:  form.active,
      };
      if (form.password) payload.password = form.password;
      if (isEdit) {
        payload.id = user!.id;
        await adminPut('/users', payload);
        toast.success('Usuario actualizado');
      } else {
        await adminPost('/users', payload);
        toast.success('Usuario creado');
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus size={18} className="text-blue-600" />
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Email *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => field('email', e.target.value)}
                required
                placeholder="usuario@ejemplo.com"
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Contraseña {isEdit && <span className="font-normal text-slate-400 normal-case">(dejar vacío para no cambiar)</span>}
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => field('password', e.target.value)}
                required={!isEdit}
                placeholder={isEdit ? '••••••••' : 'Mínimo 6 caracteres'}
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Rol *
            </label>
            <div className="relative">
              <Shield size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={form.role_id}
                onChange={(e) => field('role_id', e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition appearance-none bg-white"
              >
                <option value="">Seleccionar rol…</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <button
              type="button"
              onClick={() => field('active', form.active === 1 ? 0 : 1)}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              {form.active === 1
                ? <ToggleRight size={22} className="text-emerald-500" />
                : <ToggleLeft size={22} className="text-slate-400" />
              }
              <span>{form.active === 1 ? 'Usuario activo' : 'Usuario inactivo'}</span>
            </button>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function UsersPage() {
  const [users, setUsers]     = useState<User[]>([]);
  const [roles, setRoles]     = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [editUser, setEditUser] = useState<User | null | undefined>(undefined);
  // undefined = modal closed; null = new user; User = editing
  const [currentUserId, setCurrentUserId] = useState<number>(0);

  async function load() {
    try {
      const [usersData, rolesData, meData] = await Promise.all([
        adminGet<{ users: User[] }>('/users'),
        adminGet<{ roles: Role[] }>('/roles'),
        adminGet<{ user: { id: number } }>('/me'),
      ]);
      setUsers(usersData.users);
      setRoles(rolesData.roles);
      setCurrentUserId(meData.user.id);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.name ?? '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role_name ?? '').toLowerCase().includes(q)
    );
  }, [users, search]);

  async function handleDelete(u: User) {
    if (u.id === currentUserId) {
      toast.error('No puedes eliminar tu propio usuario');
      return;
    }
    if (!confirm(`¿Eliminar al usuario "${u.name ?? u.email}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminDelete(`/users?id=${u.id}`);
      toast.success('Usuario eliminado');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar';
      toast.error(msg);
    }
  }

  async function handleToggleActive(u: User) {
    try {
      await adminPut('/users', { id: u.id, active: u.active === 1 ? 0 : 1 });
      toast.success(u.active === 1 ? 'Usuario desactivado' : 'Usuario activado');
      load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar';
      toast.error(msg);
    }
  }

  const totalActive   = users.filter((u) => u.active === 1).length;
  const totalInactive = users.filter((u) => u.active === 0).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Usuarios</h2>
          </div>
          <p className="text-sm text-slate-500 ml-[52px]">
            Gestiona los usuarios del panel de administración
          </p>
        </div>
        <button
          onClick={() => setEditUser(null)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5"
        >
          <UserPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{users.length}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activos</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{totalActive}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Inactivos</div>
          <div className="text-2xl font-bold text-slate-400 mt-1">{totalInactive}</div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Roles</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{roles.length}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email o rol…"
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Rol
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Último acceso
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    {/* Avatar + name + email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(u.id)} flex items-center justify-center shrink-0`}>
                          <span className="text-white text-xs font-bold">
                            {initials(u.name, u.email)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 truncate">
                            {u.name || <span className="text-slate-400 font-normal italic">Sin nombre</span>}
                            {u.id === currentUserId && (
                              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 text-xs truncate">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {u.role_name ? (
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${roleColor(u.role_name)}`}>
                          <Shield size={11} />
                          {u.role_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Sin rol</span>
                      )}
                    </td>

                    {/* Last login */}
                    <td className="px-5 py-3.5 text-slate-500 text-xs hidden lg:table-cell">
                      {relativeTime(u.last_login)}
                    </td>

                    {/* Active toggle */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleToggleActive(u)}
                        className="flex items-center gap-1.5 text-xs font-medium transition"
                        title={u.active === 1 ? 'Desactivar' : 'Activar'}
                      >
                        {u.active === 1
                          ? <><ToggleRight size={16} className="text-emerald-500" /><span className="text-emerald-600">Activo</span></>
                          : <><ToggleLeft size={16} className="text-slate-400" /><span className="text-slate-400">Inactivo</span></>
                        }
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditUser(u)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          disabled={u.id === currentUserId}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                          title={u.id === currentUserId ? 'No puedes eliminarte a ti mismo' : 'Eliminar'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {editUser !== undefined && (
        <UserModal
          user={editUser}
          roles={roles}
          currentUserId={currentUserId}
          onClose={() => setEditUser(undefined)}
          onSaved={load}
        />
      )}
    </div>
  );
}
