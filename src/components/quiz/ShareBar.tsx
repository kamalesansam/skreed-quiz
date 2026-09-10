'use client';

import { useState } from 'react';
import { CopySimple, DownloadSimple, FacebookLogo, InstagramLogo, LinkedinLogo, WhatsappLogo } from '@phosphor-icons/react';
import type { Outcome } from '@/data/quiz';
import { copyText, resultUrl, shareLinks, shareText } from '@/lib/share';
import { renderStoryCard } from '@/lib/resultCard';
import { track } from '@/lib/analytics';
import { useToast } from '@/components/ui/Toast';

type Props = { outcome: Outcome; name: string };

/**
 * WhatsApp, Instagram Story (generated 1080 x 1920 card), Facebook, LinkedIn, copy link.
 * Every path has a fallback: no share sheet becomes a download, no clipboard becomes a prompt.
 */
export function ShareBar({ outcome, name }: Props) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const links = shareLinks(outcome, name);

  const open = (url: string, channel: string) => {
    track('quiz_share', { channel, outcome: outcome.id });
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const story = async () => {
    if (busy) return;
    setBusy(true);
    track('quiz_share', { channel: 'instagram_story', outcome: outcome.id });
    try {
      const blob = await renderStoryCard({ name, outcome, url: resultUrl(outcome, name) });
      const file = new File([blob], `skreed-shade-diagnosis-${outcome.id}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({ files: [file], title: outcome.name, text: shareText(outcome, name) });
          return;
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      const copied = await copyText(shareText(outcome, name));
      toast(copied ? 'Story card saved. Caption copied.' : 'Story card saved.');
    } catch {
      toast('Could not build the story card. Try the link instead.', 'warn');
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    track('quiz_share', { channel: 'copy', outcome: outcome.id });
    const ok = await copyText(links.url);
    toast(ok ? 'Link copied' : 'Copy blocked. Long-press the link to copy it.', ok ? 'ok' : 'warn');
  };

  const cls = 'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors hover:border-current hairline';

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={cls} onClick={() => open(links.whatsapp, 'whatsapp')}>
        <WhatsappLogo size={18} weight="bold" /> WhatsApp
      </button>
      <button type="button" className={cls} onClick={story} disabled={busy} aria-busy={busy}>
        <InstagramLogo size={18} weight="bold" /> {busy ? 'Building card' : 'Instagram Story'}
      </button>
      <button type="button" className={cls} onClick={() => open(links.facebook, 'facebook')}>
        <FacebookLogo size={18} weight="bold" /> Facebook
      </button>
      <button type="button" className={cls} onClick={() => open(links.linkedin, 'linkedin')}>
        <LinkedinLogo size={18} weight="bold" /> LinkedIn
      </button>
      <button type="button" className={cls} onClick={copy}>
        <CopySimple size={18} weight="bold" /> Copy link
      </button>
      <button type="button" className={cls} onClick={story} disabled={busy} aria-label="Download the story card">
        <DownloadSimple size={18} weight="bold" /> Save card
      </button>
    </div>
  );
}
