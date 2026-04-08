'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGet } from '@/lib/adminApi';
import {
  FileText,
  Zap,
  Layers,
  CheckCircle,
  Building2,
  ArrowRight,
  Settings,
  Menu,
  Share2,
  Search,
} from 'lucide-react';

interface DashboardStats {
  pages: number;
  features: number;
  benefits: number;
  sections: number;
  industries: number;
}

const quickLinks = [
  { href: '/admin/settings', label: 'Ajustes Generales', icon: Settings, color: 'bg-slate-100 text-slate-700' },
  { href: '/admin/seo', label: 'SEO', icon: Search, color: 'bg-blue-50 text-blue-700' },
  { href: '/admin/menu', label: 'Gestionar Menú', icon: Menu, color: 'bg-violet-50 text-violet-700' },
  { href: '/admin/pages', label: 'Nueva Página', icon: FileText, color: 'bg-emerald-50 text-emerald-700' },
  { href: '/admin/social', label: 'Redes Sociales', icon: Share2, color: 'bg-pink-50 text-pink-700' },
  { href: '/admin/sections', label: 'Secciones', icon: Layers, color: 'bg-amber-50 text-amber-700' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ pages: 0, features: 0, benefits: 0, sections: 0, industries: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [pagesRes, featuresRes, benefitsRes, sectionsRes, industriesRes] = await Promise.allSettled([
          adminGet<{ pages: unknown[] }>('/pages'),
          adminGet<{ features: unknown[] }>('/features'),
          adminGet<{ benefits: unknown[] }>('/benefits'),
          adminGet<{ sections: unknown[] }>('/sections'),
          adminGet<{ industries: unknown[] }>('/industries'),
        ]);

        setStats({
          pages: pagesRes.status === 'fulfilled' ? pagesRes.value.pages.length : 0,
          features: featuresRes.status === 'fulfilled' ? featuresRes.value.features.length : 0,
          benefits: benefitsRes.status === 'fulfilled' ? benefitsRes.value.benefits.length : 0,
          sections: sectionsRes.status === 'fulfilled' ? sectionsRes.value.sections.length : 0,
          industries: industriesRes.status === 'fulfilled' ? industriesRes.value.industries.length : 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Páginas', value: stats.pages, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/admin/pages' },
    { label: 'Funciones Activas', value: stats.features, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-50', href: '/admin/features' },
    { label: 'Secciones', value: stats.sections, icon: Layers, color: 'text-violet-600', bg: 'bg-violet-50', href: '/admin/sections' },
    { label: 'Beneficios', value: stats.benefits, icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50', href: '/admin/benefits' },
    { label: 'Industrias', value: stats.industries, icon: Building2, color: 'text-pink-600', bg: 'bg-pink-50', href: '/admin/industries' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="bg-slate-800 rounded-2xl px-8 py-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Bienvenido al Panel de Administración</h2>
        <p className="text-slate-300 text-sm">
          Gestiona el contenido, ajustes y configuración de tu landing page desde aquí.
        </p>
      </div>

      {/* Stat cards */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Resumen</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} mb-3`}>
                  <Icon size={20} className={card.color} />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {loading ? (
                    <div className="h-7 w-8 bg-slate-100 rounded animate-pulse" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">{card.label}</div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Accesos Rápidos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:shadow-md hover:border-slate-300 transition group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${link.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1">{link.label}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 transition" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
