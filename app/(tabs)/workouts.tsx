import React, { useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { AddExerciseForm } from "~/components/workout/AddExerciseForm";
import { AddWorkoutForm } from "~/components/workout/AddWorkoutForm";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import * as Accordion from "@rn-primitives/accordion";
import { Button } from "~/components/ui/button";
import { EditExerciseItem } from "~/components/workout/EditExerciseItem";
import { EditWorkoutItem } from "~/components/workout/EditWorkoutItem";
import { ActiveWorkout } from "~/components/workout/ActiveWorkout";

function daysAgo(dateString: string | null) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return `${diffDays} days ago`;
}

export default function WorkoutsScreen() {
  const {
    workouts,
    exercisesWithMetrics,
    editingExerciseId,
    setEditingExerciseId,
    editingWorkoutId,
    setEditingWorkoutId,
    activeWorkoutSession,
    startWorkout,
    fetchExercisesWithMetrics,
    fetchWorkouts,
  } = useWorkoutStore();

  useEffect(() => {
    fetchWorkouts();
    fetchExercisesWithMetrics();
  }, []);

  if (activeWorkoutSession) {
    return <ActiveWorkout />;
  }

  return (
    <ScrollView className="flex-1 p-4 flex flex-col max-w-md w-full mx-auto bg-secondary/30">
      <Accordion.Root type="multiple" className="w-full">
        <Accordion.Item value="add-exercise">
          <Accordion.Header>
            <Accordion.Trigger>
              <View className="flex-row justify-between items-center p-2 border rounded-lg text-center">
                <Text className="font-bold text-center">Add Exercise</Text>
              </View>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-4">
            <AddExerciseForm />
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="add-workout" className="mt-4">
          <Accordion.Header>
            <Accordion.Trigger>
              <View className="flex-row justify-between items-center p-2 border rounded-lg text-center">
                <Text className="font-bold text-center">Add Workout</Text>
              </View>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-4">
            <AddWorkoutForm />
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      <View className="mt-8">
        <Text className="text-2xl font-bold mb-4">Workouts</Text>
        {workouts.map((workout) =>
          editingWorkoutId === workout.id ? (
            <EditWorkoutItem key={workout.id} workout={workout} />
          ) : (
            <View key={workout.id} className="p-4 border rounded-lg mb-4">
              <View className="flex-row justify-between items-center">
                <Pressable onPress={() => setEditingWorkoutId(workout.id)}>
                  <Text className="text-xl font-bold">{workout.name}</Text>
                </Pressable>
                <Button onPress={() => startWorkout(workout.id)} size="sm">
                  <Text>Start</Text>
                </Button>
              </View>
              {workout.exercises.map((exercise) =>
                editingExerciseId === exercise.id ? (
                  <EditExerciseItem key={exercise.id} exercise={exercise} />
                ) : (
                  <Pressable
                    key={exercise.id}
                    onPress={() => setEditingExerciseId(exercise.id)}
                  >
                    <Text className="ml-4 mt-2">- {exercise.name}</Text>
                  </Pressable>
                )
              )}
            </View>
          )
        )}
      </View>

      <View className="mt-8">
        <Text className="text-2xl font-bold mb-4">All Exercises</Text>
        <View className="flex flex-col space-y-4">
          {exercisesWithMetrics.map((exercise) =>
            editingExerciseId === exercise.id ? (
              <EditExerciseItem key={exercise.id} exercise={exercise} />
            ) : (
              <Pressable
                key={exercise.id}
                onPress={() => setEditingExerciseId(exercise.id)}
              >
                <View className="p-4 border rounded-lg">
                  <Text className="text-lg font-bold">{exercise.name}</Text>
                  <Text>Last done: {daysAgo(exercise.last_done)}</Text>
                  {exercise.best_weight ? (
                    <Text>Best weight: {exercise.best_weight} kg</Text>
                  ) : exercise.best_reps ? (
                    <Text>Best reps: {exercise.best_reps}</Text>
                  ) : (
                    <Text>No data yet</Text>
                  )}
                </View>
              </Pressable>
            )
          )}
        </View>
      </View>
    </ScrollView>
  );
}
