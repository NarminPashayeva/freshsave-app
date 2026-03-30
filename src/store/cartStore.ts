import { create } from 'zustand';

export interface CartItem {
  listing_id: string;
  name: string;
  store_id: string;
  store_name: string;
  original_price: number;
  discounted_price: number;
  available_qty?: number; // stock limit from the listing
  quantity: number;
  image: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (listing_id: string) => void;
  updateQty: (listing_id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  saved: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find(i => i.listing_id === item.listing_id);
    // All items must be from same store — clear cart if switching stores
    const differentStore = get().items.length > 0 &&
      get().items[0].store_id !== item.store_id;

    if (differentStore) {
      set({ items: [{ ...item, quantity: 1 }] });
      return;
    }
    if (existing) {
      // Respect stock limit
      const max = item.available_qty ?? Infinity;
      if (existing.quantity >= max) return;
      set({ items: get().items.map(i =>
        i.listing_id === item.listing_id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )});
    } else {
      set({ items: [...get().items, { ...item, quantity: 1 }] });
    }
  },

  removeItem: (listing_id) =>
    set({ items: get().items.filter(i => i.listing_id !== listing_id) }),

  updateQty: (listing_id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(listing_id);
      return;
    }
    const item = get().items.find(i => i.listing_id === listing_id);
    const max = item?.available_qty ?? Infinity;
    const clamped = Math.min(quantity, max);
    set({ items: get().items.map(i =>
      i.listing_id === listing_id ? { ...i, quantity: clamped } : i
    )});
  },

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce(
    (sum, i) => sum + i.discounted_price * i.quantity, 0
  ),

  saved: () => get().items.reduce(
    (sum, i) => sum + (i.original_price - i.discounted_price) * i.quantity, 0
  ),
}));
