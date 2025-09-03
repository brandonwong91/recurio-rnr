import { useEffect, useState } from "react";
import { View, SectionList, Pressable, Dimensions } from "react-native";
import { Text } from "~/components/ui/text";
import { PaymentItemType, usePaymentStore } from "~/lib/stores/paymentStore";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { Repeat2 } from "lucide-react-native";
import { EditPaymentItem } from "~/components/payment/EditPaymentItem";
import * as Accordion from "@rn-primitives/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { PaymentForm, PaymentFormData } from "~/components/payment/PaymentForm";

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
      const currency = data.length > 0 ? data[0].currency : "";
      return {
        title: tag,
        data,
        total,
        currency,
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
  const [newPaymentData, setNewPaymentData] = useState<PaymentFormData>({
    name: "",
    amount: "",
    tag: "",
    due_date: "",
    frequency: "",
    currency: "SGD",
  });
  const [convertedTotals, setConvertedTotals] = useState<{
    [key: string]: { amount: number; currency: string };
  }>({});
  const [isSumModeActive, setIsSumModeActive] = useState(false);
  const [selectedItemsForSum, setSelectedItemsForSum] = useState<number[]>([]);
  const [currentSum, setCurrentSum] = useState(0);
  const [sumCurrency, setSumCurrency] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const {
    payments,
    addPayment,
    toggleDone,
    editingPaymentId,
    setEditingPaymentId,
    fetchPayments,
    updatePayment,
  } = usePaymentStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAddPayment = () => {
    if (newPaymentData.name.trim() && newPaymentData.amount.trim()) {
      if (!/^[0-9.]+$/.test(newPaymentData.amount.trim())) {
        setError("Amount must be a number.");
        return;
      }
      addPayment({
        name: newPaymentData.name.trim(),
        amount: parseFloat(newPaymentData.amount.trim()),
        tag:
          newPaymentData.tag && newPaymentData.tag.trim() !== ""
            ? newPaymentData.tag.trim()
            : null,
        due_date:
          newPaymentData.due_date && newPaymentData.due_date.trim() !== ""
            ? newPaymentData.due_date.trim()
            : null,
        frequency: newPaymentData.frequency
          ? parseInt(newPaymentData.frequency.trim(), 10)
          : 0,
        currency: newPaymentData.currency,
      });
      setNewPaymentData({
        name: "",
        amount: "",
        tag: "",
        due_date: "",
        frequency: "",
        currency: "SGD",
      });
      setError(null);
    }
  };

  const handleCurrencyConversion = async (
    sectionTitle: string,
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    if (fromCurrency === toCurrency) {
      const newConvertedTotals = { ...convertedTotals };
      delete newConvertedTotals[sectionTitle];
      setConvertedTotals(newConvertedTotals);
      return;
    }

    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
      );
      const data = await response.json();
      if (data.rates && data.rates[toCurrency]) {
        setConvertedTotals({
          ...convertedTotals,
          [sectionTitle]: {
            amount: data.rates[toCurrency],
            currency: toCurrency,
          },
        });
      } else {
        console.error("Failed to fetch exchange rate");
      }
    } catch (error) {
      console.error("Error converting currency:", error);
    }
  };

  const handleSumSelection = (item: any) => {
    if (!isSumModeActive) return;

    const { id, amount, currency } = item;

    if (selectedItemsForSum.includes(id)) {
      // Deselect
      setSelectedItemsForSum(
        selectedItemsForSum.filter((itemId) => itemId !== id)
      );
      setCurrentSum(currentSum - amount);
      if (selectedItemsForSum.length === 1) {
        setSumCurrency(null);
      }
    } else {
      // Select
      if (sumCurrency && sumCurrency !== currency) {
        setError("You can only sum items with the same currency.");
        setTimeout(() => setError(null), 3000); // Clear error after 3s
        return;
      }
      setSelectedItemsForSum([...selectedItemsForSum, id]);
      setCurrentSum(currentSum + amount);
      if (!sumCurrency) {
        setSumCurrency(currency);
      }
    }
  };

  const handleUpdateDueDate = async (item: PaymentItemType) => {
    if (!item.due_date || item.frequency <= 0) return;

    const currentDueDate = new Date(item.due_date);
    currentDueDate.setDate(currentDueDate.getDate() + item.frequency);
    const newDueDate = currentDueDate.toISOString().split("T")[0]; // Format to YYYY-MM-DD

    await updatePayment({
      id: item.id,
      due_date: newDueDate,
      done_status: false,
      paid_date: null,
    });
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
      <Pressable
        onPress={() => !isSumModeActive && setEditingPaymentId(item.id)}
      >
        <View className="flex-row items-center mb-2 ml-4">
          <Checkbox
            checked={
              isSumModeActive
                ? selectedItemsForSum.includes(item.id)
                : item.done_status
            }
            onCheckedChange={() =>
              isSumModeActive ? handleSumSelection(item) : toggleDone(item.id)
            }
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
                <Text>
                  {item.currency} {item.amount.toFixed(2)}
                </Text>
              </Badge>
            </View>
            <View className="flex-row items-start">
              {item.due_date && (
                <Badge variant="outline" className="ml-2">
                  <Text>
                    Due: {item.due_date}
                    {item.done_status === false &&
                      ` (${getDayDifference(item.due_date)}d)`}
                  </Text>
                </Badge>
              )}
              {item.due_date &&
                item.frequency > 0 &&
                getDayDifference(item.due_date)! <= 0 && (
                  <Button
                    onPress={() => handleUpdateDueDate(item)}
                    size="sm"
                    variant="outline"
                    className="ml-2"
                  >
                    <Text>Renew</Text>
                  </Button>
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
    section: { total: number; title: string; data: any[]; currency: string };
  }) => {
    if (section.title === "Uncategorized" && section.data.length === 0) {
      return null;
    }

    const converted = convertedTotals[section.title];

    return (
      <View className="items-end pr-4 mt-2">
        <Separator className="my-2" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <View>
              {converted ? (
                <Text className="font-bold">
                  Total: {converted.currency} {converted.amount.toFixed(2)}
                </Text>
              ) : (
                <Text className="font-bold">
                  Total: {section.currency} {section.total.toFixed(2)}
                </Text>
              )}
            </View>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onPress={() =>
                handleCurrencyConversion(
                  section.title,
                  section.total,
                  section.currency,
                  "SGD"
                )
              }
            >
              <Text>SGD</Text>
            </DropdownMenuItem>
            <DropdownMenuItem
              onPress={() =>
                handleCurrencyConversion(
                  section.title,
                  section.total,
                  section.currency,
                  "MYR"
                )
              }
            >
              <Text>MYR</Text>
            </DropdownMenuItem>
            <DropdownMenuItem
              onPress={() =>
                handleCurrencyConversion(
                  section.title,
                  section.total,
                  section.currency,
                  "USD"
                )
              }
            >
              <Text>USD</Text>
            </DropdownMenuItem>
            <DropdownMenuItem
              onPress={() =>
                handleCurrencyConversion(
                  section.title,
                  section.total,
                  section.currency,
                  "EUR"
                )
              }
            >
              <Text>EUR</Text>
            </DropdownMenuItem>
            {/* Add an option to reset */}
            <DropdownMenuItem
              onPress={() =>
                handleCurrencyConversion(
                  section.title,
                  section.total,
                  section.currency,
                  section.currency
                )
              }
            >
              <Text>Reset to {section.currency}</Text>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </View>
    );
  };

  return (
    <View className="flex flex-col flex-1 p-4 max-w-md w-full mx-auto">
      <View className="flex-row justify-between items-center mb-4">
        <Accordion.Root type="single" collapsible className="flex-1">
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger className="w-full">
                <View className="flex-row justify-between items-center p-2 border rounded-lg text-center">
                  <Text className="font-bold text-center">Add Payment</Text>
                </View>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="mt-4">
              <PaymentForm
                payment={newPaymentData}
                onPaymentChange={setNewPaymentData}
                onSubmit={handleAddPayment}
              />
              <Button onPress={handleAddPayment} className="mt-4">
                <Text>Add Payment</Text>
              </Button>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </View>
      <Button
        onPress={() => {
          setIsSumModeActive(!isSumModeActive);
          if (isSumModeActive) {
            setSelectedItemsForSum([]);
            setCurrentSum(0);
            setSumCurrency(null);
          }
        }}
        variant={isSumModeActive ? "destructive" : "secondary"}
      >
        <Text>{isSumModeActive ? "End Sum" : "Start Sum"}</Text>
      </Button>
      {error && <Text className="text-red-500 my-2">{error}</Text>}
      {unpaidSections.length > 0 && (
        <SectionList
          sections={unpaidSections}
          keyExtractor={(item, index) => item.id.toString() + index}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          renderSectionFooter={renderSectionFooter}
          style={{
            minHeight: Dimensions.get("window").height / 4,
            paddingTop: 8,
          }}
        />
      )}
      {paidPayments.length > 0 && (
        <>
          <View className="flex-row items-center my-4">
            <Separator className="flex-1" />
            <Text className="mx-4 text-lg font-bold">Paid</Text>
            <Separator className="flex-1" />
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
      {isSumModeActive && (
        <View className="absolute bottom-4 right-4 bg-primary p-4 rounded-lg shadow-lg">
          <Text className="text-primary-foreground font-bold">
            Sum: {sumCurrency} {currentSum.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}
