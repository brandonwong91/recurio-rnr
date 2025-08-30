import { create } from 'zustand';

type GroceryItem = {
  id: number;
  name: string;
  quantity?: number;
  done: boolean;
  checkedAt: Date | null;
};

type GroceryState = {
  items: GroceryItem[];
  editingItemId: number | null;
  addItem: (name: string, quantity?: number) => void;
  toggleItem: (id: number) => void;
  uncheckAll: () => void;
  clearChecked: () => void;
  setEditingItemId: (id: number | null) => void;
  updateItem: (id: number, name: string, quantity?: number) => void;
};

export const useGroceryStore = create<GroceryState>((set) => ({
  items: [],
  editingItemId: null,
  addItem: (name, quantity) =>
    set((state) => ({
      items: [
        ...state.items,
        { id: Date.now(), name, quantity, done: false, checkedAt: null },
      ],
    })),
  toggleItem: (id) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id
          ? {
              ...item,
              done: !item.done,
              checkedAt: !item.done ? new Date() : null,
            }
          : item
      );

      items.sort((a, b) => {
        if (a.done && !b.done) return 1;
        if (!a.done && b.done) return -1;
        if (a.done && b.done) {
          return b.checkedAt!.getTime() - a.checkedAt!.getTime();
        }
        return 0;
      });

      return { items };
    }),
  uncheckAll: () =>
    set((state) => ({
      items: state.items
        .map((item) => ({ ...item, done: false, checkedAt: null }))
        .sort((a, b) => a.id - b.id),
    })),
  clearChecked: () =>
    set((state) => ({ items: state.items.filter((item) => !item.done) })),
  setEditingItemId: (id) => set({ editingItemId: id }),
  updateItem: (id, name, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, name, quantity } : item
      ),
      editingItemId: null,
    })),
}));
