import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const TestDashboard = () => {
  const [status, setStatus] = useState('Loading...');
  const [backendStatus, setBackendStatus] = useState('Testing...');
  const [supabaseStatus, setSupabaseStatus] = useState('Testing...');

  useEffect(() => {
    testConnections();
  }, []);

  const testConnections = async () => {
    // Test backend connection
    try {
      const response = await fetch('http://localhost:3002/health');
      if (response.ok) {
        const data = await response.json();
        setBackendStatus(`✅ Backend OK: ${data.message}`);
      } else {
        setBackendStatus('❌ Backend connection failed');
      }
    } catch (error) {
      setBackendStatus(`❌ Backend error: ${error.message}`);
    }

    // Test Supabase connection
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setSupabaseStatus(`❌ Supabase error: ${error.message}`);
      } else {
        setSupabaseStatus('✅ Supabase connection OK');
      }
    } catch (error) {
      setSupabaseStatus(`❌ Supabase error: ${error.message}`);
    }

    setStatus('Tests completed');
  };

  const testBackendAPI = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert('No active session. Please login first.');
        return;
      }

      const response = await fetch('http://localhost:3002/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ API Test Success: User ${result.data.user.fullName}`);
      } else {
        const error = await response.text();
        alert(`❌ API Test Failed: ${error}`);
      }
    } catch (error) {
      alert(`❌ API Test Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">HostelHaven Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p><strong>Overall Status:</strong> {status}</p>
            <p><strong>Backend:</strong> {backendStatus}</p>
            <p><strong>Supabase:</strong> {supabaseStatus}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-x-4">
            <button 
              onClick={testConnections}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Retest Connections
            </button>
            <button 
              onClick={testBackendAPI}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Backend API
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
            <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</p>
            <p><strong>Current URL:</strong> {window.location.href}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;