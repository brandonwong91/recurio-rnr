import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { usePaymentStore, PaymentItemType } from "~/lib/stores/paymentStore";
import { DatePicker } from "~/components/ui/DatePicker";

type EditPaymentItemProps = {
  item: PaymentItemType;
};

export function EditPaymentItem({ item }: EditPaymentItemProps) {
  const { updatePayment, setEditingPaymentId } = usePaymentStore();
  const [name, setName] = useState(item.name);
  const [amount, setAmount] = useState(item.amount.toString());
  const [tag, setTag] = useState(item.tag);
  const [dueDate, setDueDate] = useState(item.due_date);
  const [frequency, setFrequency] = useState(item.frequency?.toString() || "");

  const handleSave = () => {
    updatePayment({
      id: item.id,
      name,
      amount: parseFloat(amount) || 0,
      tag,
      due_date: dueDate,
      frequency: frequency ? parseInt(frequency, 10) : 0,
    });
  };

  const handleCancel = () => {
    setEditingPaymentId(null);
  };

  return (
    <View className="mb-2">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="w-24 border border-gray-300 rounded-lg p-2"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mt-2 mb-2"
        placeholder="Tag"
        value={tag}
        onChangeText={setTag}
      />
      <DatePicker
        date={dueDate}
        onDateChange={setDueDate}
        placeholder="Select Due Date"
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-2 -mt-2"
        placeholder="Frequency (in days)"
        value={frequency}
        onChangeText={setFrequency}
        keyboardType="numeric"
      />
      <View className="flex-row justify-end mt-2">
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
  );
}
