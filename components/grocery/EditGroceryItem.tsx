import { Check, X } from "lucide-react-native";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";

type EditGroceryItemProps = {
  item: {
    id: number;
    name: string;
    quantity?: number;
    tags?: string[];
  };
};

export function EditGroceryItem({ item }: EditGroceryItemProps) {
  const { updateItem, setEditingItemId } = useGroceryStore();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity?.toString() || "");
  const [tags, setTags] = useState(item.tags?.join(", ") || "");

  const handleSave = () => {
    const q = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;
    const newTags = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    updateItem(item.id, name, q, newTags);
  };

  const handleCancel = () => {
    setEditingItemId(null);
  };

  return (
    <View className="mb-2">
      <View className="flex-row items-center">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2 dark:text-white"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="w-16 border border-gray-300 rounded-lg p-2 dark:text-white"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
      </View>
      <TextInput
        className="border border-gray-300 rounded-lg p-2 mt-2 dark:text-white"
        placeholder="Tags (comma separated)"
        value={tags}
        onChangeText={setTags}
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
