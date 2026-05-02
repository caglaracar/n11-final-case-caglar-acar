export interface Banner {
  id: string;
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  imageUrl: string;
  badge?: string | null;
  sortOrder: number;
  active: boolean;
}
