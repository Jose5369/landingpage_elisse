'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';

type Resource = 'section' | 'setting' | 'feature' | 'benefit' | 'industry';

export interface PendingChange {
  resource: Resource;
  /** For sections: section_key. For settings: setting key. For feature/benefit/industry: numeric id as string. */
  key: string;
  field:
    | 'title'
    | 'subtitle'
    | 'content'
    | 'value'
    | 'description'
    | 'name'
    | 'badge'
    | 'extra_json'
    | 'orden';
  value: string;
}

interface EditModeContextValue {
  isAdmin: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  pendingChanges: PendingChange[];
  recordChange: (change: PendingChange) => void;
  saveAll: () => Promise<boolean>;
  discardAll: () => void;
  isSaving: boolean;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Verify admin token on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!token) return;

    fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev && pendingChanges.length > 0) {
        if (!confirm('Tienes cambios sin guardar. ¿Salir del modo edición y descartarlos?')) {
          return prev;
        }
        setPendingChanges([]);
      }
      return !prev;
    });
  }, [pendingChanges.length]);

  const recordChange = useCallback((change: PendingChange) => {
    setPendingChanges((prev) => {
      // Replace an existing change for the same resource+key+field, or append
      const idx = prev.findIndex(
        (c) => c.resource === change.resource && c.key === change.key && c.field === change.field
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = change;
        return next;
      }
      return [...prev, change];
    });
  }, []);

  const saveAll = useCallback(async (): Promise<boolean> => {
    if (pendingChanges.length === 0) return true;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // Group changes by resource type
      const sectionUpdates = new Map<string, Record<string, string>>();
      const settingUpdates: Record<string, string> = {};
      const featureUpdates = new Map<string, Record<string, string | number>>();
      const benefitUpdates = new Map<string, Record<string, string | number>>();
      const industryUpdates = new Map<string, Record<string, string | number>>();

      for (const change of pendingChanges) {
        if (change.resource === 'section') {
          const existing = sectionUpdates.get(change.key) ?? { section_key: change.key };
          existing[change.field] = change.value;
          sectionUpdates.set(change.key, existing);
        } else if (change.resource === 'setting') {
          settingUpdates[change.key] = change.value;
        } else if (change.resource === 'feature') {
          const existing = featureUpdates.get(change.key) ?? { id: Number(change.key) };
          existing[change.field] = change.value;
          featureUpdates.set(change.key, existing);
        } else if (change.resource === 'benefit') {
          const existing = benefitUpdates.get(change.key) ?? { id: Number(change.key) };
          existing[change.field] = change.value;
          benefitUpdates.set(change.key, existing);
        } else if (change.resource === 'industry') {
          const existing = industryUpdates.get(change.key) ?? { id: Number(change.key) };
          existing[change.field] = change.value;
          industryUpdates.set(change.key, existing);
        }
      }

      const requests: Promise<Response>[] = [];

      // Sections: batch array
      if (sectionUpdates.size > 0) {
        requests.push(
          fetch('/api/admin/sections', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(Array.from(sectionUpdates.values())),
          })
        );
      }

      // Settings: flat object
      if (Object.keys(settingUpdates).length > 0) {
        requests.push(
          fetch('/api/admin/settings', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(settingUpdates),
          })
        );
      }

      // Features/Benefits/Industries: one PUT per record
      for (const update of featureUpdates.values()) {
        requests.push(
          fetch('/api/admin/features', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(update),
          })
        );
      }
      for (const update of benefitUpdates.values()) {
        requests.push(
          fetch('/api/admin/benefits', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(update),
          })
        );
      }
      for (const update of industryUpdates.values()) {
        requests.push(
          fetch('/api/admin/industries', {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify(update),
          })
        );
      }

      const results = await Promise.all(requests);
      const allOk = results.every((r) => r.ok);

      if (allOk) {
        setPendingChanges([]);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [pendingChanges]);

  const discardAll = useCallback(() => {
    setPendingChanges([]);
  }, []);

  return (
    <EditModeContext.Provider
      value={{
        isAdmin,
        isEditMode,
        toggleEditMode,
        pendingChanges,
        recordChange,
        saveAll,
        discardAll,
        isSaving,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    // Graceful fallback for pages rendered without the provider
    return {
      isAdmin: false,
      isEditMode: false,
      toggleEditMode: () => {},
      pendingChanges: [] as PendingChange[],
      recordChange: () => {},
      saveAll: async () => false,
      discardAll: () => {},
      isSaving: false,
    } as EditModeContextValue;
  }
  return ctx;
}
