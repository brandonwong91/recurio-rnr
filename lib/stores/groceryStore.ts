import { create } from 'zustand';

type GroceryItem = {
  id: number;
  name: string;
  quantity?: number;
  tags?: string[];
  done: boolean;
  checkedAt: Date | null;
};

type GroceryState = {
  items: GroceryItem[];
  editingItemId: number | null;
  addItem: (name: string, quantity?: number, tags?: string[]) => void;
  toggleItem: (id: number) => void;
  uncheckAll: () => void;
  clearChecked: () => void;
  setEditingItemId: (id: number | null) => void;
  updateItem: (id: number, name: string, quantity?: number, tags?: string[]) => void;
  setItems: (items: GroceryItem[]) => void;
};

export const useGroceryStore = create<GroceryState>((set) => ({
  items: [],
  editingItemId: null,
  addItem: (name, quantity, tags) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: Date.now(), name, quantity, tags, done: false, checkedAt: null },
      ],
    })),
  toggleItem: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              done: !item.done,
              checkedAt: !item.done ? new Date() : null,
            }
          : item
      ),
    })),
  uncheckAll: () =>
    set((state) => ({
      items: state.items
        .map((item) => ({ ...item, done: false, checkedAt: null }))
        .sort((a, b) => a.id - b.id),
    })),
  clearChecked: () =>
    set((state) => ({ items: state.items.filter((item) => !item.done) })),
  setEditingItemId: (id) => set({ editingItemId: id }),
  updateItem: (id, name, quantity, tags) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, name, quantity, tags } : item
      ),
      editingItemId: null,
    })),
  setItems: (items) => set({ items }),
}));
