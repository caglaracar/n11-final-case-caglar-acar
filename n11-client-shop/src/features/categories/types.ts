export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  iconClass?: string;
  highlightLabel?: string;
  visibleInNav?: boolean;
  sortOrder?: number;
}
