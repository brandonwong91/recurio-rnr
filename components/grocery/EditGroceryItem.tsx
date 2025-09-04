import { Check, X, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";
import { useGroceryStore } from "~/lib/stores/groceryStore";
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

type EditGroceryItemProps = {
  item: {
    id: number;
    name: string;
    quantity?: number;
    tags?: string[];
  };
};

export function EditGroceryItem({ item }: EditGroceryItemProps) {
  const { updateItem, setEditingItemId, removeItem } = useGroceryStore();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity?.toString() || "");
  const [tags, setTags] = useState(item.tags?.join(", ") || "");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

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

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    await removeItem(item.id);
    setEditingItemId(null);
    setShowDeleteConfirmation(false);
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
      <View className="flex-row justify-between mt-2">
        <Button onPress={handleDelete} size="sm" variant={"ghost"}>
          <Trash2 size={16} color={"red"} />
        </Button>
        <View className="flex-row">
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
      <AlertDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Text>Cancel</Text>
            </AlertDialogCancel>
            <AlertDialogAction onPress={confirmDelete}>
              <Text>Delete</Text>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </View>
  );
}
