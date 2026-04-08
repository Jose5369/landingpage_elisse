'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { adminGet, adminPut, adminDelete } from '@/lib/adminApi';
import TiptapEditor from '@/components/admin/TiptapEditor';
import {
  Save,
  Trash2,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import Link from 'next/link';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  published: number;
  created_at: string;
  updated_at: string;
}

interface PageResponse {
  page: Page;
}

export default function PageEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();

  const [page, setPage] = useState<Page | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    meta_title: '',
    meta_description: '',
    published: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    adminGet<PageResponse>(`/pages/${slug}`)
      .then((data) => {
        setPage(data.page);
        setForm({
          title: data.page.title,
          slug: data.page.slug,
          content: data.page.content ?? '',
          meta_title: data.page.meta_title ?? '',
          meta_description: data.page.meta_description ?? '',
          published: data.page.published,
        });
      })
      .catch(() => toast.error('Error al cargar la página'))
      .finally(() => setLoading(false));
  }, [slug]);

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const data = await adminPut<PageResponse>(`/pages/${slug}`, form);
      toast.success('Página guardada');
      setPage(data.page);
      // If slug changed, navigate to new URL
      if (data.page.slug !== slug) {
        router.push(`/admin/pages/${data.page.slug}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar la página "${form.title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    try {
      await adminDelete(`/pages/${slug}`);
      toast.success('Página eliminada');
      router.push('/admin/pages');
    } catch {
      toast.error('Error al eliminar página');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Página no encontrada</p>
        <Link href="/admin/pages" className="text-sm text-slate-700 underline mt-2 block">
          Volver a páginas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pages"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Editor de Página</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-mono">{page.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => set('published', form.published ? 0 : 1)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border transition ${
              form.published
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {form.published ? <Eye size={15} /> : <EyeOff size={15} />}
            {form.published ? 'Publicada' : 'Borrador'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-60"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            Eliminar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Main form */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left column: content */}
        <div className="col-span-3 lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
            <label className="block text-sm font-medium text-slate-700">Título de la página</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Acerca de nosotros"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Rich text editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 px-1">Contenido</label>
            <TiptapEditor
              content={form.content}
              onChange={(html) => set('content', html)}
            />
          </div>
        </div>

        {/* Right column: meta */}
        <div className="col-span-3 lg:col-span-1 space-y-4">
          {/* Slug */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">URL y Slug</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="acerca-de-nosotros"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <p className="text-xs text-slate-400 mt-1">/{form.slug}</p>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">SEO</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Meta Title
                <span className="ml-1 text-slate-400 font-normal">({form.meta_title.length}/60)</span>
              </label>
              <input
                type="text"
                value={form.meta_title}
                onChange={(e) => set('meta_title', e.target.value)}
                maxLength={60}
                placeholder="Título para SEO"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Meta Description
                <span className="ml-1 text-slate-400 font-normal">({form.meta_description.length}/160)</span>
              </label>
              <textarea
                rows={3}
                value={form.meta_description}
                onChange={(e) => set('meta_description', e.target.value)}
                maxLength={160}
                placeholder="Descripción para motores de búsqueda…"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-xs text-slate-500">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">Información</h3>
            <div className="flex justify-between">
              <span>Creada</span>
              <span>{new Date(page.created_at).toLocaleDateString('es-DO')}</span>
            </div>
            <div className="flex justify-between">
              <span>Modificada</span>
              <span>{new Date(page.updated_at).toLocaleDateString('es-DO')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
