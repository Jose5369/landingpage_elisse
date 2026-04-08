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
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        setError(data.error ?? 'Credenciales incorrectas');
        return;
      }
      localStorage.setItem('admin_token', data.token);
      setSuccess(true);
      setTimeout(() => onSuccess(data.token), 800);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl"
          style={{ animation: 'pulse 4s ease-in-out infinite alternate' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-cyan-500/8 rounded-full blur-3xl"
          style={{ animation: 'pulse 5s ease-in-out infinite alternate-reverse' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            style={{
              top: `${15 + i * 15}%`,
              left: `${10 + i * 16}%`,
              animation: `float ${3 + i * 0.7}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div
        className={`relative w-full max-w-md transition-all duration-700 ${
          success ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
        }`}
        style={{ animation: 'slideUp 0.6s ease-out' }}
      >
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-60" />

        <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500" />

          <div className="p-10">
            {/* Logo */}
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 relative"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                <ShieldCheck size={30} className="text-white relative z-10" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">ELISE SYSTEM</h1>
              <p className="text-slate-400 text-sm mt-2">Panel de Administración</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div
                  className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3.5 backdrop-blur-sm"
                  style={{ animation: 'shake 0.5s ease-in-out' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Email field */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Correo electrónico
                </label>
                <div className={`relative rounded-xl transition-all duration-300 ${
                  focusedField === 'email'
                    ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                    : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${focusedField === 'email' ? 'text-blue-400' : 'text-slate-500'}`}>
                      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 7l8.165 5.715a3 3 0 003.67 0L22 7" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    placeholder="admin@elisesystem.com"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className={`relative rounded-xl transition-all duration-300 ${
                  focusedField === 'password'
                    ? 'ring-2 ring-blue-500/50 shadow-lg shadow-blue-500/10'
                    : ''
                }`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-300 ${focusedField === 'password' ? 'text-blue-400' : 'text-slate-500'}`}>
                      <rect x="3" y="11" width="18" height="11" rx="3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-300"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-10-7-10-7a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 10 7 10 7a18.5 18.5 0 01-2.16 3.19M3 3l18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || success}
                className="relative w-full overflow-hidden font-semibold py-4 rounded-xl text-sm text-white transition-all duration-300 disabled:cursor-not-allowed group mt-2"
                style={{
                  background: loading || success
                    ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                    : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                }}
              >
                {/* Hover shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Verificando credenciales...
                    </>
                  ) : success ? (
                    <>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Acceso concedido
                    </>
                  ) : (
                    <>
                      Iniciar sesión
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:translate-x-0.5 transition-transform">
                        <path d="M3 8h10M10 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-slate-500 text-xs">
                Acceso restringido a personal autorizado
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-600 text-xs">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="7" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Conexión segura SSL/TLS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes float {
          from { transform: translateY(0px); }
          to { transform: translateY(-20px); }
        }
      `}</style>
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
