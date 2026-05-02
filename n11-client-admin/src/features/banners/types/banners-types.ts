export interface Banner {
  id: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl: string;
  badge?: string | null;
  sortOrder: number;
  active: boolean;
}

export interface BannerPayload {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl: string;
  badge?: string | null;
  sortOrder?: number;
  active?: boolean;
}
