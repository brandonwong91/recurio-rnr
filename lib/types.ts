export type PaymentItemType = {
  id: string;
  name: string;
  amount: number;
  tag: string;
  due_date: string;
  paid_date: string | null;
  frequency: number;
  done_status: boolean;
  created_at: string;
  user_id: string;
  currency: string;
};