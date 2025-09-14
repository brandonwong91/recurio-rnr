import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '~/components/ui/alert-dialog';
import { AddExerciseForm } from './AddExerciseForm';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react-native';

type AddExerciseDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddExerciseDialog({ isOpen, onOpenChange }: AddExerciseDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onPress={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Exercise</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new exercise to your list of available exercises.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AddExerciseForm onFinished={() => onOpenChange(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
