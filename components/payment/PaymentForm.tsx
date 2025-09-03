import { View, TextInput } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { DatePicker } from "~/components/ui/DatePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

export type PaymentFormData = {
  name: string;
  amount: string;
  tag: string | null;
  due_date: string | null;
  frequency: string;
  currency: string;
};

type PaymentFormProps = {
  payment: PaymentFormData;
  onPaymentChange: (payment: PaymentFormData) => void;
  onSubmit?: () => void;
};

export function PaymentForm({
  payment,
  onPaymentChange,
  onSubmit,
}: PaymentFormProps) {
  const handleFieldChange = (field: keyof PaymentFormData, value: any) => {
    onPaymentChange({ ...payment, [field]: value });
  };

  const handleAmountChange = (text: string) => {
    if (text === "" || /^[0-9.]+$/.test(text)) {
      handleFieldChange("amount", text);
    }
  };

  return (
    <>
      <View className="flex-row items-center mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 dark:text-white"
          placeholder="Payment name"
          value={payment.name}
          onChangeText={(value) => handleFieldChange("name", value)}
          onSubmitEditing={onSubmit}
        />
        <TextInput
          className="w-16 border border-gray-300 rounded-lg p-2 dark:text-white"
          placeholder="Amt"
          value={payment.amount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          onSubmitEditing={onSubmit}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size={"sm"} className="w-fit ml-2">
              <Text>{payment.currency}</Text>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onPress={() => handleFieldChange("currency", "SGD")}
            >
              <Text>SGD</Text>
            </DropdownMenuItem>
            <DropdownMenuItem
              onPress={() => handleFieldChange("currency", "MYR")}
            >
              <Text>MYR</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-4 dark:text-white"
        placeholder="Tag"
        value={payment.tag ?? ""}
        onChangeText={(value) => handleFieldChange("tag", value)}
        onSubmitEditing={onSubmit}
      />
      <DatePicker
        date={payment.due_date}
        onDateChange={(value) => handleFieldChange("due_date", value)}
        placeholder="Select Due Date"
      />
      <TextInput
        className="border border-gray-300 rounded-lg p-2 dark:text-white"
        placeholder="Frequency (in days)"
        value={payment.frequency}
        onChangeText={(value) => handleFieldChange("frequency", value)}
        keyboardType="numeric"
        onSubmitEditing={onSubmit}
      />
    </>
  );
}
