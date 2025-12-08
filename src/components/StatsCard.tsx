import { Clock, ListTodo, TrendingUp } from 'lucide-react';
import { Task } from '../types';

interface StatsCardProps {
  tasks: Task[];
}

export const StatsCard = ({ tasks }: StatsCardProps) => {
  const totalTasks = tasks.length;
  const totalDuration = tasks.reduce((sum, task) => sum + task.duration, 0);
  const totalHours = Math.floor(totalDuration / 60);
  const totalMinutes = totalDuration % 60;

  const categoryCounts = tasks.reduce((acc, task) => {
    if (task.category) {
      acc[task.category] = (acc[task.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <ListTodo size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Tâches</p>
            <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock size={24} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Durée totale</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalHours}h {totalMinutes}m
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={24} className="text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Catégorie principale</p>
            <p className="text-xl font-bold text-gray-900">
              {topCategory ? topCategory[0] : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
