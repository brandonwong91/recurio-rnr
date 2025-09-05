import React, { useEffect } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ListPlus } from "lucide-react-native";
import { AddGroceryForm } from "~/components/grocery/AddGroceryForm";
import { GroceryList } from "~/components/grocery/GroceryList";
import * as Accordion from "@rn-primitives/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

const groupItemsByTag = (items: any[]) => {
  const grouped: { [key: string]: any[] } = { Uncategorized: [] };

  items.forEach((item) => {
    if (item.tags && item.tags.length > 0) {
      item.tags.forEach((tag: string) => {
        if (!grouped[tag]) {
          grouped[tag] = [];
        }
        grouped[tag].push(item);
      });
    } else {
      grouped["Uncategorized"].push(item);
    }
  });

  const sections = Object.keys(grouped)
    .filter((tag) => grouped[tag].length > 0)
    .map((tag) => ({
      title: tag,
      data: grouped[tag],
    }));

  // Move Uncategorized to the top
  const uncategorizedIndex = sections.findIndex(
    (section) => section.title === "Uncategorized"
  );
  if (uncategorizedIndex > 0) {
    const uncategorizedSection = sections.splice(uncategorizedIndex, 1)[0];
    sections.unshift(uncategorizedSection);
  }

  return sections;
};

export default function GroceriesScreen() {
  const {
    items,
    fetchItems,
    isRenewableDialogOpen,
    renewableItems,
    showRenewableDialog,
    hideRenewableDialog,
    renewItems,
  } = useGroceryStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const uncheckedItems = items.filter((item) => !item.done);
  const checkedItems = items.filter((item) => item.done);

  const uncheckedSections = groupItemsByTag(uncheckedItems);
  const checkedSections = groupItemsByTag(checkedItems);

  const handleRenew = () => {
    const itemIds = renewableItems.map((item) => item.id);
    renewItems(itemIds);
  };

  return (
    <View className="flex flex-col p-4 max-w-md mx-auto w-full">
      <View className="flex-row justify-between items-center mb-4">
        <Accordion.Root type="single" collapsible className="flex-1">
          <Accordion.Item value="item-1">
            <Accordion.Header>
              <Accordion.Trigger className="w-full">
                <View className="flex-row justify-between items-center p-2 border rounded-lg text-center">
                  <Text className="font-bold text-center">Add Grocery</Text>
                </View>
              </Accordion.Trigger>
            </Accordion.Header>

            <Accordion.Content className="mt-4">
              <AddGroceryForm />
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </View>

      <View>
        <GroceryList sections={uncheckedSections} />
      </View>

      {checkedItems.length > 0 && (
        <>
          <View className="flex-row items-center my-2">
            <Separator className="flex-1" />
            <Text className="text-lg font-bold mx-2">Checked Items</Text>
            <Separator className="flex-1" />
            <Button onPress={showRenewableDialog} variant="ghost" size="sm">
              <ListPlus size={16} />
            </Button>
          </View>
          <GroceryList sections={checkedSections} />
        </>
      )}
      <AlertDialog open={isRenewableDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renew Items</AlertDialogTitle>
            <AlertDialogDescription>
              The following items are ready to be renewed. Do you want to add them
              back to your grocery list?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <View className="py-4">
            {renewableItems.map((item) => (
              <Text key={item.id} className="font-semibold">- {item.name}</Text>
            ))}
          </View>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={hideRenewableDialog}>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={handleRenew}>
              <Text>Renew</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}