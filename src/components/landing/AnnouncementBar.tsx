interface AnnouncementBarProps {
  text?: string;
  linkText?: string;
  linkHref?: string;
}

export default function AnnouncementBar({
  text = "Nuevo: ELISE SYSTEM v3.0 ya disponible con IA integrada.",
  linkText = "Conoce más →",
  linkHref = "#features",
}: AnnouncementBarProps) {
  return (
    <div
      className="w-full py-2.5 px-4 text-center text-sm font-medium text-white"
      style={{ backgroundColor: "var(--primary)" }}
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
