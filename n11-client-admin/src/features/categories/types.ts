export interface Category {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  iconClass?: string;
  highlightLabel?: string;
  visibleInNav?: boolean;
  sortOrder?: number;
}

export interface CategoryPayload {
  name: string;
  description?: string;
  slug?: string;
  iconClass?: string;
  highlightLabel?: string;
  visibleInNav?: boolean;
  sortOrder?: number;
}
