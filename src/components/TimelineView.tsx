import { Task } from '../types';

interface TimelineViewProps {
  tasks: Task[];
}

export const TimelineView = ({ tasks }: TimelineViewProps) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getTaskPosition = (task: Task) => {
    const [startHour, startMinute] = task.startTime.split(':').map(Number);
    const [endHour, endMinute] = task.endTime.split(':').map(Number);

    const startPercent = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
    const endPercent = ((endHour * 60 + endMinute) / (24 * 60)) * 100;
    const height = endPercent - startPercent;

    return { top: `${startPercent}%`, height: `${height}%` };
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Vue chronologique</h2>

      <div className="relative">
        <div className="flex">
          <div className="w-16 flex-shrink-0">
            {hours.map((hour) => (
              <div key={hour} className="h-20 text-sm text-gray-500 flex items-start">
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          <div className="flex-1 relative border-l-2 border-gray-200 ml-4">
            {hours.map((hour) => (
              <div key={hour} className="h-20 border-b border-gray-100"></div>
            ))}

            <div className="absolute inset-0 left-4">
              {sortedTasks.map((task) => {
                const position = getTaskPosition(task);
                return (
                  <div
                    key={task.id}
                    className="absolute left-0 right-0 mx-2 p-3 rounded-lg text-white shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                    style={{
                      top: position.top,
                      height: position.height,
                      backgroundColor: task.color || '#3b82f6',
                      minHeight: '40px',
                    }}
                  >
                    <div className="font-semibold text-sm truncate">{task.title}</div>
                    <div className="text-xs opacity-90 mt-1">
                      {task.startTime} - {task.endTime}
                    </div>
                    {task.category && (
                      <div className="text-xs opacity-75 mt-1 truncate">{task.category}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
