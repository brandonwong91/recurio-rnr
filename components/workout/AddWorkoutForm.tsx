import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import { Input } from "~/components/ui/input";
import { EditExerciseItem } from "./EditExerciseItem";

type AddWorkoutFormProps = {
  onFinished?: () => void;
};

export function AddWorkoutForm({ onFinished }: AddWorkoutFormProps) {
  const [name, setName] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const { exercises, addWorkout, editingExerciseId, setEditingExerciseId } =
    useWorkoutStore();

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
      if (onFinished) {
        onFinished();
      }
    }
  };

  return (
    <View>
      <Input
        placeholder="Workout Name (e.g., Chest Day)"
        value={name}
        onChangeText={setName}
        className="mb-4"
      />
      <Text className="font-bold mb-2">Select Exercises:</Text>
      {exercises.map((exercise) => (
        <View key={exercise.id} className="flex-row items-center mb-2">
          {editingExerciseId === exercise.id ? (
            <EditExerciseItem exercise={exercise} />
          ) : (
            <>
              <Checkbox
                checked={selectedExercises.includes(exercise.id)}
                onCheckedChange={() => handleToggleExercise(exercise.id)}
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              <Pressable onPress={() => setEditingExerciseId(exercise.id)}>
                <Text className="ml-2">{exercise.name}</Text>
              </Pressable>
            </>
          )}
        </View>
      ))}
      <Button onPress={handleSubmit} className="mt-4">
        <Text>Add Workout</Text>
      </Button>
    </View>
  );
}
