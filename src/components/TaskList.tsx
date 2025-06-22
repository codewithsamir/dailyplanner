'use client';

import { Task } from '@/types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: Task['_id']) => void;
  onToggleReminder: (id: Task['_id']) => void;
  onUpdateStatus: (id: Task['_id'], status: 'remaining' | 'done' | 'failed') => void;
  onUpdateReason: (id: Task['_id'], reason: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete, onToggleReminder, onUpdateStatus, onUpdateReason }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">No tasks for this day. Add one!</p>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem
          key={task._id?.toString()}
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