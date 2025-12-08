export type TaskStatus = 'to_do' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  duration: number;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  description?: string;
  color?: string;
  status?: TaskStatus;
  isPaused?: boolean;
  isFlagged?: boolean;
}

export interface DaySchedule {
  date: Date;
  tasks: Task[];
}
