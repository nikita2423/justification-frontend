import { create } from "zustand"
import type { Product, Stage, ApprovalJustification, SimilarJustification } from "./types"

interface ProductStore {
  products: Product[]
  currentStage: Stage
  selectedProducts: string[]
  justifications: ApprovalJustification[]
  similarJustifications: SimilarJustification[]
  isGeneratingJustification: boolean
  commonSeason: string
  commonTranch: string

  setStage: (stage: Stage) => void
  addProduct: (product: Product) => void
  updateProduct: (id: string, updates: Partial<Product>) => void
  removeProduct: (id: string) => void
  setProducts: (products: Product[]) => void
  toggleProductSelection: (id: string) => void
  selectAllProducts: () => void
  clearSelection: () => void
  addJustification: (justification: ApprovalJustification) => void
  setSimilarJustifications: (justifications: SimilarJustification[]) => void
  setIsGeneratingJustification: (isGenerating: boolean) => void
  setCommonSeason: (season: string) => void
  setCommonTranch: (tranch: string) => void
  applyCommonSeasonAndTranch: () => void
  resetStore: () => void
}

const initialState = {
  products: [],
  currentStage: 1 as Stage,
  selectedProducts: [],
  justifications: [],
  similarJustifications: [],
  isGeneratingJustification: false,
  commonSeason: "",
  commonTranch: "",
}

export const useProductStore = create<ProductStore>((set, get) => ({
  ...initialState,

  setStage: (stage) => set({ currentStage: stage }),

  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),

  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    })),

  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      selectedProducts: state.selectedProducts.filter((pid) => pid !== id),
    })),

  setProducts: (products) => set({ products }),

  toggleProductSelection: (id) =>
    set((state) => ({
      selectedProducts: state.selectedProducts.includes(id)
        ? state.selectedProducts.filter((pid) => pid !== id)
        : [...state.selectedProducts, id],
    })),

  selectAllProducts: () =>
    set((state) => ({
      selectedProducts: state.products.filter((p) => p.status === "pending_review").map((p) => p.id),
    })),

  clearSelection: () => set({ selectedProducts: [] }),

  addJustification: (justification) =>
    set((state) => ({
      justifications: [...state.justifications, justification],
    })),

  setSimilarJustifications: (justifications) =>
    set({
      similarJustifications: justifications,
    }),

  setIsGeneratingJustification: (isGenerating) =>
    set({
      isGeneratingJustification: isGenerating,
    }),

  setCommonSeason: (season) => set({ commonSeason: season }),

  setCommonTranch: (tranch) => set({ commonTranch: tranch }),

  applyCommonSeasonAndTranch: () =>
    set((state) => ({
      products: state.products.map((p) => ({
        ...p,
        season: state.commonSeason,
        tranch: state.commonTranch,
      })),
    })),

  resetStore: () => set(initialState),
}))
