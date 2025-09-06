import React, { useState } from "react";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useWorkoutStore, Exercise } from "~/lib/stores/workoutStore";
import { Input } from "~/components/ui/input";

export function AddWorkoutForm() {
  const [name, setName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { exercises, addWorkout } = useWorkoutStore();

  const handleToggleExercise = (exerciseId: string) => {
    setSelectedExercises((prev) =>
      prev.includes(exerciseId)
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const handleSubmit = () => {
    if (name.trim() && selectedExercises.length > 0) {
      addWorkout(name.trim(), selectedExercises);
      setName("");
      setSelectedExercises([]);
    }
  };

  return (
    <View className="p-4 border rounded-lg mt-4">
      <Text className="text-lg font-bold mb-4">Add New Workout</Text>
      <Input
        placeholder="Workout Name (e.g., Chest Day)"
        value={name}
        onChangeText={setName}
        className="mb-4"
      />
      <Text className="font-bold mb-2">Select Exercises:</Text>
      {exercises.map((exercise) => (
        <View key={exercise.id} className="flex-row items-center mb-2">
          <Checkbox
            checked={selectedExercises.includes(exercise.id)}
            onCheckedChange={() => handleToggleExercise(exercise.id)}
            className="mr-2 w-4 h-4 cursor-pointer"
          />
          <Text className="ml-2">{exercise.name}</Text>
        </View>
      ))}
      <Button onPress={handleSubmit} className="mt-4">
        <Text>Add Workout</Text>
      </Button>
    </View>
  );
}
