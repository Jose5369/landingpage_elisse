import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface PageData {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published?: boolean | number;
  updated_at?: string;
}

async function getPage(slug: string): Promise<PageData | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://elisesystem.com");

    const res = await fetch(`${baseUrl}/api/admin/pages/${slug}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data as PageData;
  } catch {
    return null;
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    return {
      title: "Página no encontrada - ELISE SYSTEM",
    };
  }

  return {
    title: page.meta_title || `${page.title} - ELISE SYSTEM`,
    description:
      page.meta_description ||
      "ELISE SYSTEM - Sistema POS Inteligente para tu negocio.",
    keywords: page.meta_keywords,
    openGraph: {
      title: page.meta_title || `${page.title} - ELISE SYSTEM`,
      description:
        page.meta_description ||
        "ELISE SYSTEM - Sistema POS Inteligente para tu negocio.",
      type: "article",
    },
  };
}

export default async function SlugPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  const isPublished =
    page.is_published === true || page.is_published === 1;

  if (!isPublished) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          {/* Page header */}
          <header className="mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
              {page.title}
            </h1>
            {page.updated_at && (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Última actualización:{" "}
                {new Date(page.updated_at).toLocaleDateString("es-DO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </header>

          {/* Page content */}
          <article
            className="prose prose-gray dark:prose-invert prose-a:text-blue-600 dark:prose-a:text-blue-400 max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
