import Link from 'next/link';
import { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-navy text-cream-bg hover:bg-navy-deep shadow-lifted border border-transparent',
  secondary:
    'bg-gold text-navy hover:bg-gold-deep shadow-gold border border-transparent',
  ghost:
    'bg-transparent text-navy border border-navy/20 hover:border-navy/50',
};

export function Button({
  href,
  children,
  variant = 'primary',
  className = '',
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  external?: boolean;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold tracking-wide transition-colors duration-fast ${variantClasses[variant]} ${className}`;

  if (external || href.startsWith('http')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
