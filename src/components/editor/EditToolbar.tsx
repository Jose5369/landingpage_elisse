'use client';

import { useState } from 'react';
import { useEditMode } from '@/lib/editMode';
import { Pencil, Save, X, Loader2, Check, LogOut } from 'lucide-react';

export default function EditToolbar() {
  const {
    isAdmin,
    isEditMode,
    toggleEditMode,
    pendingChanges,
    saveAll,
    discardAll,
    isSaving,
  } = useEditMode();
  const [feedback, setFeedback] = useState<'idle' | 'saved' | 'error'>('idle');

  if (!isAdmin) return null;

  async function handleSave() {
    const ok = await saveAll();
    setFeedback(ok ? 'saved' : 'error');
    setTimeout(() => setFeedback('idle'), 2200);
    if (ok) {
      // Trigger a refresh of the content cache so subsequent pages show new data
      fetch('/api/content', { cache: 'no-store' });
    }
  }

  const hasChanges = pendingChanges.length > 0;

  return (
    <>
      {/* Top thin banner indicating admin mode */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 pointer-events-none" />

      {/* Floating toolbar bottom-center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9998]">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl px-2 py-2 flex items-center gap-1">
          {/* Edit mode toggle */}
          <button
            onClick={toggleEditMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isEditMode
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Pencil size={14} />
            {isEditMode ? 'Editando' : 'Editar página'}
          </button>

          {isEditMode && (
            <>
              {/* Separator */}
              <div className="w-px h-6 bg-white/10 mx-1" />

              {/* Pending changes count */}
              <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400">
                {hasChanges ? (
                  <>
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                    <span className="text-amber-300">
                      {pendingChanges.length} cambio{pendingChanges.length !== 1 ? 's' : ''}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500">Sin cambios</span>
                )}
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  hasChanges && !isSaving
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {isSaving ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : feedback === 'saved' ? (
                  <Check size={12} />
                ) : (
                  <Save size={12} />
                )}
                {isSaving ? 'Guardando' : feedback === 'saved' ? 'Guardado' : 'Guardar'}
              </button>

              {/* Discard */}
              <button
                onClick={() => {
                  if (
                    hasChanges &&
                    !confirm('¿Descartar todos los cambios sin guardar?')
                  )
                    return;
                  discardAll();
                  toggleEditMode();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={12} />
                Salir
              </button>
            </>
          )}

          {!isEditMode && (
            <>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <a
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition"
                title="Ir al panel admin"
              >
                <LogOut size={12} />
                Admin
              </a>
            </>
          )}
        </div>

        {/* Error toast */}
        {feedback === 'error' && (
          <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            Error al guardar. Intenta de nuevo.
          </div>
        )}
      </div>

      {/* Helper tooltip while in edit mode */}
      {isEditMode && (
        <div className="fixed top-4 right-4 z-[9998] bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 shadow-2xl max-w-xs pointer-events-none">
          <p className="font-semibold text-white mb-1">Modo edición activo</p>
          <p className="text-slate-400 leading-relaxed">
            Haz clic en cualquier texto destacado para editarlo. Presiona{' '}
            <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Enter</kbd> para
            confirmar o <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>{' '}
            para cancelar.
          </p>
        </div>
      )}
    </>
  );
}
