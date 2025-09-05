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

const isRenewable = (item: GroceryItem) => {
  if (item.done && item.checkedAt && item.frequency) {
    const checkedDate = new Date(item.checkedAt);
    const renewalDate = new Date(
      checkedDate.getTime() + item.frequency * 24 * 60 * 60 * 1000
    );
    return new Date() > renewalDate;
  }
  return false;
};

type GroceryState = {
  items: GroceryItem[];
  editingItemId: number | null;
  isRenewableDialogOpen: boolean;
  renewableItems: GroceryItem[];
  fetchItems: () => Promise<void>;
  addItem: (
    name: string,
    quantity?: number,
    tags?: string[],
    frequency?: number
  ) => Promise<void>;
  toggleItem: (id: number) => Promise<void>;
  showRenewableDialog: () => void;
  hideRenewableDialog: () => void;
  renewItems: (itemIds: number[]) => Promise<void>;
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
  isRenewableDialogOpen: false,
  renewableItems: [],
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
  showRenewableDialog: () => {
    const renewable = get().items.filter(isRenewable);
    set({ renewableItems: renewable, isRenewableDialogOpen: true });
  },
  hideRenewableDialog: () =>
    set({ isRenewableDialogOpen: false, renewableItems: [] }),
  renewItems: async (itemIds) => {
    const itemsToUpdate = get().items.filter((item) => itemIds.includes(item.id));
    await Promise.all(
      itemsToUpdate.map((item) =>
        updateGroceryItem({ ...item, done: false, checkedAt: null })
      )
    );
    set((state) => ({
      items: state.items.map((item) =>
        itemIds.includes(item.id) ? { ...item, done: false, checkedAt: null } : item
      ),
      isRenewableDialogOpen: false,
      renewableItems: [],
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