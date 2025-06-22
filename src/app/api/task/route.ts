import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Task } from '@/types';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  
  try {
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const filteredTasks = await collection
      .find({ date, userEmail: session.user!.email })
      .toArray();
    
    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const task: Omit<Task, 'id'> = await request.json();
    const newTask: Task = { ...task, id: Date.now(), userEmail: session.user!.email };
    
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    await collection.insertOne(newTask);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedTask: Task = await request.json();

    if (updatedTask.userEmail !== session.user!.email) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    await collection.updateOne(
      { id: updatedTask.id, userEmail: session.user!.email },
      { $set: updatedTask }
    );
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    
    const client = await clientPromise;
    const db = client.db('dailyplanner');
    const collection = db.collection('tasks');
    
    const result = await collection.deleteOne({ 
      id, 
      userEmail: session.user!.email 
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 