import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Section, Eyebrow } from '../../components/Section';
import { getBlogPosts, getBlogPost, sanitizeBlogBody } from '@/content/blog';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.coverImageUrl ?? undefined,
    author: { '@type': 'Organization', name: post.author },
  };

  return (
    <Section padded={false} className="pb-16 pt-14 md:pb-24 md:pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/blog" className="text-sm font-semibold text-navy underline underline-offset-4">
        &larr; All posts
      </Link>

      <div className="mx-auto mt-8 max-w-prose">
        <Eyebrow>
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          &middot; {post.readingTime}
        </Eyebrow>
        <h1 className="font-display text-3xl font-semibold text-navy sm:text-4xl">
          {post.title}
        </h1>
        {post.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            className="mt-8 w-full rounded-xl border border-navy/10 shadow-card"
          />
        )}
        <div
          className="prose-warsh mt-8"
          dangerouslySetInnerHTML={{ __html: sanitizeBlogBody(post.body) }}
        />
      </div>
    </Section>
  );
}
