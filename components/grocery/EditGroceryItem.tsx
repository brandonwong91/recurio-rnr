import { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { useGroceryStore } from '~/lib/stores/groceryStore';

type EditGroceryItemProps = {
  item: {
    id: number;
    name: string;
    quantity?: number;
  };
};

export function EditGroceryItem({ item }: EditGroceryItemProps) {
  const { updateItem, setEditingItemId } = useGroceryStore();
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity?.toString() || '');

  const handleSave = () => {
    const q = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;
    updateItem(item.id, name, q);
  };

  const handleCancel = () => {
    setEditingItemId(null);
  };

  return (
    <View className="flex-row items-center mb-2">
      <TextInput
        className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        className="w-16 border border-gray-300 rounded-lg p-2 mr-2"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      <Button onPress={handleSave} size="sm"><Text>Save</Text></Button>
      <Button onPress={handleCancel} variant="ghost" size="sm" className="ml-2"><Text>Cancel</Text></Button>
    </View>
  );
}
