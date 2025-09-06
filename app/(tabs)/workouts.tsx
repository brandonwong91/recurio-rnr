import React from "react";
import { View, ScrollView } from "react-native";
import { Text } from "~/components/ui/text";
import { AddExerciseForm } from "~/components/workout/AddExerciseForm";
import { AddWorkoutForm } from "~/components/workout/AddWorkoutForm";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import * as Accordion from "@rn-primitives/accordion";
import { Badge } from "~/components/ui/badge";

export default function WorkoutsScreen() {
  const { workouts, exercises } = useWorkoutStore();

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
        {workouts.map((workout) => (
          <View key={workout.id} className="p-4 border rounded-lg mb-4">
            <Text className="text-xl font-bold">{workout.name}</Text>
            {workout.exercises.map((exercise) => (
              <Text key={exercise.id} className="ml-4 mt-2">
                - {exercise.name}
              </Text>
            ))}
          </View>
        ))}
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
