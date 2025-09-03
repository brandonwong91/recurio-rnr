import { Check, X, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "~/components/ui/button";
import { usePaymentStore, PaymentItemType } from "~/lib/stores/paymentStore";
import { PaymentForm, PaymentFormData } from "./PaymentForm";

type EditPaymentItemProps = {
  item: PaymentItemType;
};

export function EditPaymentItem({ item }: EditPaymentItemProps) {
  const { updatePayment, setEditingPaymentId, removePayment } = usePaymentStore();
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    name: item.name,
    amount: item.amount.toString(),
    tag: item.tag,
    due_date: item.due_date,
    frequency: item.frequency?.toString() || "",
    currency: item.currency || "SGD",
  });

  const handleSave = () => {
    updatePayment({
      id: item.id,
      name: paymentData.name,
      amount: parseFloat(paymentData.amount) || 0,
      tag: paymentData.tag,
      due_date: paymentData.due_date,
      frequency: paymentData.frequency
        ? parseInt(paymentData.frequency, 10)
        : 0,
      currency: paymentData.currency,
    });
  };

  const handleCancel = () => {
    setEditingPaymentId(null);
  };

  const handleDelete = async () => {
    await removePayment(item.id);
    setEditingPaymentId(null);
  };

  return (
    <View className="mb-2 p-4 border border-gray-200 rounded-lg">
      <PaymentForm
        payment={paymentData}
        onPaymentChange={setPaymentData}
        onSubmit={handleSave}
      />
      <View className="flex-row justify-between mt-4">
        <Button onPress={handleDelete} size="sm" variant={"ghost"}>
          <Trash2 size={16} color={"red"} />
        </Button>
        <View className="flex-row">
          <Button onPress={handleSave} size="sm" variant={"ghost"}>
            <Check size={16} color={"green"} />
          </Button>
          <Button
            onPress={handleCancel}
            variant="ghost"
            size="sm"
            className="ml-2"
          >
            <X size={16} color={"red"} />
          </Button>
        </View>
      </View>
    </View>
  );
}
