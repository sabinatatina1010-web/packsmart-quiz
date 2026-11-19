import { create } from 'zustand'
import { INITIAL_PRODUCTS } from '@/data/products'
import { loadStoredProducts, saveStoredProducts } from '@/lib/leads'
import type { Product } from '@/types/catalog'

interface CatalogState {
  products: Product[]
  upsertProduct: (product: Product) => void
  removeProduct: (id: string) => void
  resetProducts: () => void
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  products: loadStoredProducts(INITIAL_PRODUCTS),
  upsertProduct: (product) => {
    const products = get().products
    const idx = products.findIndex((p) => p.id === product.id)
    const next =
      idx >= 0
        ? products.map((p, i) => (i === idx ? product : p))
        : [...products, product]
    saveStoredProducts(next)
    set({ products: next })
  },
  removeProduct: (id) => {
    const next = get().products.filter((p) => p.id !== id)
    saveStoredProducts(next)
    set({ products: next })
  },
  resetProducts: () => {
    saveStoredProducts(INITIAL_PRODUCTS)
    set({ products: INITIAL_PRODUCTS })
  },
}))
