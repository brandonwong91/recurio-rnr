
import { SectionList, View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { EditGroceryItem } from "./EditGroceryItem";
import { useGroceryStore } from "~/lib/stores/groceryStore";

interface GroceryItem {
  id: string;
  name: string;
  quantity?: number;
  done: boolean;
  tags: string[];
}

interface GroceryListProps {
  sections: { title: string; data: GroceryItem[] }[];
}

export function GroceryList({ sections }: GroceryListProps) {
  const { editingItemId, setEditingItemId, toggleItem } = useGroceryStore();

  const renderItem = ({ item }: { item: GroceryItem }) => {
    if (item.id === editingItemId) {
      return <EditGroceryItem item={item} />;
    }

    return (
      <Pressable onPress={() => setEditingItemId(item.id)}>
        <View className="flex-row items-center mb-2 ml-4">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => toggleItem(item.id)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <View className="flex-row items-center">
            <Text className={`ml-2 ${item.done ? "line-through" : ""}`}>
              {item.name}
            </Text>
            {item.quantity && (
              <Badge variant="secondary" className="ml-2">
                <Text>{item.quantity}</Text>
              </Badge>
            )}
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

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item, index) => item.id.toString() + index}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
    />
  );
}
