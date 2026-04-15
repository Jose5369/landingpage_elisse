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
  Users,
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
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/roles', label: 'Roles', icon: ShieldCheck },
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
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.logo_url) setLogoUrl(data.logo_url);
      })
      .catch(() => {/* keep ShieldCheck fallback */});
  }, []);

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
      setTimeout(() => onSuccess(data.token), 1200);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* === ANIMATED BACKGROUND === */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Orbiting gradient blobs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Animated grid */}
        <div className="grid-bg" />

        {/* Rising particles */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${5 + (i * 4.7) % 90}%`,
            animationDuration: `${6 + (i % 5) * 2}s`,
            animationDelay: `${(i * 0.8) % 10}s`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            opacity: 0.15 + (i % 4) * 0.1,
          }} />
        ))}

        {/* Horizontal scanning line */}
        <div className="scan-line" />
      </div>

      {/* === LOGIN CARD === */}
      <div className={`relative w-full max-w-md z-10 transition-all duration-1000 ${
        mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      } ${success ? 'login-success' : ''}`}>

        {/* Animated border glow */}
        <div className="card-glow" />

        {/* Rotating border */}
        <div className="card-border-wrap">
          <div className="card-border-rotate" />
        </div>

        <div className="relative bg-[#0c1222]/90 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden border border-white/[0.08]">
          {/* Animated top bar */}
          <div className="h-[2px] relative overflow-hidden">
            <div className="topbar-gradient" />
          </div>

          <div className="p-10">
            {/* Logo with pulse ring */}
            <div className="text-center mb-10">
              <div className="relative inline-flex items-center justify-center">
                <div className="logo-ring logo-ring-1" />
                <div className="logo-ring logo-ring-2" />
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-14 h-14 object-contain relative z-10"
                  />
                ) : (
                  <div className="logo-icon">
                    <ShieldCheck size={28} className="text-white relative z-10" />
                  </div>
                )}
              </div>
              <h1 className={`text-2xl font-bold text-white tracking-tight mt-6 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                ELISE SYSTEM
              </h1>
              <p className={`text-slate-400 text-sm mt-1.5 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
                Panel de Administración
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="error-shake flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-xl px-4 py-3.5">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Email */}
              <div className={`transition-all duration-700 delay-[400ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Correo electrónico
                </label>
                <div className={`input-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
                  <div className="input-glow" />
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-all duration-300 ${focusedField === 'email' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>
                      mail
                    </span>
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required autoComplete="email"
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:outline-none transition-all duration-300"
                      placeholder="admin@elisesystem.com"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className={`transition-all duration-700 delay-[550ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <div className={`input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
                  <div className="input-glow" />
                  <div className="relative">
                    <span className={`material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-lg transition-all duration-300 ${focusedField === 'password' ? 'text-blue-400 scale-110' : 'text-slate-500'}`}>
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required autoComplete="current-password"
                      className="w-full bg-white/[0.04] border border-white/[0.08] text-white placeholder-slate-600 rounded-xl pl-12 pr-12 py-3.5 text-sm focus:outline-none transition-all duration-300"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility' : 'visibility_off'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className={`transition-all duration-700 delay-[700ms] ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <button type="submit" disabled={loading || success}
                  className="login-btn relative w-full overflow-hidden font-semibold py-4 rounded-xl text-sm text-white transition-all duration-300 disabled:cursor-not-allowed group mt-1">
                  <div className="btn-shimmer" />
                  <span className="relative z-10 flex items-center justify-center gap-2.5">
                    {loading ? (
                      <>
                        <span className="loading-dots flex gap-1">
                          <span className="dot" /><span className="dot" /><span className="dot" />
                        </span>
                        Verificando...
                      </>
                    ) : success ? (
                      <>
                        <span className="checkmark">
                          <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="check-path"/>
                          </svg>
                        </span>
                        Bienvenido
                      </>
                    ) : (
                      <>
                        Acceder al panel
                        <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform duration-300">arrow_forward</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className={`mt-8 pt-6 border-t border-white/5 text-center transition-all duration-700 delay-[850ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <span className="ssl-dot" />
                  Conexión cifrada SSL/TLS
                </span>
                <span className="text-slate-700">•</span>
                <span>v2.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === ALL ANIMATIONS === */}
      <style jsx>{`
        .login-page {
          background: #070b14;
        }

        /* --- Orbs --- */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }
        .orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%);
          animation: orbit1 20s ease-in-out infinite;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(139,92,246,0.12), transparent 70%);
          animation: orbit2 25s ease-in-out infinite;
        }
        .orb-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(6,182,212,0.1), transparent 70%);
          animation: orbit3 18s ease-in-out infinite;
        }

        @keyframes orbit1 {
          0%   { top: -20%; left: -10%; }
          25%  { top: 10%;  left: 60%; }
          50%  { top: 60%;  left: 70%; }
          75%  { top: 50%;  left: -5%; }
          100% { top: -20%; left: -10%; }
        }
        @keyframes orbit2 {
          0%   { top: 70%;  right: -15%; }
          33%  { top: -10%; right: 30%; }
          66%  { top: 40%;  right: 60%; }
          100% { top: 70%;  right: -15%; }
        }
        @keyframes orbit3 {
          0%   { bottom: -10%; left: 30%; }
          50%  { bottom: 50%;  left: -10%; }
          100% { bottom: -10%; left: 30%; }
        }

        /* --- Grid --- */
        .grid-bg {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 20s linear infinite;
        }
        @keyframes gridMove {
          from { transform: translate(0, 0); }
          to   { transform: translate(50px, 50px); }
        }

        /* --- Particles --- */
        .particle {
          position: absolute;
          bottom: -10px;
          background: #3b82f6;
          border-radius: 50%;
          animation: rise linear infinite;
        }
        @keyframes rise {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 0.4; }
          90%  { opacity: 0.1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }

        /* --- Scan line --- */
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent);
          animation: scan 4s ease-in-out infinite;
        }
        @keyframes scan {
          0%   { top: -2%; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { top: 102%; opacity: 0; }
        }

        /* --- Card glow --- */
        .card-glow {
          position: absolute;
          inset: -2px;
          border-radius: 18px;
          background: conic-gradient(from var(--angle, 0deg), transparent 60%, rgba(59,130,246,0.3), rgba(139,92,246,0.3), transparent 100%);
          animation: glowRotate 4s linear infinite;
          filter: blur(15px);
          opacity: 0.5;
        }
        @keyframes glowRotate {
          to { --angle: 360deg; }
        }
        @property --angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }

        /* --- Card border rotate --- */
        .card-border-wrap {
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          overflow: hidden;
          z-index: 0;
        }
        .card-border-rotate {
          position: absolute;
          inset: -50%;
          background: conic-gradient(from 0deg, transparent, #3b82f6, #8b5cf6, #06b6d4, transparent);
          animation: borderSpin 6s linear infinite;
        }
        @keyframes borderSpin {
          to { transform: rotate(360deg); }
        }

        /* --- Top bar --- */
        .topbar-gradient {
          position: absolute;
          inset: 0;
          width: 300%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
          animation: topbarSlide 3s linear infinite;
        }
        @keyframes topbarSlide {
          from { transform: translateX(-33.33%); }
          to   { transform: translateX(0); }
        }

        /* --- Logo rings --- */
        .logo-icon {
          position: relative; z-index: 2;
          width: 60px; height: 60px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
        }
        .logo-ring {
          position: absolute;
          border: 2px solid rgba(59,130,246,0.2);
          border-radius: 20px;
        }
        .logo-ring-1 {
          inset: -8px;
          animation: ringPulse 2s ease-in-out infinite;
        }
        .logo-ring-2 {
          inset: -16px;
          animation: ringPulse 2s ease-in-out infinite 0.5s;
          border-color: rgba(59,130,246,0.1);
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.08); opacity: 0; }
        }

        /* --- Input focus --- */
        .input-wrap {
          position: relative;
          border-radius: 12px;
        }
        .input-wrap .input-glow {
          position: absolute; inset: -1px;
          border-radius: 13px;
          opacity: 0;
          background: linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4));
          filter: blur(8px);
          transition: opacity 0.4s;
        }
        .input-wrap.focused .input-glow {
          opacity: 1;
        }
        .input-wrap.focused input {
          border-color: rgba(59,130,246,0.5);
          background: rgba(255,255,255,0.06);
        }

        /* --- Button --- */
        .login-btn {
          background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6);
          background-size: 200% 200%;
          animation: btnGradient 3s ease infinite;
        }
        @keyframes btnGradient {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .btn-shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%);
          animation: shimmer 2.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* --- Loading dots --- */
        .loading-dots .dot {
          width: 6px; height: 6px;
          background: white;
          border-radius: 50%;
          display: inline-block;
          animation: dotBounce 1.4s ease-in-out infinite;
        }
        .loading-dots .dot:nth-child(2) { animation-delay: 0.16s; }
        .loading-dots .dot:nth-child(3) { animation-delay: 0.32s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* --- Checkmark draw --- */
        .check-path {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          animation: drawCheck 0.5s ease forwards;
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }

        /* --- SSL dot --- */
        .ssl-dot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          display: inline-block;
          animation: sslPulse 2s ease-in-out infinite;
        }
        @keyframes sslPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }

        /* --- Error shake --- */
        .error-shake {
          animation: shake 0.6s ease;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px); }
          30% { transform: translateX(10px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-2px); }
          90% { transform: translateX(2px); }
        }

        /* --- Success exit --- */
        .login-success {
          animation: successExit 0.8s ease forwards 0.4s;
        }
        @keyframes successExit {
          to { opacity: 0; transform: scale(0.92) translateY(-20px); filter: blur(4px); }
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
  const [sidebarLogoUrl, setSidebarLogoUrl] = useState('');
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('admin_token');

    // Validate stored token against /api/admin/me. If invalid, treat as no session.
    if (stored) {
      fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${stored}` },
      })
        .then((r) => {
          if (r.ok) {
            setToken(stored);
          } else {
            localStorage.removeItem('admin_token');
            setToken(null);
          }
        })
        .catch(() => {
          setToken(null);
        })
        .finally(() => setMounted(true));
    } else {
      setMounted(true);
    }

    fetch('/api/settings')
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.logo_url) setSidebarLogoUrl(data.logo_url);
      })
      .catch(() => {/* keep ShieldCheck fallback */});
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
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {sidebarLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sidebarLogoUrl}
                    alt="Logo"
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <ShieldCheck size={16} className="text-slate-800" />
                )}
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
