
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";

export function AddGroceryForm() {
  const [newItem, setNewItem] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const addItem = useGroceryStore((state) => state.addItem);

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

  return (
    <View className="mb-4">
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 dark:text-white"
          placeholder="Add new item"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAddItem}
        />
        <TextInput
          className="w-16 border border-gray-300 rounded-lg p-2 dark:text-white"
          placeholder="Qty"
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
          onSubmitEditing={handleAddItem}
        />
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mb-4 dark:text-white"
        placeholder="Tags (comma separated)"
        value={tags}
        onChangeText={setTags}
        onSubmitEditing={handleAddItem}
      />
      <Button onPress={handleAddItem} className="mb-4">
        <Text>Add</Text>
      </Button>
      {error && <Text className="text-red-500 my-2">{error}</Text>}
    </View>
  );
}
