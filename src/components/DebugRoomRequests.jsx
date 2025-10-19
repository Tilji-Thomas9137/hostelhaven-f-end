import { useState } from 'react';
import { supabase } from '../lib/supabase';

const DebugRoomRequests = () => {
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testRoomRequests = async () => {
    setIsLoading(true);
    setDebugInfo('Starting room requests test...\n');
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      // Test 1: Emergency check (no auth required)
      setDebugInfo(prev => prev + '=== TEST 1: Emergency Check (No Auth) ===\n');
      try {
        const emergencyResponse = await fetch(`${API_BASE_URL}/api/room-requests/emergency-check`);
        const emergencyResult = await emergencyResponse.json();
        setDebugInfo(prev => prev + `Emergency check result: ${JSON.stringify(emergencyResult, null, 2)}\n\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `Emergency check error: ${error.message}\n\n`);
      }

      // Test 2: Simple test endpoint (no auth required)
      setDebugInfo(prev => prev + '=== TEST 2: Simple Test Endpoint (No Auth) ===\n');
      try {
        const simpleResponse = await fetch(`${API_BASE_URL}/api/room-requests/simple-test`);
        const simpleResult = await simpleResponse.json();
        setDebugInfo(prev => prev + `Simple test result: ${JSON.stringify(simpleResult, null, 2)}\n\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `Simple test error: ${error.message}\n\n`);
      }

      // Test 2.5: Test all query endpoint (no auth required)
      setDebugInfo(prev => prev + '=== TEST 2.5: Test All Query (No Auth) ===\n');
      try {
        const testAllResponse = await fetch(`${API_BASE_URL}/api/room-requests/test-all-query`);
        const testAllResult = await testAllResponse.json();
        setDebugInfo(prev => prev + `Test all query result: ${JSON.stringify(testAllResult, null, 2)}\n\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `Test all query error: ${error.message}\n\n`);
      }

      // Test 2.6: Comprehensive debug endpoint (no auth required)
      setDebugInfo(prev => prev + '=== TEST 2.6: Comprehensive Debug (No Auth) ===\n');
      try {
        const comprehensiveResponse = await fetch(`${API_BASE_URL}/api/room-requests/comprehensive-debug`);
        const comprehensiveResult = await comprehensiveResponse.json();
        setDebugInfo(prev => prev + `Comprehensive debug result: ${JSON.stringify(comprehensiveResult, null, 2)}\n\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `Comprehensive debug error: ${error.message}\n\n`);
      }

      // Test 3: Debug all endpoint (no auth required)
      setDebugInfo(prev => prev + '=== TEST 3: Debug All Endpoint (No Auth) ===\n');
      try {
        const debugResponse = await fetch(`${API_BASE_URL}/api/room-requests/debug-all?status=pending&limit=5`);
        const debugResult = await debugResponse.json();
        setDebugInfo(prev => prev + `Debug all result: ${JSON.stringify(debugResult, null, 2)}\n\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `Debug all error: ${error.message}\n\n`);
      }

      // Test 4: Authenticated request
      setDebugInfo(prev => prev + '=== TEST 4: Authenticated Request ===\n');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setDebugInfo(prev => prev + '❌ No session found - please login first\n');
        return;
      }

      setDebugInfo(prev => prev + `✅ Session found for user: ${session.user.email}\n`);
      setDebugInfo(prev => prev + `Session access token: ${session.access_token.substring(0, 20)}...\n`);

      // Test the actual /all endpoint
      setDebugInfo(prev => prev + 'Testing /api/room-requests/all endpoint...\n');
      const response = await fetch(`${API_BASE_URL}/api/room-requests/all?status=pending&limit=10`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      setDebugInfo(prev => prev + `Response status: ${response.status}\n`);
      const result = await response.json();
      setDebugInfo(prev => prev + `Response: ${JSON.stringify(result, null, 2)}\n\n`);

      if (result.success && result.data?.requests) {
        setDebugInfo(prev => prev + `✅ SUCCESS: Found ${result.data.requests.length} room requests\n`);
        if (result.data.requests.length > 0) {
          setDebugInfo(prev => prev + `Sample request: ${JSON.stringify(result.data.requests[0], null, 2)}\n`);
        }
      } else {
        setDebugInfo(prev => prev + `❌ FAILED: ${result.message || 'Unknown error'}\n`);
      }

      // Test 5: Check user role
      setDebugInfo(prev => prev + '=== TEST 5: User Role Check ===\n');
      try {
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });
        const meResult = await meResponse.json();
        setDebugInfo(prev => prev + `User role check: ${JSON.stringify(meResult, null, 2)}\n`);
      } catch (error) {
        setDebugInfo(prev => prev + `User role check error: ${error.message}\n`);
      }

    } catch (error) {
      setDebugInfo(prev => prev + `❌ Unexpected error: ${error.message}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Debug Room Requests</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Test Controls</h2>
              <button
                onClick={testRoomRequests}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Testing...' : 'Test Room Requests'}
              </button>
              
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Endpoints</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Emergency Check:</strong> /api/room-requests/emergency-check</p>
                  <p><strong>Simple Test:</strong> /api/room-requests/simple-test</p>
                  <p><strong>Comprehensive Debug:</strong> /api/room-requests/comprehensive-debug</p>
                  <p><strong>Debug All:</strong> /api/room-requests/debug-all</p>
                  <p><strong>All Requests:</strong> /api/room-requests/all</p>
                  <p><strong>User Info:</strong> /api/auth/me</p>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Debug Output</h2>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                <pre className="whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Expected Results</h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p><strong>Emergency Check:</strong> Should show if any room requests exist in the database</p>
              <p><strong>Simple Test:</strong> Should show raw room requests data without filters</p>
              <p><strong>Comprehensive Debug:</strong> Should test different query approaches and show table structure</p>
              <p><strong>Debug All:</strong> Should show basic room requests without authentication</p>
              <p><strong>All Requests:</strong> Should show enriched room requests with user data</p>
              <p><strong>User Role:</strong> Should show your current role and permissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugRoomRequests;
