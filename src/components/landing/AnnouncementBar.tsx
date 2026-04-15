'use client';

import { useLandingContent } from '@/lib/useLandingContent';

const DEFAULT_TEXT = 'Nuevo: ELISE SYSTEM v3.0 ya disponible con IA integrada.';
const DEFAULT_LINK_TEXT = 'Conoce más →';
const DEFAULT_LINK_HREF = '#features';

export default function AnnouncementBar() {
  const content = useLandingContent();

  // Admin can hide the bar entirely
  if (content?.settings?.announcement_active === '0') return null;

  const text = content?.settings?.announcement_text || DEFAULT_TEXT;
  const linkText = content?.settings?.announcement_link_text ?? DEFAULT_LINK_TEXT;
  const linkHref = content?.settings?.announcement_link_href || DEFAULT_LINK_HREF;

  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm font-medium text-white"
      style={{ backgroundColor: 'var(--primary)' }}
    >
      <span>{text}</span>
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
