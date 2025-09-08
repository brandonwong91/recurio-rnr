import React, { useState } from "react";
import { View, TextInput } from "react-native";
import { Button } from "~/components/ui/button";
import { useWorkoutStore } from "~/lib/stores/workoutStore";
import { Check, X } from "lucide-react-native";

type EditExerciseSetProps = {
  set: any;
  onFinished: () => void;
};

export function EditExerciseSet({ set, onFinished }: EditExerciseSetProps) {
  const { updateSetById } = useWorkoutStore();
  const [reps, setReps] = useState(set.reps.toString());
  const [weight, setWeight] = useState(set.weight ? set.weight.toString() : "");

  const handleSave = () => {
    const repsNum = parseInt(reps, 10);
    const weightNum = weight ? parseInt(weight, 10) : undefined;
    if (!isNaN(repsNum)) {
      updateSetById(set.id, repsNum, weightNum);
      onFinished();
    }
  };

  return (
    <View className="flex-row items-center p-2">
      <TextInput
        className="flex-1 border border-gray-300 w-20 rounded-lg p-2 mr-2 dark:text-white"
        value={reps}
        onChangeText={setReps}
        keyboardType="number-pad"
        placeholder="Reps"
      />
      <TextInput
        className="flex-1 border border-gray-300 w-20 rounded-lg p-2 mr-2 dark:text-white"
        value={weight}
        onChangeText={setWeight}
        keyboardType="number-pad"
        placeholder="Weight (kg)"
      />
      <Button onPress={handleSave} size="sm" variant="ghost">
        <Check size={16} color="green" />
      </Button>
      <Button onPress={onFinished} size="sm" variant="ghost">
        <X size={16} color="red" />
      </Button>
    </View>
  );
}
