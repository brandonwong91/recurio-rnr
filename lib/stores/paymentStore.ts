import { create } from 'zustand';
import { PaymentItemType } from '../types';
import {
  getPaymentItems,
  addPaymentItem,
  updatePaymentItem,
  deletePaymentItem,
} from '../supabase';

type PaymentState = {
  payments: PaymentItemType[];
  editingPaymentId: string | null;
  fetchPayments: () => Promise<void>;
  addPayment: (item: Omit<PaymentItemType, 'id' | 'created_at' | 'user_id' | 'done_status' | 'paid_date'>) => Promise<void>;
  updatePayment: (item: Partial<PaymentItemType> & { id: string }) => Promise<void>;
  removePayment: (id: string) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  setEditingPaymentId: (id: string | null) => void;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  editingPaymentId: null,
  fetchPayments: async () => {
    const payments = await getPaymentItems();
    set({ payments });
  },
  addPayment: async (item) => {
    const newItem = await addPaymentItem(item);
    if (newItem) {
      set((state) => ({ payments: [...state.payments, newItem] }));
    }
  },
  updatePayment: async (item) => {
    const updatedItem = await updatePaymentItem(item);
    if (updatedItem) {
      set((state) => ({
        payments: state.payments.map((p) => (p.id === updatedItem.id ? { ...p, ...updatedItem } : p)),
        editingPaymentId: null,
      }));
    }
  },
  removePayment: async (id) => {
    await deletePaymentItem(id);
    set((state) => ({
      payments: state.payments.filter((p) => p.id !== id),
    }));
  },
  toggleDone: async (id) => {
    const item = get().payments.find((p) => p.id === id);
    if (item) {
      const updatedItemData = {
        done_status: !item.done_status,
        paid_date: !item.done_status ? new Date().toISOString() : null,
      };
      const updatedItem = await updatePaymentItem({ id, ...updatedItemData });
      if (updatedItem) {
        set((state) => ({
            payments: state.payments.map((p) => (p.id === id ? updatedItem : p)),
        }));
      }
    }
  },
  setEditingPaymentId: (id) => set({ editingPaymentId: id }),
}));