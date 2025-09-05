import { SectionList, View, Pressable } from "react-native";
import { Repeat } from "lucide-react-native";
import { Text } from "~/components/ui/text";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { EditGroceryItem } from "./EditGroceryItem";
import { useGroceryStore } from "~/lib/stores/groceryStore";

interface GroceryItem {
  id: number;
  name: string;
  quantity?: number;
  done: boolean;
  tags: string[];
  checkedAt: Date | null;
  frequency?: number;
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

    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = d.toLocaleString("default", { month: "short" });
      const day = d.getDate();
      return `${month}-${day}`;
    };

    return (
      <Pressable onPress={() => setEditingItemId(item.id)}>
        <View className="flex-row items-center mb-2 ml-4">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => toggleItem(item.id)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`ml-2 ${item.done ? "line-through" : ""}`}>
                {item.name}
              </Text>
              {item.quantity && (
                <Badge variant="secondary" className="ml-2">
                  <Text>{item.quantity}</Text>
                </Badge>
              )}
              {item.frequency && (
                <View className="flex-row items-center ml-2">
                  <Repeat size={12} color="gray" />
                  <Text className="ml-1 text-xs text-gray-500">
                    {item.frequency} days
                  </Text>
                </View>
              )}
            </View>
            {item.done && item.checkedAt && (
              <Text className="ml-2 text-xs text-gray-500">
                {formatDate(item.checkedAt)}
              </Text>
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
        <Text>{title}</Text>
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
