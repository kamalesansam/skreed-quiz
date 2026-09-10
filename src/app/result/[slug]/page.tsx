import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { OUTCOME_SLUGS, outcomeBySlug } from '@/data/quiz';
import SharedResult from '@/components/quiz/SharedResult';

type Params = { slug: string };
type Search = { n?: string };

export function generateStaticParams() {
  return OUTCOME_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { n } = await searchParams;
  const outcome = outcomeBySlug(slug);
  if (!outcome) return { title: 'Not found' };
  const name = (n || '').slice(0, 40);
  const title = name ? `${name} is ${outcome.name}` : outcome.name;
  const description = `Signature shade: ${outcome.shade}. ${outcome.tagline} There are 240 personalities. Find yours.`;
  const og = `/api/og?slug=${outcome.id}${name ? `&n=${encodeURIComponent(name)}` : ''}`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { slug } = await params;
  const { n } = await searchParams;
  const outcome = outcomeBySlug(slug);
  if (!outcome) notFound();
  return <SharedResult outcomeId={outcome.id} name={(n || '').slice(0, 40)} />;
}
