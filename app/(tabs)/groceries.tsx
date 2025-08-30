import { useEffect, useState } from "react";
import { View, TextInput, SectionList, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";
import { Checkbox } from "~/components/ui/checkbox";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { EditGroceryItem } from "~/components/grocery/EditGroceryItem";
import { ListPlus } from "lucide-react-native";

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
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const {
    items,
    addItem,
    toggleItem,
    uncheckAll,
    editingItemId,
    setEditingItemId,
    fetchItems,
  } = useGroceryStore();

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      if (quantity.trim() && !/^[0-9]+$/.test(quantity.trim())) {
        setError("Quantity must be a number.");
        return;
      }
      const q = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;
      const newTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      addItem(newItem.trim(), q, newTags);
      setNewItem("");
      setQuantity("");
      setTags("");
      setError(null);
    }
  };

  const handleQuantityChange = (text: string) => {
    if (text === "" || /^[0-9]+$/.test(text)) {
      setQuantity(text);
      setError(null);
    } else {
      setError("Quantity must be a number.");
    }
  };

  const uncheckedItems = items.filter((item) => !item.done);
  const checkedItems = items.filter((item) => item.done);

  const uncheckedSections = groupItemsByTag(uncheckedItems);
  const checkedSections = groupItemsByTag(checkedItems);

  const renderItem = ({ item }: { item: any }) => {
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
    <View className="flex flex-col p-4 max-w-sm mx-auto">
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
          placeholder="Add new item"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAddItem}
        />
        <TextInput
          className="w-16 border border-gray-300 rounded-lg p-2"
          placeholder="Qty"
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
          onSubmitEditing={handleAddItem}
        />
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-4"
        placeholder="Tags (comma separated)"
        value={tags}
        onChangeText={setTags}
        onSubmitEditing={handleAddItem}
      />
      <Button onPress={handleAddItem} className="mb-4">
        <Text>Add</Text>
      </Button>
      {error && <Text className="text-red-500 my-2">{error}</Text>}
      <SectionList
        sections={uncheckedSections}
        keyExtractor={(item, index) => item.id.toString() + index}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
      {checkedItems.length > 0 && (
        <>
          <Separator className="my-4" />
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Checked Items</Text>
            <View className="flex-row">
              <Button
                onPress={uncheckAll}
                variant="ghost"
                size="sm"
                className="ml-2"
              >
                <ListPlus size={16} />
              </Button>
            </View>
          </View>
          <SectionList
            sections={checkedSections}
            keyExtractor={(item, index) => item.id.toString() + index}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
          />
        </>
      )}
    </View>
  );
}
