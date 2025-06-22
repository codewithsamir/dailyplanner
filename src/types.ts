export interface Task {
  id: number;
  date: string;
  userEmail: string;
  title: string;
  description: string;
  time: string;
  reminder: boolean;
  status: 'remaining' | 'done' | 'failed';
  reason?: string;
} 