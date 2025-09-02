import { useEffect, useState } from "react";
import { View, TextInput, SectionList, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { usePaymentStore } from "~/lib/stores/paymentStore";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Repeat2 } from "lucide-react-native";
import { EditPaymentItem } from "~/components/payment/EditPaymentItem";
import { DatePicker } from "~/components/ui/DatePicker";
import * as Accordion from "@rn-primitives/accordion";

const getDayDifference = (dateString: string) => {
  if (!dateString) return null;
  const today = new Date();
  const dueDate = new Date(dateString);
  const timeDiff = dueDate.getTime() - today.getTime();
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return dayDiff;
};

const groupItemsByTag = (items: any[]) => {
  const grouped: { [key: string]: any[] } = { Uncategorized: [] };

  items.forEach((item) => {
    if (item.tag) {
      if (!grouped[item.tag]) {
        grouped[item.tag] = [];
      }
      grouped[item.tag].push(item);
    } else {
      grouped["Uncategorized"].push(item);
    }
  });

  const sections = Object.keys(grouped)
    .filter((tag) => grouped[tag].length > 0)
    .map((tag) => {
      const data = grouped[tag];
      const total = data.reduce((acc, item) => acc + item.amount, 0);
      return {
        title: tag,
        data,
        total,
      };
    });

  const uncategorizedIndex = sections.findIndex(
    (section) => section.title === "Uncategorized"
  );
  if (uncategorizedIndex > 0) {
    const uncategorizedSection = sections.splice(uncategorizedIndex, 1)[0];
    sections.unshift(uncategorizedSection);
  }

  return sections;
};

export default function PaymentsScreen() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [frequency, setFrequency] = useState("");

  const [error, setError] = useState<string | null>(null);
  const {
    payments,
    addPayment,
    toggleDone,
    editingPaymentId,
    setEditingPaymentId,
    fetchPayments,
  } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAddPayment = () => {
    if (name.trim() && amount.trim()) {
      if (!/^[0-9.]+$/.test(amount.trim())) {
        setError("Amount must be a number.");
        return;
      }
      addPayment({
        name: name.trim(),
        amount: parseFloat(amount.trim()),
        tag: tag.trim(),
        due_date: dueDate.trim(),
        frequency: frequency ? parseInt(frequency.trim(), 10) : 0,
      });
      setName("");
      setAmount("");
      setTag("");
      setDueDate("");
      setError(null);
    }
  };

  const handleAmountChange = (text: string) => {
    if (text === "" || /^[0-9.]+$/.test(text)) {
      setAmount(text);
      setError(null);
    } else {
      setError("Amount must be a number.");
    }
  };

  const unpaidPayments = payments
    .filter((item) => !item.done_status)
    .sort((a, b) => {
      if (a.due_date && b.due_date) {
        return a.due_date.localeCompare(b.due_date);
      }
      if (a.due_date) return -1; // a comes first
      if (b.due_date) return 1; // b comes first
      return 0;
    });
  const paidPayments = payments
    .filter((item) => item.done_status)
    .sort((a, b) => {
      if (a.paid_date && b.paid_date) {
        return b.paid_date.localeCompare(a.paid_date);
      }
      if (a.paid_date) return -1;
      if (b.paid_date) return 1;
      return 0;
    });

  const unpaidSections = groupItemsByTag(unpaidPayments);
  const paidSections = groupItemsByTag(paidPayments);

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === editingPaymentId) {
      return <EditPaymentItem item={item} />;
    }

    return (
      <Pressable onPress={() => setEditingPaymentId(item.id)}>
        <View className="flex-row items-center mb-2 ml-4">
          <Checkbox
            checked={item.done_status}
            onCheckedChange={() => toggleDone(item.id)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <View className="flex flex-col w-full gap-2">
            <View className="flex-row w-full flex-1 justify-between items-center">
              <Text
                className={`ml-2 ${item.done_status ? "line-through" : ""}`}
              >
                {item.name}
              </Text>
              <Badge variant="secondary" className="mr-10">
                <Text>${item.amount.toFixed(2)}</Text>
              </Badge>
            </View>
            <View className="flex-row items-start">
              {item.due_date && (
                <Badge variant="outline" className="ml-2">
                  <Text>
                    Due: {item.due_date} ({getDayDifference(item.due_date)}d)
                  </Text>
                </Badge>
              )}
              {item.paid_date && item.done_status && (
                <Badge variant="outline" className="ml-2">
                  <Text>
                    Paid: {new Date(item.paid_date).toLocaleDateString()}
                  </Text>
                </Badge>
              )}
            </View>
            <View>
              {item.frequency > 0 && (
                <Badge variant="outline" className="ml-2">
                  <Repeat2 size={16} className="mr-1" />
                  <Text>Every {item.frequency} days </Text>
                </Badge>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => {
    if (title === "Uncategorized") {
      return null;
    }
    return (
      <Badge variant={"secondary"} className="mb-2">
        {title}
      </Badge>
    );
  };

  const renderSectionFooter = ({
    section,
  }: {
    section: { total: number; title: string; data: any[] };
  }) => {
    if (section.title === "Uncategorized" && section.data.length === 0) {
      return null;
    }
    return (
      <View className="items-end pr-4 mt-2">
        <Separator className="my-2" />
        <Text className="font-bold">Total: ${section.total.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <View className="flex flex-col flex-1 p-4 max-w-sm mx-auto">
      <Accordion.Root type="single" collapsible>
        <Accordion.Item value="item-1">
          <Accordion.Header>
            <Accordion.Trigger className="w-full">
              <View className="flex-row justify-between items-center p-2 border rounded-lg mb-4 text-center">
                <Text className="font-bold text-center">Add Payment</Text>
              </View>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>
            <View className="flex-row mb-4">
              <TextInput
                className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 dark:text-white"
                placeholder="Payment name"
                value={name}
                onChangeText={setName}
                onSubmitEditing={handleAddPayment}
              />
              <TextInput
                className="w-24 border border-gray-300 rounded-lg p-2 dark:text-white"
                placeholder="Amount"
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                onSubmitEditing={handleAddPayment}
              />
            </View>
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4 dark:text-white"
              placeholder="Tag"
              value={tag}
              onChangeText={setTag}
              onSubmitEditing={handleAddPayment}
            />
            <DatePicker
              date={dueDate}
              onDateChange={setDueDate}
              placeholder="Select Due Date"
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mb-4 dark:text-white"
              placeholder="Frequency (in days)"
              value={frequency}
              onChangeText={setFrequency}
              keyboardType="numeric"
              onSubmitEditing={handleAddPayment}
            />
            <Button onPress={handleAddPayment} className="mb-4">
              <Text>Add Payment</Text>
            </Button>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      {error && <Text className="text-red-500 my-2">{error}</Text>}
      <SectionList
        sections={unpaidSections}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
      />
      {paidPayments.length > 0 && (
        <>
          <Separator className="my-4" />
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Paid</Text>
          </View>
          <SectionList
            sections={paidSections}
            keyExtractor={(item, index) => item.id.toString() + index}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            renderSectionFooter={renderSectionFooter}
          />
        </>
      )}
    </View>
  );
}
