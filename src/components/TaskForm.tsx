'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/types';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'status' | 'date'> | Task) => void;
  editingTask: Task | null;
  onCancel: () => void;
}

export default function TaskForm({ onSubmit, editingTask, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [reminder, setReminder] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setTime(editingTask.time);
      setReminder(editingTask.reminder);
    } else {
      setTitle('');
      setDescription('');
      setTime('');
      setReminder(true);
    }
    setError('');
  }, [editingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !time) {
      setError('Title and time are required.');
      return;
    }
    setError('');
    const taskData = { title, description, time, reminder };
    if (editingTask) {
      onSubmit({ ...taskData, id: editingTask.id, status: editingTask.status, reason: editingTask.reason, date: editingTask.date });
    } else {
      onSubmit(taskData);
    }
    setTitle('');
    setDescription('');
    setTime('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
        ></textarea>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="time">Time</label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
      </div>
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="reminder"
          checked={reminder}
          onChange={(e) => setReminder(e.target.checked)}
          className="mr-2"
        />
        <label className="text-gray-700 dark:text-gray-300" htmlFor="reminder">Set Reminder</label>
      </div>
      <div className="flex justify-between">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {editingTask ? 'Update Task' : 'Save Task'}
        </button>
        {editingTask && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
} 