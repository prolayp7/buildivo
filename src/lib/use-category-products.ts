"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProductsPage } from "./storefront-client";
import type { ApiFacets, ProductListMeta } from "./adapters";
import type { Product } from "@/types";

type ProductResults = { items: Product[]; meta: ProductListMeta };

// Adapted from ukcshop's use-category-products.ts: accumulates pages as
// `loadMore` is called (infinite scroll), and resets to page 1 whenever the
// filter query itself changes.
export function useCategoryProducts(query: string, initialData: ProductResults | null) {
  const [state, setState] = useState({ data: initialData, query, loading: !initialData, error: false });
  const request = useRef<AbortController | null>(null);
  const initial = useRef(true);

  const fetchPage = useCallback(async (page: number) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setState((current) => ({ ...current, loading: true, error: false }));
    try {
      const data = await fetchProductsPage(`${query}&page=${page}`, controller.signal);
      if (controller.signal.aborted) return;
      setState((current) => {
        const previous = page > 1 && current.query === query ? current.data?.items ?? [] : [];
        const seen = new Set(previous.map((product) => product.id));
        return { data: { ...data, items: [...previous, ...data.items.filter((product) => !seen.has(product.id))] }, query, loading: false, error: false };
      });
    } catch (fetchError) {
      if (!(fetchError instanceof DOMException && fetchError.name === "AbortError")) {
        setState((current) => ({ ...current, loading: false, error: true }));
      }
    } finally {
      if (request.current === controller) request.current = null;
    }
  }, [query]);

  useEffect(() => {
    // The first page is already server-rendered; don't request it twice.
    if (initial.current && initialData) {
      initial.current = false;
      return;
    }
    initial.current = false;
    const timer = window.setTimeout(() => { void fetchPage(1); }, 0);
    return () => { window.clearTimeout(timer); request.current?.abort(); };
  }, [fetchPage, initialData]);

  const hasMore = !!state.data && state.data.meta.page < state.data.meta.totalPages;
  const loadMore = useCallback(() => {
    if (request.current || state.loading || state.error || state.query !== query || !hasMore) return;
    void fetchPage((state.data?.meta.page ?? 0) + 1);
  }, [fetchPage, hasMore, query, state]);
  const retry = () => { void fetchPage(state.query === query && state.data ? state.data.meta.page + 1 : 1); };

  return { ...state, loading: state.loading || (state.query !== query && !state.error), hasMore, loadMore, retry };
}

// The backend computes facet counts against the current filtered result set
// (including the facet's own filter), so feeding them straight back into the
// same checkboxes that produced that filter makes every other option vanish
// the moment one is selected. Fetched once per category, independent of the
// interactively-selected filters, so the option list itself stays stable -
// only the product results below narrow down.
export function useCategoryFacets(scopeQuery: string, initialFacets: ApiFacets) {
  const [facets, setFacets] = useState(initialFacets);
  const initial = useRef(true);

  useEffect(() => {
    if (initial.current) {
      initial.current = false;
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    void fetchProductsPage(`${scopeQuery}&perPage=1`, controller.signal)
      .then((data) => { if (!cancelled) setFacets(data.meta.facets); })
      .catch(() => undefined);
    return () => { cancelled = true; controller.abort(); };
  }, [scopeQuery]);

  return facets;
}
