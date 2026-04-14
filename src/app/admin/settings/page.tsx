'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { adminGet, adminPut } from '@/lib/adminApi';
import { Save, Loader2, Upload, RotateCcw } from 'lucide-react';

interface SettingsResponse {
  grouped: Record<string, Record<string, string>>;
}

interface GeneralSettings {
  site_name: string;
  primary_color: string;
  font_family: string;
  logo_icon: string;
  system_url: string;
}

interface BrandingSettings {
  logo_url: string;
  logo_white_url: string;
  favicon_url: string;
  logo_height: string;
}

const defaultSettings: GeneralSettings = {
  site_name: '',
  primary_color: '#007fff',
  font_family: 'Inter',
  logo_icon: '',
  system_url: '',
};

const defaultBranding: BrandingSettings = {
  logo_url: '/logos/logo-elise.png',
  logo_white_url: '/logos/logo-white.png',
  favicon_url: '/logos/icono-elise.png',
  logo_height: '40',
};

// ── Logo upload field ──────────────────────────────────────────────────────────
interface LogoFieldProps {
  label: string;
  description?: string;
  fieldKey: keyof BrandingSettings;
  value: string;
  previewBg?: string;
  previewSize?: number;
  uploadType: 'logo' | 'logo_white' | 'favicon';
  onChange: (key: keyof BrandingSettings, value: string) => void;
  onReset?: () => void;
  resetValue?: string;
}

