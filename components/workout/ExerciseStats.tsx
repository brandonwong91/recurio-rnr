import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useWorkoutStore } from '~/lib/stores/workoutStore';
import { Button } from '~/components/ui/button';
import { Edit, Trash2 } from 'lucide-react-native';
import { EditExerciseSet } from './EditExerciseSet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

type ExerciseStatsProps = {
  exerciseId: string;
};

export function ExerciseStats({ exerciseId }: ExerciseStatsProps) {
  const {
    setsForExercise,
    fetchSetsForExercise,
    deleteSetById,
  } = useWorkoutStore();
  const [editingSetId, setEditingSetId] = useState<string | null>(null);

  useEffect(() => {
    fetchSetsForExercise(exerciseId);
  }, [exerciseId]);

  const renderItem = ({ item }: { item: any }) => {
    if (editingSetId === item.id) {
      return <EditExerciseSet set={item} onFinished={() => setEditingSetId(null)} />;
    }

    return (
      <View className="flex-row justify-between items-center p-2 border-b border-gray-200">
        <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
        <Text>{item.reps} reps</Text>
        <Text>{item.weight ? `${item.weight} kg` : ''}</Text>
        <View className="flex-row">
          <Button variant="ghost" size="sm" onPress={() => setEditingSetId(item.id)}>
            <Edit size={16} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 size={16} color="red" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this set.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  <Text>Cancel</Text>
                </AlertDialogCancel>
                <AlertDialogAction onPress={() => deleteSetById(item.id)}>
                  <Text>Delete</Text>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </View>
      </View>
    );
  };

  return (
    <View>
      <FlatList
        data={setsForExercise}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
