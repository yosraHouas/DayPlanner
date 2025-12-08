import { supabase } from '../lib/supabase';
import { TaskStatus } from '../types';

export const updateTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId);

  if (error) {
    throw new Error('Erreur lors de la mise à jour du statut');
  }
};

export const updateTaskPausedFlag = async (
  taskId: string,
  isPaused: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ is_paused: isPaused })
    .eq('id', taskId);

  if (error) {
    throw new Error('Erreur lors de la mise à jour du flag');
  }
};

export const updateTaskFlaggedStatus = async (
  taskId: string,
  isFlagged: boolean
): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .update({ is_flagged: isFlagged })
    .eq('id', taskId);

  if (error) {
    throw new Error('Erreur lors de la mise à jour du flag rouge');
  }
};
