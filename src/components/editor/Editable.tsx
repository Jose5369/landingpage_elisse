'use client';

import { useEffect, useRef, useState, createElement } from 'react';
import { useEditMode, PendingChange } from '@/lib/editMode';

interface EditableProps {
  /** Resource identifier (section_key, setting key, or numeric id as string). */
  resourceKey: string;
  /** Resource type. */
  resource: 'section' | 'setting' | 'feature' | 'benefit' | 'industry';
  /** Field within the resource to edit. */
  field:
    | 'title'
    | 'subtitle'
    | 'content'
    | 'value'
    | 'description'
    | 'name'
    | 'badge'
    | 'extra_json';
  /** The current value coming from the data source (server/cache). */
  value: string;
  /** Element to render as the editable container. */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4';
  /** Extra class names forwarded to the element. */
  className?: string;
  /** Fallback text shown when value is empty and edit mode is off. */
  placeholder?: string;
}

/**
 * Wraps text that the admin can edit inline.
 *
 * Behavior:
 * - When not in edit mode → renders value as plain text.
 * - When in edit mode → becomes contentEditable with an outline on hover/focus.
 * - On blur, records the change into the edit mode store if it differs.
 */
export default function Editable({
  resourceKey,
  resource,
  field,
  value,
  as: Tag = 'span',
  className = '',
  placeholder = 'Haz clic para editar…',
}: EditableProps) {
  const { isAdmin, isEditMode, recordChange, pendingChanges } = useEditMode();
  const ref = useRef<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Current value after any pending edit (so subsequent renders don't lose it)
  const pending = pendingChanges.find(
    (c) => c.resource === resource && c.key === resourceKey && c.field === field
  );
  const currentValue = pending?.value ?? value;

  // Sync the DOM text whenever the value (from props or pending) changes and we're
  // NOT currently editing that node (to avoid caret jumps while the user types).
  useEffect(() => {
    if (!ref.current) return;
    if (document.activeElement === ref.current) return;
    if (ref.current.innerText !== currentValue) {
      ref.current.innerText = currentValue;
    }
  }, [currentValue]);

  if (!isAdmin || !isEditMode) {
    // Read-only render
    return (
      <Tag className={className}>{currentValue || ''}</Tag>
    );
  }

  const outlineClass = isHovered
    ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-white rounded'
    : 'ring-1 ring-blue-300/60 ring-offset-1 rounded';

  // We use a custom element via createElement because JSX doesn't allow dynamic
  // refs for string tags with strict typing — simpler to spread props.
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const nextValue = e.currentTarget.innerText;
    if (nextValue !== value) {
      const change: PendingChange = {
        resource,
        key: resourceKey,
        field,
        value: nextValue,
      };
      recordChange(change);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    // Enter blurs the field (saves) instead of inserting newlines in single-line fields
    if (Tag !== 'div' && Tag !== 'p' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
    }
    // Escape discards the current edit and restores the original text
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.currentTarget as HTMLElement).innerText = currentValue;
      (e.currentTarget as HTMLElement).blur();
    }
  };

  // Use createElement so we can pass a dynamic tag name without TS complaining
  // about the ref type for each possible HTML element.
  return createElement(
    Tag,
    {
      ref: (el: HTMLElement | null) => {
        ref.current = el;
      },
      className: `${className} ${outlineClass} cursor-text outline-none transition-all px-0.5`,
      contentEditable: true,
      suppressContentEditableWarning: true,
      'data-edit-key': `${resource}:${resourceKey}:${field}`,
      'data-placeholder': placeholder,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    },
    currentValue || ''
  );
}
