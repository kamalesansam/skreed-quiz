import type { Outcome } from '@/data/quiz';

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return 'https://quiz.skreed.com';
}

export function resultUrl(outcome: Outcome, name?: string): string {
  const base = `${siteUrl()}/result/${outcome.id}`;
  return name ? `${base}?n=${encodeURIComponent(name.trim())}` : base;
}

export function shareText(outcome: Outcome, name?: string): string {
  const who = name ? `${name.trim()} is` : "I'm";
  return `${who} ${outcome.name}. Signature shade: ${outcome.shade}. There are 240 personalities. Find yours with the Skreed Shade Diagnosis.`;
}

export const shareLinks = (outcome: Outcome, name?: string) => {
  const url = resultUrl(outcome, name);
  const text = shareText(outcome, name);
  return {
    url,
    text,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  };
};

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* permission denied or unsupported: fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
