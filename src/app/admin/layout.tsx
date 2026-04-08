'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Settings,
  Search,
  Menu,
  Layers,
  Zap,
  CheckCircle,
  Building2,
  FileText,
  Share2,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

// ------------------------------------------------------------------ types
interface LoginPayload {
  token: string;
  user: { id: number; email: string; name: string };
}

// ------------------------------------------------------------------ nav items
const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/settings', label: 'Ajustes Generales', icon: Settings },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/menu', label: 'Menú', icon: Menu },
  { href: '/admin/sections', label: 'Secciones', icon: Layers },
  { href: '/admin/features', label: 'Funciones', icon: Zap },
  { href: '/admin/benefits', label: 'Beneficios', icon: CheckCircle },
  { href: '/admin/industries', label: 'Industrias', icon: Building2 },
  { href: '/admin/pages', label: 'Páginas', icon: FileText },
  { href: '/admin/social', label: 'Redes Sociales', icon: Share2 },
];

// ------------------------------------------------------------------ login form
function LoginForm({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as LoginPayload & { error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      onSuccess(data.token);
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-800 rounded-2xl mb-4">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-1">Inicia sesión para continuar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              placeholder="admin@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ sidebar nav link
function NavLink({ item, collapsed }: { item: (typeof navItems)[0]; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative ${
        isActive
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-400 hover:text-white hover:bg-slate-700'
      }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && isActive && (
        <ChevronRight size={14} className="ml-auto text-slate-400" />
      )}
    </Link>
  );
}

// ------------------------------------------------------------------ main layout
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');
    setToken(stored);
    setMounted(true);
  }, []);

  function handleLogout() {
    localStorage.removeItem('admin_token');
    setToken(null);
    toast.success('Sesión cerrada');
    router.push('/admin');
  }

  // prevent flash
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginForm onSuccess={(t) => setToken(t)} />
      </>
    );
  }

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} shrink-0 bg-slate-800 flex flex-col transition-all duration-200 sticky top-0 h-screen`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                <ShieldCheck size={16} className="text-slate-800" />
              </div>
              <span className="font-bold text-white text-sm truncate">Admin</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="text-slate-400 hover:text-white transition p-1 rounded"
            title={sidebarCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-700">
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <LogOut size={18} className="shrink-0" />
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-base font-semibold text-slate-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
