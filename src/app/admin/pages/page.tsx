'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { adminGet, adminPost, adminDelete } from '@/lib/adminApi';
import {
  Plus,
  Trash2,
  Pencil,
  Loader2,
  FileText,
  Eye,
  EyeOff,
  X,
  Check,
} from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  meta_title: string;
  meta_description: string;
  published: number;
  created_at: string;
  updated_at: string;
}

interface PagesResponse {
  pages: Page[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-DO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function PagesListPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', slug: '' });
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function load() {
    try {
      const data = await adminGet<PagesResponse>('/pages');
      setPages(data.pages);
    } catch {
      toast.error('Error al cargar páginas');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleTitleChange(title: string) {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setNewForm({ title, slug });
  }

  async function handleCreate() {
    if (!newForm.title || !newForm.slug) {
      toast.error('Título y slug son requeridos');
      return;
    }
    setCreating(true);
    try {
      const data = await adminPost<{ page: Page }>('/pages', { title: newForm.title, slug: newForm.slug });
      toast.success('Página creada');
      setShowNew(false);
      setNewForm({ title: '', slug: '' });
      router.push(`/admin/pages/${data.page.slug}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear página';
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`¿Eliminar la página "${title}"? Esta acción no se puede deshacer.`)) return;
    try {
      await adminDelete(`/pages/${slug}`);
      toast.success('Página eliminada');
      setPages((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      toast.error('Error al eliminar página');
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Páginas</h2>
          <p className="text-sm text-slate-500 mt-1">Gestiona las páginas del sitio</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
        >
          <Plus size={16} />
          Nueva página
        </button>
      </div>

      {/* New page quick-create form */}
      {showNew && (
        <div className="bg-white rounded-2xl border-2 border-slate-900 p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 text-sm">Nueva página</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Título *</label>
              <input
                type="text"
                value={newForm.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Acerca de nosotros"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Slug *</label>
              <input
                type="text"
                value={newForm.slug}
                onChange={(e) => setNewForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="acerca-de-nosotros"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Crear y editar
            </button>
            <button
              onClick={() => { setShowNew(false); setNewForm({ title: '', slug: '' }); }}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={14} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 text-center py-14 text-slate-400">
          <FileText size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No hay páginas todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Título</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Creada</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-slate-800">{page.title}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <code className="text-xs text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded">{page.slug}</code>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500 hidden md:table-cell">
                    {formatDate(page.created_at)}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.published
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {page.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {page.published ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/pages/${page.slug}`}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page.slug, page.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
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
  );
}
