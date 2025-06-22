'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      const today = new Date().toISOString().split('T')[0];
      router.push(`/tasks/${today}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to Your Personal Day Planner
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md">
          Please sign in to continue.
        </p>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
        >
          Sign in with Google
        </button>
      </main>
    </div>
  );
}
