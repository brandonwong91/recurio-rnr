import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import { Input } from "~/components/ui/input";

export function AddExerciseForm() {
  const [name, setName] = useState("");
  const addExercise = useWorkoutStore((state) => state.addExercise);

  const handleSubmit = () => {
    if (name.trim()) {
      addExercise(name.trim());
      setName("");
    }
  };

  return (
    <View className="p-4 border rounded-lg">
      <Text className="text-lg font-bold mb-4">Add New Exercise</Text>
      <Input
        placeholder="Exercise Name (e.g., Bench Press)"
        value={name}
        onChangeText={setName}
        className="mb-4"
      />
      <Button onPress={handleSubmit}>
        <Text>Add Exercise</Text>
      </Button>
    </View>
  );
}
