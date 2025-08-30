import { create } from 'zustand';

export type PaymentItem = {
  id: string;
  name: string;
  amount: number;
  tag: string;
  due_date: string;
  paid_date: string | null;
  frequency: number;
  done_status: boolean;
};

type PaymentState = {
  payments: PaymentItem[];
  editingPaymentId: string | null;
  addPayment: (item: Omit<PaymentItem, 'id' | 'done_status' | 'paid_date'>) => void;
  removePayment: (id: string) => void;
  updatePayment: (item: Partial<PaymentItem> & { id: string }) => void;
  toggleDone: (id: string) => void;
  setEditingPaymentId: (id: string | null) => void;
};

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  editingPaymentId: null,
  addPayment: (item) =>
    set((state) => ({
      payments: [
        ...state.payments,
        {
          ...item,
          id: new Date().toISOString(),
          done_status: false,
          paid_date: null,
        },
      ],
    })),
  removePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((item) => item.id !== id) })),
  updatePayment: (item) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === item.id ? { ...p, ...item } : p)),
      editingPaymentId: null,
    })),
  toggleDone: (id) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, done_status: !p.done_status, paid_date: !p.done_status ? new Date().toISOString() : null } : p
      ),
    })),
  setEditingPaymentId: (id) => set({ editingPaymentId: id }),
}));
