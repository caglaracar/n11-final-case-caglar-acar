import { useEffect, useState } from "react";
import { productService, toUiProducts, type UiProduct } from "@/services";

interface State {
  products: UiProduct[];
  loading: boolean;
  error: string | null;
}

export function useProducts(pageSize = 60): State {
  const [state, setState] = useState<State>({
    products: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const page = await productService.findAll(0, pageSize);
        if (cancelled) return;
        setState({ products: toUiProducts(page.content), loading: false, error: null });
      } catch (e) {
        if (!cancelled) {
          setState({ products: [], loading: false, error: (e as Error).message });
        }
      }
    })();
    return () => { cancelled = true; };
  }, [pageSize]);

  return state;
}
