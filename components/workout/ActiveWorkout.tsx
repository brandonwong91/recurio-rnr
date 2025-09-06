import React, { useState, useEffect } from "react";
import { View, TextInput } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useWorkoutStore } from "~/lib/stores/workoutStore";

export function ActiveWorkout() {
  const {
    activeWorkoutSession,
    workouts,
    addSet,
    updateSet,
    duplicateSet,
    endWorkout,
  } = useWorkoutStore();
  const [setInputs, setSetInputs] = useState<Record<string, { reps: string; weight: string }>>({});
  const [editedSets, setEditedSets] = useState<Record<string, { reps: string; weight: string }[]>>({});

  useEffect(() => {
    if (activeWorkoutSession) {
        const sets: Record<string, { reps: string; weight: string }[]> = {};
        for (const exerciseId in activeWorkoutSession.exerciseSets) {
            sets[exerciseId] = activeWorkoutSession.exerciseSets[exerciseId].map(s => ({
                reps: s.reps.toString(),
                weight: s.weight?.toString() || ''
            }));
        }
        setEditedSets(sets);
    }
  }, [activeWorkoutSession]);


  if (!activeWorkoutSession) {
    return null;
  }

  const activeWorkout = workouts.find(
    (w) => w.id === activeWorkoutSession.workoutId
  );

  if (!activeWorkout) {
    return null;
  }

  const handleInputChange = (exerciseId: string, field: 'reps' | 'weight', value: string) => {
    if (/^\d*$/.test(value)) {
      setSetInputs(prev => ({
        ...prev,
        [exerciseId]: {
          ...prev[exerciseId],
          [field]: value
        }
      }));
    }
  };

  const handleAddSet = (exerciseId: string) => {
    // Save any pending changes for the existing sets of this exercise
    if (editedSets[exerciseId]) {
      editedSets[exerciseId].forEach((_, setIndex) => {
        handleUpdateSet(exerciseId, setIndex);
      });
    }

    const inputs = setInputs[exerciseId] || { reps: '', weight: '' };
    const repCount = parseInt(inputs.reps, 10);
    const weightCount = inputs.weight ? parseInt(inputs.weight, 10) : undefined;
    if (repCount) {
      addSet(exerciseId, { reps: repCount, weight: weightCount });
      setSetInputs(prev => ({
        ...prev,
        [exerciseId]: { reps: '', weight: '' }
      }));
    }
  };

  const handleSetInputChange = (exerciseId: string, setIndex: number, field: 'reps' | 'weight', value: string) => {
    if (/^\d*$/.test(value)) {
        setEditedSets(prev => {
            const newSets = { ...prev };
            if (!newSets[exerciseId]) {
                newSets[exerciseId] = [];
            }
            if (!newSets[exerciseId][setIndex]) {
                newSets[exerciseId][setIndex] = { reps: '', weight: '' };
            }
            newSets[exerciseId][setIndex] = {
                ...newSets[exerciseId][setIndex],
                [field]: value
            };
            return newSets;
        });
    }
  };

  const handleUpdateSet = (exerciseId: string, setIndex: number) => {
    const set = editedSets[exerciseId]?.[setIndex];
    if (set) {
        const repCount = parseInt(set.reps, 10);
        const weightCount = set.weight ? parseInt(set.weight, 10) : undefined;
        if (!isNaN(repCount)) {
            updateSet(exerciseId, setIndex, { reps: repCount, weight: weightCount });
        }
    }
  };

  const handleDuplicateSet = (exerciseId: string, setIndex: number) => {
    // Save any pending changes for the existing sets of this exercise
    if (editedSets[exerciseId]) {
      editedSets[exerciseId].forEach((_, i) => {
        handleUpdateSet(exerciseId, i);
      });
    }

    const set = editedSets[exerciseId]?.[setIndex];
    if (set) {
        const repCount = parseInt(set.reps, 10);
        const weightCount = set.weight ? parseInt(set.weight, 10) : undefined;
        if (!isNaN(repCount)) {
            duplicateSet(exerciseId, setIndex, { reps: repCount, weight: weightCount });
        }
    }
  };

  return (
    <View className="p-4 border rounded-lg mt-4">
      <Text className="text-2xl font-bold mb-4">{activeWorkout.name}</Text>
      {activeWorkout.exercises.map((exercise) => (
        <View key={exercise.id} className="mb-4">
          <Text className="text-lg font-bold">{exercise.name}</Text>
          {activeWorkoutSession.exerciseSets[exercise.id]?.map((set, i) => (
            <View key={i} className="flex-row items-center ml-4">
              <Text>Set {i + 1}:</Text>
              <TextInput
                className="border border-gray-300 rounded-lg p-2 mx-2 w-20 dark:text-white"
                placeholder="Reps"
                value={editedSets[exercise.id]?.[i]?.reps ?? ''}
                onChangeText={(value) => handleSetInputChange(exercise.id, i, 'reps', value)}
                onEndEditing={() => handleUpdateSet(exercise.id, i)}
                keyboardType="numeric"
              />
              <TextInput
                className="border border-gray-300 rounded-lg p-2 mr-2 w-20 dark:text-white"
                placeholder="Weight (kg)"
                value={editedSets[exercise.id]?.[i]?.weight ?? ''}
                onChangeText={(value) => handleSetInputChange(exercise.id, i, 'weight', value)}
                onEndEditing={() => handleUpdateSet(exercise.id, i)}
                keyboardType="numeric"
              />
              <Button onPress={() => handleDuplicateSet(exercise.id, i)} size="sm" variant="outline">
                <Text>Duplicate</Text>
              </Button>
            </View>
          ))}
          <View className="flex-row items-center mt-2">
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mr-2 w-20 dark:text-white"
              placeholder="Reps"
              value={setInputs[exercise.id]?.reps || ''}
              onChangeText={(value) => handleInputChange(exercise.id, 'reps', value)}
              keyboardType="numeric"
            />
            <TextInput
              className="border border-gray-300 rounded-lg p-2 mr-2 w-20 dark:text-white"
              placeholder="Weight (kg)"
              value={setInputs[exercise.id]?.weight || ''}
              onChangeText={(value) => handleInputChange(exercise.id, 'weight', value)}
              keyboardType="numeric"
            />
            <Button onPress={() => handleAddSet(exercise.id)} size="sm">
              <Text>Add Set</Text>
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
