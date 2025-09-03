export type PaymentItemType = {
  id: string;
  name: string;
  amount: number;
  tag: string | null;
  due_date: string | null;
  paid_date: string | null;
  frequency: number;
  done_status: boolean;
  created_at: string;
  user_id: string;
  currency: string;
};