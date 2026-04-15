'use client';

import { useEffect, useState } from 'react';

export interface LandingSection {
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
}

export interface LandingFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
}

export interface LandingBenefit {
  id: number;
  icon: string;
  title: string;
  description: string;
  orden: number;
}

export interface LandingIndustry {
  id: number;
  icon: string;
  name: string;
  orden: number;
}

export interface LandingMenuItem {
  id: number;
  label: string;
  href: string;
  orden: number;
}

export interface LandingSocialLink {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

export interface LandingContent {
  settings: Record<string, string>;
  sections: Record<string, LandingSection>;
  features: LandingFeature[];
  benefits: LandingBenefit[];
  industries: LandingIndustry[];
  menu: LandingMenuItem[];
  social: LandingSocialLink[];
}

// Poll every 30 s so admin edits appear automatically
const POLL_INTERVAL = 30000;

// In-memory cache shared across components on the same page
let cachedContent: LandingContent | null = null;
let cachedAt = 0;
const listeners = new Set<(data: LandingContent) => void>();

async function fetchContent(): Promise<LandingContent | null> {
  try {
    const res = await fetch('/api/content', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as LandingContent;
    cachedContent = data;
    cachedAt = Date.now();
    listeners.forEach((fn) => fn(data));
    return data;
  } catch {
    return null;
  }
}

let pollTimer: ReturnType<typeof setInterval> | null = null;

function ensurePolling(): void {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    if (listeners.size > 0) fetchContent();
  }, POLL_INTERVAL);
}

export function useLandingContent(): LandingContent | null {
  const [data, setData] = useState<LandingContent | null>(cachedContent);

  useEffect(() => {
    // Subscribe for future updates
    listeners.add(setData);

    // First fetch (or refresh if stale)
    if (!cachedContent || Date.now() - cachedAt > POLL_INTERVAL) {
      fetchContent();
    }

    ensurePolling();

    return () => {
      listeners.delete(setData);
    };
  }, []);

  return data;
}

export function useSection(key: string): LandingSection | null {
  const content = useLandingContent();
  return content?.sections?.[key] ?? null;
}
