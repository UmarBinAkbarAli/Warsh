import type { Metadata } from 'next';
import Link from 'next/link';
import { Section, Eyebrow } from '../components/Section';
import { getBlogPosts } from '@/content/blog';
import { buildSearchIndex } from '@/content/search';
import { SiteSearch } from '../components/SiteSearch';

export const metadata: Metadata = {
  title: 'Fusha Arabic Learning Notes',
  description:
    'Practical guidance on Quranic and Classical Arabic, vocabulary, grammar, and building foundations for a lasting Fusha learning practice.',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const [blogPosts, searchIndex] = await Promise.all([getBlogPosts(), buildSearchIndex()]);

  return (
    <Section padded={false} className="pb-16 pt-14 md:pb-24 md:pt-20">
      <Eyebrow>Quran-first Fusha</Eyebrow>
      <h1 className="font-display text-4xl font-semibold text-navy sm:text-5xl">
        Notes on Quran-first Fusha
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-deep">
        Practical pieces on understanding the Quran, building Classical Arabic foundations, and
        carrying them into wider reading, listening, and formal expression.
      </p>

      <div className="mt-8">
        <SiteSearch items={searchIndex} />
      </div>

      {blogPosts.length === 0 && (
        <p className="mt-14 text-base text-deep">New posts are on the way &mdash; check back soon.</p>
      )}

      <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="flex flex-col rounded-xl border border-navy/10 bg-parchment-bg p-6 shadow-card transition-transform duration-fast hover:-translate-y-1"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep">
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              &middot; {post.readingTime}
            </span>
            <h2 className="mt-3 font-display text-xl font-semibold text-navy">{post.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-deep">{post.excerpt}</p>
            <span className="mt-4 text-sm font-semibold text-navy">Read more &rarr;</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
