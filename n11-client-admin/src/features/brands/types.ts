export interface Brand {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  active?: boolean;
  sortOrder?: number;
}

export interface BrandPayload {
  name: string;
  description?: string;
  slug?: string;
  logoUrl?: string;
  active?: boolean;
  sortOrder?: number;
}
