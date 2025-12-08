import { Clock, Tag, AlertCircle, Flag, CheckCircle, Circle, Loader } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { updateTaskStatus, updateTaskFlaggedStatus } from '../services/taskService';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onUpdate?: () => void;
}

export const TaskCard = ({ task, onClick, onUpdate }: TaskCardProps) => {
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status || 'to_do');
  const localIsPaused = task.isPaused || false;
  const [localIsFlagged, setLocalIsFlagged] = useState(task.isFlagged || false);
  const [updating, setUpdating] = useState(false);

  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-4 border-red-500';
      case 'medium':
        return 'border-l-4 border-yellow-500';
      case 'low':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getPriorityLabel = () => {
    switch (task.priority) {
      case 'high':
        return 'Haute';
      case 'medium':
        return 'Moyenne';
      case 'low':
        return 'Basse';
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (localStatus) {
      case 'done':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Loader size={16} className="text-blue-600" />;
      default:
        return <Circle size={16} className="text-gray-400" />;
    }
  };

  const getStatusLabel = () => {
    switch (localStatus) {
      case 'done':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      default:
        return 'À faire';
    }
  };

  const handleStatusChange = async (e: React.MouseEvent, newStatus: TaskStatus) => {
    e.stopPropagation();
    setUpdating(true);
    try {
      await updateTaskStatus(task.id, newStatus);
      setLocalStatus(newStatus);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleFlaggedToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setUpdating(true);
    try {
      const newFlaggedState = !localIsFlagged;
      await updateTaskFlaggedStatus(task.id, newFlaggedState);
      setLocalIsFlagged(newFlaggedState);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating flagged status:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer ${getPriorityStyles()} ${localIsPaused ? 'ring-2 ring-orange-400' : ''} ${localIsFlagged ? 'ring-2 ring-red-500' : ''} ${updating ? 'opacity-50' : ''}`}
      onClick={onClick}
      style={{ borderLeftColor: task.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
        <div className="flex items-center gap-2">
          {task.priority && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                task.priority === 'high'
                  ? 'bg-red-100 text-red-700'
                  : task.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {getPriorityLabel()}
            </span>
          )}
          <button
            onClick={handleFlaggedToggle}
            disabled={updating}
            className={`p-1 rounded hover:bg-gray-100 transition-colors ${
              localIsFlagged ? 'text-red-600' : 'text-gray-400'
            }`}
            title={localIsFlagged ? 'Retirer le flag rouge' : 'Ajouter un flag rouge'}
          >
            <Flag size={16} fill={localIsFlagged ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const statusOrder: TaskStatus[] = ['to_do', 'in_progress', 'done'];
            const currentIndex = statusOrder.indexOf(localStatus);
            const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
            handleStatusChange(e, nextStatus);
          }}
          disabled={updating}
          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
        >
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Clock size={16} />
        <span>
          {task.startTime} - {task.endTime}
        </span>
        <span className="text-gray-400">•</span>
        <span className="font-medium">{task.duration} min</span>
      </div>

      {task.category && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Tag size={16} />
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: `${task.color}20`, color: task.color }}
          >
            {task.category}
          </span>
        </div>
      )}

      {task.description && (
        <div className="flex items-start gap-2 text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <p className="line-clamp-2">{task.description}</p>
        </div>
      )}
    </div>
  );
};
