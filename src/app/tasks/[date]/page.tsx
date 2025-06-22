'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import TaskList from '@/components/TaskList';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types';
import toast from 'react-hot-toast';

type TaskFormData = Omit<Task, '_id' | 'userId' | 'date' | 'status' | 'reason'>;

export default function TasksPage() {
  const router = useRouter();
  const params = useParams();
  const date = params.date as string;
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    },
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      tasks.forEach(task => {
        if (task.time === currentTime && task.reminder && task.status === 'remaining') {
          const notificationKey = `notification-sent-${task._id}-${date}`;
          if (!localStorage.getItem(notificationKey)) {
            new Notification(`Reminder: ${task.title}`);
            new Audio('/audio/beep.mp3').play().catch(e => console.error("Error playing sound:", e));
            localStorage.setItem(notificationKey, 'true');
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tasks, date]);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (date) {
      fetch(`/api/task?date=${date}`)
        .then(res => res.json())
        .then(setTasks);
    }
  }, [date]);

  const saveTasks = async (method: 'POST' | 'PUT' | 'DELETE', body?: Partial<Task> | { _id: Task['_id'] }) => {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    };
    const response = await fetch('/api/task', options);
    // Refetch tasks to ensure UI is in sync with the server
    fetch(`/api/task?date=${date}`).then(res => res.json()).then(setTasks);
    return response;
  };

  const handleFormSubmit = (taskData: TaskFormData) => {
    if (editingTask) {
      const updatedTask = { ...editingTask, ...taskData };
      saveTasks('PUT', updatedTask).then(() => toast.success('Task updated successfully!'));
    } else {
      const newTaskData = { ...taskData, date, status: 'remaining' as const };
      saveTasks('POST', newTaskData).then(() => toast.success('Task added successfully!'));
    }
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleUpdateTaskStatus = (id: Task['_id'], status: 'remaining' | 'done' | 'failed') => {
    const taskToUpdate = tasks.find(t => t._id === id);
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, status };
       if (status !== 'failed') {
          delete updatedTask.reason;
        }
      saveTasks('PUT', updatedTask).then(() => toast.success('Task status updated!'));
    }
  };

  const handleUpdateTaskReason = (id: Task['_id'], reason: string) => {
    const taskToUpdate = tasks.find(t => t._id === id);
     if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, reason };
      saveTasks('PUT', updatedTask);
    }
  };

  const handleDeleteTask = (id: Task['_id']) => {
    saveTasks('DELETE', { _id: id }).then(() => toast.success('Task deleted successfully!'));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    router.push(`/tasks/${newDate}`);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {isOffline && (
        <div className="bg-yellow-500 text-white text-center p-2 mb-4 rounded-md">
          You are currently offline. Changes will be saved locally and synced when you reconnect.
        </div>
      )}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Daily Planner</h1>
        <div>
          <span className="mr-4 text-gray-800 dark:text-white">Welcome, {session?.user?.name}</span>
          <button onClick={() => signOut()} className="p-2 bg-red-600 text-white rounded-md">
            Sign Out
          </button>
        </div>
        <input
          type="date"
          value={date}
          onChange={handleDateChange}
          className="mt-4 sm:mt-0 p-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
        />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <TaskForm
            onSubmit={handleFormSubmit}
            editingTask={editingTask}
            onCancel={() => setEditingTask(null)}
          />
        </div>
        <div className="md:col-span-2">
          <TaskList
            tasks={tasks}
            onEdit={(task) => {
              setEditingTask(task);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onToggleReminder={(id: Task['_id']) => {
              const taskToUpdate = tasks.find(t => t._id === id);
              if (taskToUpdate) {
                const updatedTask = { ...taskToUpdate, reminder: !taskToUpdate.reminder };
                saveTasks('PUT', updatedTask);
              }
            }}
            onUpdateStatus={handleUpdateTaskStatus}
            onUpdateReason={handleUpdateTaskReason}
          />
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
            <TaskForm
              onSubmit={handleFormSubmit}
              editingTask={editingTask}
              onCancel={() => {
                setEditingTask(null);
                setIsModalOpen(false);
              }}
            />
          </div>
        </div>
      )}
      <button
        onClick={() => {
          setEditingTask(null);
          setIsModalOpen(true);
        }}
        className="md:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg"
      >
        Add Task
      </button>
    </div>
  );
} 