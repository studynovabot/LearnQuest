import React, { useState, useEffect } from 'react';
import { config } from '../config';

export default function ApiTest() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHealthEndpoint = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.apiUrl}/health`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testHealthEndpoint();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Configuration Test</h1>

      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Current Configuration</h2>
          <div className="space-y-2 text-sm">
            <div><strong>API URL:</strong> {config.apiUrl || '(relative URLs)'}</div>
            <div><strong>Environment:</strong> {config.environment}</div>
            <div><strong>Production Mode:</strong> {import.meta.env.PROD ? 'Yes' : 'No'}</div>
            <div><strong>VITE_BACKEND_URL:</strong> {import.meta.env.VITE_BACKEND_URL || 'Not set'}</div>
            <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Health Check Test</h2>
          <div className="space-y-2">
            <div><strong>Test URL:</strong> {config.apiUrl}/api/health</div>
            <button
              onClick={testHealthEndpoint}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Health Endpoint'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h3 className="text-red-800 font-semibold">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {healthStatus && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="text-green-800 font-semibold">Health Check Response</h3>
            <pre className="text-sm text-green-700 mt-2 overflow-auto">
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Expected Behavior</h2>
          <ul className="text-sm space-y-1">
            <li>✅ API URL should point to: https://learnquest-backend.onrender.com</li>
            <li>✅ Health check should return status: "ok"</li>
            <li>✅ No CORS errors should occur</li>
            <li>✅ Response should include environment and timestamp</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
