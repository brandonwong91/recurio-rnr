import { useEffect } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { ListPlus } from "lucide-react-native";
import { AddGroceryForm } from "~/components/grocery/AddGroceryForm";
import { GroceryList } from "~/components/grocery/GroceryList";

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
  const { items, uncheckAll, fetchItems } = useGroceryStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const uncheckedItems = items.filter((item) => !item.done);
  const checkedItems = items.filter((item) => item.done);

  const uncheckedSections = groupItemsByTag(uncheckedItems);
  const checkedSections = groupItemsByTag(checkedItems);

  return (
    <View className="flex flex-col p-4 max-w-sm mx-auto">
      <AddGroceryForm />
      <GroceryList sections={uncheckedSections} />
      {checkedItems.length > 0 && (
        <>
          <View className="flex-row items-center my-4">
            <Separator className="flex-1" />
            <Text className="text-lg font-bold mx-2">Checked Items</Text>
            <Separator className="flex-1" />
            <Button
              onPress={uncheckAll}
              variant="ghost"
              size="sm"
            >
              <ListPlus size={16} />
            </Button>
          </View>
          <GroceryList sections={checkedSections} />
        </>
      )}
    </View>
  );
}
