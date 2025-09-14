import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '~/components/ui/alert-dialog';
import { AddWorkoutForm } from './AddWorkoutForm';
import { Button } from '~/components/ui/button';
import { X } from 'lucide-react-native';

type AddWorkoutDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function AddWorkoutDialog({ isOpen, onOpenChange }: AddWorkoutDialogProps) {
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
          <AlertDialogTitle>Add New Workout</AlertDialogTitle>
          <AlertDialogDescription>
            Create a new workout plan by giving it a name and selecting exercises.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AddWorkoutForm onFinished={() => onOpenChange(false)} />
      </AlertDialogContent>
    </AlertDialog>
  );
}
