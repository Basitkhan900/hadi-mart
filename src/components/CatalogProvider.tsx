"use client";
import { useEffect, useRef } from "react";
import { useCatalog } from "@/lib/store";

/**
 * CatalogProvider — fetches products from the server API on mount and syncs
 * them into the Zustand catalog store.  This ensures every device (not just
 * the developer's machine with localStorage data) sees the up-to-date catalog.
 */
export default function CatalogProvider() {
  const setProducts = useCatalog((s) => s.setProducts);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch("/api/products")
      .then((res) => {
        if (!res.ok) throw new Error(`API error ${res.status}`);
        return res.json();
      })
      .then((products) => {
        if (Array.isArray(products) && products.length > 0) {
          setProducts(products);
        }
      })
      .catch((err) => {
        console.error("[CatalogProvider] Failed to fetch products:", err);
      });
  }, [setProducts]);

  // Renders nothing — purely a data-sync component
  return null;
}

