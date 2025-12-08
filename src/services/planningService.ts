import { supabase } from '../lib/supabase';
import { Task } from '../types';

export interface Planning {
  id: string;
  name: string;
  created_at: string;
  file_name: string;
}

export interface PlanningWithTasks extends Planning {
  tasks: Task[];
}

export const savePlanning = async (
  name: string,
  fileName: string,
  tasks: Task[]
): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Vous devez être connecté pour sauvegarder un planning');
  }

  // Check if a planning with the same name already exists
  const { data: existingPlannings } = await supabase
    .from('plannings')
    .select('id, name')
    .eq('user_id', user.id)
    .eq('name', name);

  if (existingPlannings && existingPlannings.length > 0) {
    throw new Error(`Un planning nommé "${name}" existe déjà. Veuillez choisir un autre nom.`);
  }

  const { data: planning, error: planningError } = await supabase
    .from('plannings')
    .insert({
      name,
      file_name: fileName,
      user_id: user.id,
    })
    .select()
    .maybeSingle();

  if (planningError || !planning) {
    throw new Error('Erreur lors de la sauvegarde du planning');
  }

  const tasksToInsert = tasks.map((task) => ({
    planning_id: planning.id,
    title: task.title,
    start_time: task.startTime,
    end_time: task.endTime,
    duration: task.duration,
    category: task.category,
    priority: task.priority,
    description: task.description,
    color: task.color,
    status: task.status || 'to_do',
    is_paused: task.isPaused || false,
    is_flagged: task.isFlagged || false,
  }));

  const { error: tasksError } = await supabase
    .from('tasks')
    .insert(tasksToInsert);

  if (tasksError) {
    await supabase.from('plannings').delete().eq('id', planning.id);
    throw new Error('Erreur lors de la sauvegarde des tâches');
  }

  return planning.id;
};

export const getAllPlannings = async (): Promise<Planning[]> => {
  const { data, error } = await supabase
    .from('plannings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Erreur lors du chargement de l\'historique');
  }

  return data || [];
};

export const getPlanningWithTasks = async (
  planningId: string
): Promise<PlanningWithTasks | null> => {
  const { data: planning, error: planningError } = await supabase
    .from('plannings')
    .select('*')
    .eq('id', planningId)
    .maybeSingle();

  if (planningError || !planning) {
    throw new Error('Planning non trouvé');
  }

  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .eq('planning_id', planningId)
    .order('start_time');

  if (tasksError) {
    throw new Error('Erreur lors du chargement des tâches');
  }

  const tasks: Task[] = (tasksData || []).map((t) => ({
    id: t.id,
    title: t.title,
    startTime: t.start_time,
    endTime: t.end_time,
    duration: t.duration,
    category: t.category,
    priority: t.priority as 'low' | 'medium' | 'high' | undefined,
    description: t.description,
    color: t.color,
    status: t.status as 'to_do' | 'in_progress' | 'done',
    isPaused: t.is_paused,
    isFlagged: t.is_flagged,
  }));

  return {
    ...planning,
    tasks,
  };
};

export const updatePlanning = async (
  planningId: string,
  tasks: Task[]
): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Vous devez être connecté pour mettre à jour un planning');
  }

  // Delete existing tasks
  const { error: deleteError } = await supabase
    .from('tasks')
    .delete()
    .eq('planning_id', planningId);

  if (deleteError) {
    throw new Error('Erreur lors de la suppression des anciennes tâches');
  }

  // Insert new tasks
  const tasksToInsert = tasks.map((task) => ({
    planning_id: planningId,
    title: task.title,
    start_time: task.startTime,
    end_time: task.endTime,
    duration: task.duration,
    category: task.category,
    priority: task.priority,
    description: task.description,
    color: task.color,
    status: task.status || 'to_do',
    is_paused: task.isPaused || false,
    is_flagged: task.isFlagged || false,
  }));

  const { error: insertError } = await supabase
    .from('tasks')
    .insert(tasksToInsert);

  if (insertError) {
    throw new Error('Erreur lors de la mise à jour des tâches');
  }
};

export const deletePlanning = async (planningId: string): Promise<void> => {
  const { error } = await supabase
    .from('plannings')
    .delete()
    .eq('id', planningId);

  if (error) {
    throw new Error('Erreur lors de la suppression du planning');
  }
};
