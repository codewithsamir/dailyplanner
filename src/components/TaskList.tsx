'use client';

import { Task } from '@/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onToggleReminder: (id: number) => void;
  onUpdateStatus: (id: number, status: 'remaining' | 'done' | 'failed') => void;
  onUpdateReason: (id: number, reason: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onToggleReminder, onUpdateStatus, onUpdateReason }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No tasks for this day. Add one!</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleReminder={onToggleReminder}
          onUpdateStatus={onUpdateStatus}
          onUpdateReason={onUpdateReason}
        />
      ))}
    </div>
  );
} 