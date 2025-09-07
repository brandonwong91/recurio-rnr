import React, { useState } from "react";
import { View, TextInput, ActivityIndicator, Alert } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import { Copy, Plus, Trash2 } from "lucide-react-native";

export function ActiveWorkout() {
  const {
    activeWorkoutSession,
    workouts,
    addSet,
    updateSet,
    duplicateSet,
    deleteSet,
    endWorkout,
    loading,
  } = useWorkoutStore();
  const [setInputs, setSetInputs] = useState<
    Record<string, { reps: string; weight: string }>
  >({});

  if (!activeWorkoutSession) {
    return null;
  }

  const activeWorkout = workouts.find(
    (w) => w.id === activeWorkoutSession.workoutId
  );

  if (loading && !activeWorkout) {
    return (
      <View className="p-4 rounded-lg m-4 bg-secondary/30 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!activeWorkout) {
    return null;
  }

  const handleInputChange = (
    exerciseId: string,
    field: "reps" | "weight",
    value: string
  ) => {
    if (/^\d*$/.test(value)) {
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          [field]: value,
        },
      }));
    }
  };

  const handleAddSet = (exerciseId: string) => {
    const inputs = setInputs[exerciseId] || { reps: "", weight: "" };
    const repCount = parseInt(inputs.reps, 10);
    const weightCount = inputs.weight ? parseInt(inputs.weight, 10) : undefined;
    if (repCount) {
      addSet(exerciseId, { reps: repCount, weight: weightCount });
      setSetInputs((prev) => ({
        ...prev,
        [exerciseId]: { reps: "", weight: "" },
      }));
    }
  };

  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weight",
    value: string
  ) => {
    if (/^\d*$/.test(value)) {
      const updatedSet = {
        ...activeWorkoutSession.exerciseSets[exerciseId][setIndex],
        [field]: parseInt(value, 10) || 0,
      };
      updateSet(exerciseId, setIndex, updatedSet);
    }
  };

  const handleDuplicateSet = (exerciseId: string, setIndex: number) => {
    const setToDuplicate =
      activeWorkoutSession.exerciseSets[exerciseId][setIndex];
    duplicateSet(exerciseId, setIndex, setToDuplicate);
  };

  const handleDeleteSet = (exerciseId: string, setIndex: number) => {
    Alert.alert("Delete Set", "Are you sure you want to delete this set?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteSet(exerciseId, setIndex),
        style: "destructive",
      },
    ]);
  };

  return (
    <View className="p-4 rounded-lg m-4 bg-secondary/30">
      <Text className="text-2xl font-bold mb-4">{activeWorkout.name}</Text>
      {activeWorkout.exercises.map((exercise) => (
        <View key={exercise.id} className="mb-4">
          <Text className="text-lg font-bold">{exercise.name}</Text>
          {activeWorkoutSession.exerciseSets[exercise.id]?.map((set, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <TextInput
                className="border border-gray-300 rounded-lg p-2 w-20 dark:text-white"
                placeholder="Reps"
                value={set.reps.toString()}
                onChangeText={(value) =>
                  handleUpdateSet(exercise.id, i, "reps", value)
                }
                keyboardType="numeric"
              />
              <TextInput
                className="border border-gray-300 rounded-lg p-2 w-20 dark:text-white"
                placeholder="Weight (kg)"
                value={set.weight?.toString() || ""}
                onChangeText={(value) =>
                  handleUpdateSet(exercise.id, i, "weight", value)
                }
                keyboardType="numeric"
              />
              <Button
                onPress={() => handleDuplicateSet(exercise.id, i)}
                size="sm"
                variant="outline"
              >
                <Text>
                  <Copy size={16} />
                </Text>
              </Button>
              <Button
                onPress={() => handleDeleteSet(exercise.id, i)}
                size="sm"
                variant="destructive"
              >
                <Text>
                  <Trash2 size={16} />
                </Text>
              </Button>
            </View>
          ))}
          <View className="flex-row items-center mt-2 w-full">
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mr-2 w-20 dark:text-white"
              placeholder="Reps"
              value={setInputs[exercise.id]?.reps || ""}
              onChangeText={(value) =>
                handleInputChange(exercise.id, "reps", value)
              }
              keyboardType="numeric"
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mr-2 w-20 dark:text-white"
              placeholder="Weight (kg)"
              value={setInputs[exercise.id]?.weight || ""}
              onChangeText={(value) =>
                handleInputChange(exercise.id, "weight", value)
              }
              keyboardType="numeric"
            />
            <Button onPress={() => handleAddSet(exercise.id)} size="sm">
              <Text>
                <Plus size={16} />
              </Text>
            </Button>
          </View>
        </View>
      ))}
      <Button onPress={endWorkout} className="mt-4">
        <Text>End Workout</Text>
      </Button>
    </View>
  );
}
