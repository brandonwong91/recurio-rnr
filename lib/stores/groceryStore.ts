import { create } from "zustand";
import {
  getGroceryItems,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
} from "../supabase";

type GroceryItem = {
  id: number;
  name: string;
  quantity?: number;
  tags?: string[];
  done: boolean;
  checkedAt: Date | null;
  frequency?: number;
};

type GroceryState = {
  items: GroceryItem[];
  editingItemId: number | null;
  fetchItems: () => Promise<void>;
  addItem: (name: string, quantity?: number, tags?: string[], frequency?: number) => Promise<void>;
  toggleItem: (id: number) => Promise<void>;
  uncheckAll: () => Promise<void>;
  clearChecked: () => Promise<void>;
  setEditingItemId: (id: number | null) => void;
  updateItem: (
    id: number,
    name: string,
    quantity?: number,
    tags?: string[],
    frequency?: number
  ) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  setItems: (items: GroceryItem[]) => void;
};

export const useGroceryStore = create<GroceryState>((set, get) => ({
  items: [],
  editingItemId: null,
  fetchItems: async () => {
    const items = await getGroceryItems();
    set({ items });
  },
  addItem: async (name, quantity, tags, frequency) => {
    const newItem = await addGroceryItem({ name, quantity, tags, frequency });
    if (newItem) {
      set((state) => ({ items: [...state.items, newItem] }));
    }
  },
  toggleItem: async (id) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      const updatedItem = {
        ...item,
        done: !item.done,
        checkedAt: !item.done ? new Date() : null,
      };
      await updateGroceryItem(updatedItem);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updatedItem : i)),
      }));
    }
  },
  uncheckAll: async () => {
    const itemsToUpdate = get().items.filter((item) => item.done);
    await Promise.all(
      itemsToUpdate.map((item) =>
        updateGroceryItem({ ...item, done: false, checkedAt: null })
      )
    );
    set((state) => ({
      items: state.items.map((item) => ({
        ...item,
        done: false,
        checkedAt: null,
      })),
    }));
  },
  clearChecked: async () => {
    const itemsToDelete = get().items.filter((item) => item.done);
    await Promise.all(itemsToDelete.map((item) => deleteGroceryItem(item.id)));
    set((state) => ({ items: state.items.filter((item) => !item.done) }));
  },
  setEditingItemId: (id) => set({ editingItemId: id }),
  updateItem: async (id, name, quantity, tags, frequency) => {
    const item = get().items.find((i) => i.id === id);
    if (item) {
      const updatedItem = { ...item, name, quantity, tags, frequency };
      await updateGroceryItem(updatedItem);
      set((state) => ({
        items: state.items.map((i) => (i.id === id ? updatedItem : i)),
        editingItemId: null,
      }));
    }
  },
  removeItem: async (id) => {
    await deleteGroceryItem(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },
  setItems: (items) => set({ items }),
}));
