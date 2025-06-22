'use client';

import { Task } from '@/types';
import NotificationToggle from './NotificationToggle';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleReminder: (id: number) => void;
  onUpdateStatus: (id: number, status: 'remaining' | 'done' | 'failed') => void;
  onUpdateReason: (id: number, reason: string) => void;
}

const statusStyles = {
  remaining: 'border-gray-300',
  done: 'border-green-500',
  failed: 'border-red-500',
};

export default function TaskItem({ task, onEdit, onDelete, onToggleReminder, onUpdateStatus, onUpdateReason }: TaskItemProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateStatus(task.id, e.target.value as 'remaining' | 'done' | 'failed');
  };

  return (
    <div className={`p-4 rounded-lg shadow-md bg-white dark:bg-gray-800 border-l-4 ${statusStyles[task.status]}`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className={`font-bold text-lg text-gray-800 dark:text-white ${task.status === 'done' ? 'line-through' : ''}`}>
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{task.description}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{task.time}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select value={task.status} onChange={handleStatusChange} className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white">
            <option value="remaining">Remaining</option>
            <option value="done">Done</option>
            <option value="failed">Failed</option>
          </select>
          <NotificationToggle
            enabled={task.reminder}
            onToggle={() => onToggleReminder(task.id)}
          />
          <button onClick={() => onEdit(task)} className="p-2 text-blue-600 hover:text-blue-800">
            Edit
          </button>
          <button onClick={() => onDelete(task.id)} className="p-2 text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
      {task.status === 'failed' && (
        <div>
          <input
            type="text"
            placeholder="Reason for failure"
            value={task.reason || ''}
            onChange={(e) => onUpdateReason(task.id, e.target.value)}
            className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white text-sm"
          />
        </div>
      )}
    </div>
  );
} 