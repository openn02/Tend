"use client";

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [envVar, setEnvVar] = useState<string>('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Test environment variable
    setEnvVar(process.env.NEXT_PUBLIC_BACKEND_URL || 'Not set');

    // Test API connectivity
    const testApi = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setApiResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testApi();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded">
            NEXT_PUBLIC_BACKEND_URL: {envVar}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">API Response</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {apiResponse ? JSON.stringify(apiResponse, null, 2) : 'Loading...'}
          </pre>
        </div>

        {error && (
          <div className="text-red-500">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <pre className="bg-red-50 p-4 rounded">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
} 