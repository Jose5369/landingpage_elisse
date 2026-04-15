'use client';

import { useLandingContent } from '@/lib/useLandingContent';
import Editable from '@/components/editor/Editable';
import { useEditMode } from '@/lib/editMode';

const DEFAULT_TEXT = 'Nuevo: ELISE SYSTEM v3.0 ya disponible con IA integrada.';
const DEFAULT_LINK_TEXT = 'Conoce más →';
const DEFAULT_LINK_HREF = '#features';

export default function AnnouncementBar() {
  const content = useLandingContent();
  const { isEditMode } = useEditMode();

  // Admin can hide the bar entirely — but keep it visible in edit mode so the
  // admin can turn it back on by editing the text.
  if (content?.settings?.announcement_active === '0' && !isEditMode) return null;

  const text = content?.settings?.announcement_text || DEFAULT_TEXT;
  const linkText = content?.settings?.announcement_link_text ?? DEFAULT_LINK_TEXT;
  const linkHref = content?.settings?.announcement_link_href || DEFAULT_LINK_HREF;

  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm font-medium text-white"
      style={{ backgroundColor: 'var(--primary)' }}
    >
      <Editable
        as="span"
        resource="setting"
        resourceKey="announcement_text"
        field="value"
        value={text}
      />
      {linkText && linkHref && (
        <a
          href={linkHref}
          className="ml-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {linkText}
        </a>
      )}
    </div>
  );
}
