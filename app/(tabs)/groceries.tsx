import { useState } from 'react';
import { View, TextInput, FlatList, Alert, Pressable } from 'react-native';
import { Text } from '~/components/ui/text';
import { useGroceryStore } from '~/lib/stores/groceryStore';
import { Checkbox } from '~/components/ui/checkbox';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Badge } from '~/components/ui/badge';
import { EditGroceryItem } from '~/components/grocery/EditGroceryItem';

export default function GroceriesScreen() {
  const [newItem, setNewItem] = useState('');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { items, addItem, toggleItem, uncheckAll, clearChecked, editingItemId, setEditingItemId } = useGroceryStore();

  const handleAddItem = () => {
    if (newItem.trim()) {
      if (quantity.trim() && !/^[0-9]+$/.test(quantity.trim())) {
        setError('Quantity must be a number.');
        return;
      }
      const q = quantity.trim() ? parseInt(quantity.trim(), 10) : undefined;
      addItem(newItem.trim(), q);
      setNewItem('');
      setQuantity('');
      setError(null);
    }
  };

  const handleQuantityChange = (text: string) => {
    if (text === '' || /^[0-9]+$/.test(text)) {
      setQuantity(text);
      setError(null);
    } else {
      setError('Quantity must be a number.');
    }
  };

  const uncheckedItems = items.filter((item) => !item.done);
  const checkedItems = items.filter((item) => item.done);

  const renderItem = ({ item }: { item: any }) => {
    if (item.id === editingItemId) {
      return <EditGroceryItem item={item} />;
    }

    return (
      <Pressable onPress={() => setEditingItemId(item.id)}>
        <View className="flex-row items-center mb-2">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => toggleItem(item.id)}
            className="mr-2 w-4 h-4"
          />
          <View className="flex-row items-center">
            <Text className={`ml-2 ${item.done ? 'line-through' : ''}`}>
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
  
  const renderCheckedItem = ({ item }: { item: any }) => {
    if (item.id === editingItemId) {
      return <EditGroceryItem item={item} />;
    }

    return (
      <Pressable onPress={() => setEditingItemId(item.id)}>
        <View className="flex-row items-center mb-2">
          <Checkbox
            checked={item.done}
            onCheckedChange={() => toggleItem(item.id)}
            className="mr-2 w-4 h-4"
          />
          <View>
            <View className="flex-row items-center">
              <Text className={`ml-2 ${item.done ? 'line-through' : ''}`}>
                {item.name}
              </Text>
              {item.quantity && (
                <Badge variant="secondary" className="ml-2">
                  <Text>{item.quantity}</Text>
                </Badge>
              )}
            </View>
            {item.done && item.checkedAt && (
              <Text className="ml-2 text-xs text-gray-500">
                {new Date(item.checkedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 p-4 max-w-sm mx-auto">
      <Text className="text-2xl font-bold mb-4">Grocery List</Text>
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded-lg p-2 mr-2"
          placeholder="Add new item"
          value={newItem}
          onChangeText={setNewItem}
          onSubmitEditing={handleAddItem}
        />
        <TextInput
          className="w-16 border border-gray-300 rounded-lg p-2 mr-2"
          placeholder="Qty"
          value={quantity}
          onChangeText={handleQuantityChange}
          keyboardType="numeric"
          onSubmitEditing={handleAddItem}
        />
        <Button onPress={handleAddItem}><Text>Add</Text></Button>
      </View>
      {error && <Text className="text-red-500 mb-2">{error}</Text>}
      <FlatList
        data={uncheckedItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
      {checkedItems.length > 0 && (
        <>
          <Separator className="my-4" />
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Checked Items</Text>
            <View className="flex-row">
              <Button onPress={uncheckAll} variant="outline" size="sm"><Text>Uncheck All</Text></Button>
              <Button onPress={clearChecked} variant="destructive" size="sm" className="ml-2"><Text>Clear Checked</Text></Button>
            </View>
          </View>
          <FlatList
            data={checkedItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCheckedItem}
          />
        </>
      )}
    </View>
  );
}