function LogoField({
  label,
  description,
  value,
  previewBg = 'bg-white',
  previewSize = 64,
  uploadType,
  onChange,
  fieldKey,
  onReset,
  resetValue,
}: LogoFieldProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo supera el límite de 2 MB');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('type', uploadType);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
        body: fd,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? 'Error al subir archivo');
        return;
      }
      onChange(fieldKey, data.url!);
      toast.success('Imagen subida correctamente');
    } catch {
      toast.error('Error de conexión al subir imagen');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-start gap-4">
      <div className="sm:w-48 shrink-0">
        <label className="block text-sm font-medium text-slate-700">{label}</label>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
        <p className="text-xs text-slate-400 mt-0.5">Máx. 2 MB · PNG/JPG/WebP/SVG</p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {/* Preview */}
        <div
          className={`relative flex items-center justify-center rounded-lg border border-slate-200 overflow-hidden ${previewBg}`}
          style={{ width: previewSize + 16, height: previewSize + 16 }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt={label}
              style={{ maxWidth: previewSize, maxHeight: previewSize, objectFit: 'contain' }}
            />
          ) : (
            <span className="text-xs text-slate-400">Sin imagen</span>
          )}
        </div>

        {/* URL input row */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(fieldKey, e.target.value)}
            placeholder="/logos/mi-logo.png"
            className="flex-1 px-3.5 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          {/* Upload button */}
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
          >
            {uploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            {uploading ? 'Subiendo…' : 'Subir nuevo'}
          </button>
          {/* Reset button */}
          {onReset && resetValue && (
            <button
              type="button"
              onClick={() => { onChange(fieldKey, resetValue); onReset(); }}
              title="Restaurar valor por defecto"
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs px-2.5 py-2 rounded-lg border border-slate-200 hover:border-slate-400 transition shrink-0"
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [form, setForm] = useState<GeneralSettings>(defaultSettings);
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);

  useEffect(() => {
    adminGet<SettingsResponse>('/settings')
      .then((data) => {
        const g = data.grouped.general ?? {};
        const b = data.grouped.branding ?? {};
        setForm({
          site_name: g.site_name ?? '',
          primary_color: g.primary_color ?? '#007fff',
          font_family: g.font_family ?? 'Inter',
          logo_icon: g.logo_icon ?? '',
          system_url: g.system_url ?? '',
        });
        setBranding({
          logo_url: b.logo_url ?? defaultBranding.logo_url,
          logo_white_url: b.logo_white_url ?? defaultBranding.logo_white_url,
          favicon_url: b.favicon_url ?? defaultBranding.favicon_url,
          logo_height: b.logo_height ?? defaultBranding.logo_height,
        });
      })
      .catch(() => toast.error('Error al cargar ajustes'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminPut('/settings', form);
      toast.success('Ajustes guardados correctamente');
    } catch {
      toast.error('Error al guardar ajustes');
    } finally {
      setSaving(false);
    }
  }

  async function handleBrandingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingBranding(true);
    try {
      await adminPut('/settings', branding);
      toast.success('Configuración de logos guardada');
    } catch {
      toast.error('Error al guardar logos');
    } finally {
      setSavingBranding(false);
    }
  }

  function set(key: keyof GeneralSettings, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setBrandingField(key: keyof BrandingSettings, value: string) {
    setBranding((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Ajustes Generales</h2>
        <p className="text-sm text-slate-500 mt-1">Configuración principal del sitio</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
        {/* site_name */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Nombre del sitio</label>
            <p className="text-xs text-slate-400 mt-0.5">Título principal del negocio</p>
          </div>
          <input
            type="text"
            value={form.site_name}
            onChange={(e) => set('site_name', e.target.value)}
            placeholder="Mi Empresa"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* primary_color */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Color primario</label>
            <p className="text-xs text-slate-400 mt-0.5">Color principal de la marca</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => set('primary_color', e.target.value)}
              className="w-12 h-10 rounded-lg border border-slate-200 cursor-pointer p-1"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => set('primary_color', e.target.value)}
              placeholder="#007fff"
              className="w-36 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* font_family */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Fuente tipográfica</label>
            <p className="text-xs text-slate-400 mt-0.5">Familia de fuente principal</p>
          </div>
          <select
            value={form.font_family}
            onChange={(e) => set('font_family', e.target.value)}
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Poppins">Poppins</option>
            <option value="Lato">Lato</option>
            <option value="Nunito">Nunito</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>

        {/* logo_icon */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Ícono del logo</label>
            <p className="text-xs text-slate-400 mt-0.5">Nombre de ícono o código</p>
          </div>
          <input
            type="text"
            value={form.logo_icon}
            onChange={(e) => set('logo_icon', e.target.value)}
            placeholder="store"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* system_url */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">URL del sistema</label>
            <p className="text-xs text-slate-400 mt-0.5">Link de acceso al sistema</p>
          </div>
          <input
            type="url"
            value={form.system_url}
            onChange={(e) => set('system_url', e.target.value)}
            placeholder="https://app.miempresa.com"
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Save button */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* ── Logos y marca ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Logos y marca</h2>
        <p className="text-sm text-slate-500 mt-1">Imágenes de logotipo y favicon del sitio</p>
      </div>

      <form
        onSubmit={handleBrandingSubmit}
        className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100"
      >
        {/* logo_url */}
        <LogoField
          label="Logo principal"
          description="Se muestra en la barra de navegación y el footer"
          fieldKey="logo_url"
          value={branding.logo_url}
          uploadType="logo"
          onChange={setBrandingField}
          previewBg="bg-slate-50"
          previewSize={80}
          onReset={() => {}}
          resetValue={defaultBranding.logo_url}
        />

        {/* logo_white_url */}
        <LogoField
          label="Logo blanco"
          description="Para fondos oscuros (footer, header oscuro)"
          fieldKey="logo_white_url"
          value={branding.logo_white_url}
          uploadType="logo_white"
          onChange={setBrandingField}
          previewBg="bg-slate-800"
          previewSize={80}
          onReset={() => {}}
          resetValue={defaultBranding.logo_white_url}
        />

        {/* favicon_url */}
        <LogoField
          label="Favicon / Ícono"
          description="Aparece en la pestaña del navegador (recomendado 32×32 px)"
          fieldKey="favicon_url"
          value={branding.favicon_url}
          uploadType="favicon"
          onChange={setBrandingField}
          previewBg="bg-white"
          previewSize={32}
          onReset={() => {}}
          resetValue={defaultBranding.favicon_url}
        />

        {/* logo_height */}
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="sm:w-48 shrink-0">
            <label className="block text-sm font-medium text-slate-700">Altura del logo</label>
            <p className="text-xs text-slate-400 mt-0.5">Altura en píxeles en el navbar</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={16}
              max={120}
              value={branding.logo_height}
              onChange={(e) => setBrandingField('logo_height', e.target.value)}
              className="w-24 px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <span className="text-sm text-slate-500">px</span>
            {branding.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={branding.logo_url}
                alt="Preview"
                style={{ height: Number(branding.logo_height) || 40, maxWidth: 200, objectFit: 'contain' }}
                className="border border-slate-200 rounded p-1"
              />
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="px-6 py-4 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            type="submit"
            disabled={savingBranding}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {savingBranding ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingBranding ? 'Guardando…' : 'Guardar logos'}
          </button>
        </div>
      </form>
    </div>
  );
}
