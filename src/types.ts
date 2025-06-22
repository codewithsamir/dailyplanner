import { ObjectId } from "mongodb";

export interface Task {
  _id?: ObjectId;
  userId: string;
  date: string;
  title: string;
  description: string;
  time: string;
  reminder: boolean;
  status: 'remaining' | 'done' | 'failed';
  reason?: string;
} 