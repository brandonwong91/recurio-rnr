import React, { useEffect } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import { AddExerciseForm } from "~/components/workout/AddExerciseForm";
import { AddWorkoutForm } from "~/components/workout/AddWorkoutForm";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import * as Accordion from "@rn-primitives/accordion";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { EditExerciseItem } from "~/components/workout/EditExerciseItem";
import { EditWorkoutItem } from "~/components/workout/EditWorkoutItem";
import { ActiveWorkout } from "~/components/workout/ActiveWorkout";

export default function WorkoutsScreen() {
  const {
    workouts,
    exercises,
    editingExerciseId,
    setEditingExerciseId,
    editingWorkoutId,
    setEditingWorkoutId,
    activeWorkoutSession,
    startWorkout,
    fetchExercises,
    fetchWorkouts,
  } = useWorkoutStore();

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
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
        <View className="flex-row flex-wrap">
          {exercises.map((exercise) => (
            <Badge key={exercise.id} variant="secondary" className="mr-2 mb-2">
              <Text>{exercise.name}</Text>
            </Badge>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
