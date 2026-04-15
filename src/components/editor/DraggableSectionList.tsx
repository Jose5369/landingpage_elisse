'use client';

import { useState, useEffect, ReactElement } from 'react';
import { useLandingContent } from '@/lib/useLandingContent';
import { useEditMode } from '@/lib/editMode';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Dynamic list of landing sections that can be reordered via drag-and-drop
 * when the admin is in edit mode.
 *
 * Each entry maps a section_key to the JSX element to render. The render order
 * is determined by the `orden` column in the database (with pending edits
 * applied on top), so the user's drag operations show instantly and are then
 * persisted via the edit mode save mechanism.
 */
interface Props {
  sectionMap: Record<string, ReactElement>;
}

export default function DraggableSectionList({ sectionMap }: Props) {
  const content = useLandingContent();
  const { isAdmin, isEditMode, recordChange, pendingChanges } = useEditMode();

  // Local order state (for optimistic drag updates)
  const [order, setOrder] = useState<string[]>([]);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Sync local order with content — applying any pending orden changes
  useEffect(() => {
    if (!content?.sections) return;
    const entries = Object.entries(content.sections)
      .filter(([key]) => key in sectionMap)
      .map(([key, sec]) => {
        // Check if there's a pending orden change for this section
        const pending = pendingChanges.find(
          (c) => c.resource === 'section' && c.key === key && c.field === 'orden'
        );
        const orden = pending ? Number(pending.value) : sec.orden ?? 999;
        return { key, orden };
      })
      .sort((a, b) => a.orden - b.orden);

    setOrder(entries.map((e) => e.key));
  }, [content?.sections, pendingChanges, sectionMap]);

  const editable = isAdmin && isEditMode;

  function moveSection(fromKey: string, toKey: string) {
    if (fromKey === toKey) return;
    const newOrder = [...order];
    const fromIdx = newOrder.indexOf(fromKey);
    const toIdx = newOrder.indexOf(toKey);
    if (fromIdx === -1 || toIdx === -1) return;
    newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, fromKey);
    setOrder(newOrder);

    // Record orden changes for every affected section so they persist on save
    newOrder.forEach((key, idx) => {
      recordChange({
        resource: 'section',
        key,
        field: 'orden',
        value: String(idx + 1),
      });
    });
  }

  function moveByDelta(key: string, delta: -1 | 1) {
    const idx = order.indexOf(key);
    const target = order[idx + delta];
    if (!target) return;
    moveSection(key, target);
  }

  // Fallback: if content hasn't loaded yet, render sections in the declaration
  // order of the sectionMap so the page isn't blank.
  const keysToRender = order.length > 0 ? order : Object.keys(sectionMap);

  return (
    <>
      {keysToRender.map((key, idx) => {
        const el = sectionMap[key];
        if (!el) return null;

        if (!editable) {
          // Regular render: just output the element
          return <div key={key}>{el}</div>;
        }

        const isDragging = draggingKey === key;
        const isTarget = dropTarget === key && draggingKey !== key;

        return (
          <div
            key={key}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', key);
              e.dataTransfer.effectAllowed = 'move';
              setDraggingKey(key);
            }}
            onDragEnd={() => {
              setDraggingKey(null);
              setDropTarget(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (draggingKey && draggingKey !== key) setDropTarget(key);
            }}
            onDragLeave={() => {
              if (dropTarget === key) setDropTarget(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              const from = e.dataTransfer.getData('text/plain');
              if (from) moveSection(from, key);
              setDropTarget(null);
            }}
            className={`group relative transition-all ${
              isDragging ? 'opacity-40 scale-[0.99]' : ''
            } ${isTarget ? 'ring-4 ring-blue-500 ring-inset' : ''}`}
          >
            {/* Floating section controls (only when editable) */}
            <div
              className="absolute top-4 right-4 z-50 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Drag handle */}
              <div
                className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-xl cursor-move select-none border border-white/10"
                title={`Arrastra para reordenar • ${key}`}
              >
                <GripVertical size={14} />
                <span className="uppercase tracking-wider text-[10px]">{key}</span>
              </div>

              {/* Up/down buttons */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  moveByDelta(key, -1);
                }}
                disabled={idx === 0}
                className="bg-slate-900/95 backdrop-blur text-white p-2 rounded-lg shadow-xl disabled:opacity-30 hover:bg-blue-600 transition border border-white/10"
                title="Mover arriba"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  moveByDelta(key, 1);
                }}
                disabled={idx === keysToRender.length - 1}
                className="bg-slate-900/95 backdrop-blur text-white p-2 rounded-lg shadow-xl disabled:opacity-30 hover:bg-blue-600 transition border border-white/10"
                title="Mover abajo"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            {el}
          </div>
        );
      })}
    </>
  );
}
