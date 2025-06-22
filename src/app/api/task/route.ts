import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Task } from '@/types';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  try {
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const filteredTasks = await collection
      .find({ date, userId: session.user.id })
      .toArray();
    
    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task: Omit<Task, '_id'> = await request.json();
    const newTask: Task = { ...task, userId: session.user.id };
    
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const result = await collection.insertOne(newTask);
    return NextResponse.json({ ...newTask, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { _id, ...taskData }: Task = await request.json();

    if (!ObjectId.isValid(_id!)) {
      return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const result = await collection.updateOne(
      { _id: new ObjectId(_id), userId: session.user.id },
      { $set: taskData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Forbidden or task not found' }, { status: 403 });
    }
    
    return NextResponse.json({ _id, ...taskData });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { _id } = await request.json();

    if (!ObjectId.isValid(_id)) {
      return NextResponse.json({ message: 'Invalid task ID' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(_id), 
      userId: session.user.id 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Task not found or forbidden' }, { status: 404 });
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 