import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const DebugLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('operations@hostelhaven.com');
  const [password, setPassword] = useState('Ops123!');
  const [debugInfo, setDebugInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setDebugInfo('Starting login test...\n');
    
    try {
      // Test backend login
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      
      setDebugInfo(prev => prev + 'Calling backend login API...\n');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const result = await response.json();
      
      setDebugInfo(prev => prev + `Backend response status: ${response.status}\n`);
      setDebugInfo(prev => prev + `Backend response: ${JSON.stringify(result, null, 2)}\n`);

      if (!response.ok) {
        setDebugInfo(prev => prev + `Login failed: ${result.message}\n`);
        return;
      }

      if (result.success && result.data?.user) {
        const user = result.data.user;
        setDebugInfo(prev => prev + `✅ Login successful!\n`);
        setDebugInfo(prev => prev + `User role: ${user.role}\n`);
        setDebugInfo(prev => prev + `User status: ${user.status || 'not specified'}\n`);
        setDebugInfo(prev => prev + `Full user data: ${JSON.stringify(user, null, 2)}\n`);

        // Test Supabase session
        setDebugInfo(prev => prev + `Setting Supabase session...\n`);
        await supabase.auth.setSession({
          access_token: result.data.session.accessToken,
          refresh_token: result.data.session.refreshToken,
        });

        // Test /me endpoint
        setDebugInfo(prev => prev + `Testing /me endpoint...\n`);
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${result.data.session.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        const meResult = await meResponse.json();
        setDebugInfo(prev => prev + `/me response: ${JSON.stringify(meResult, null, 2)}\n`);

        // Test dashboard path
        const dashboardPath = user.role === 'hostel_operations_assistant' ? '/operations-dashboard' : '/dashboard';
        setDebugInfo(prev => prev + `Dashboard path: ${dashboardPath}\n`);
        
        setDebugInfo(prev => prev + `✅ All tests completed successfully!\n`);
        setDebugInfo(prev => prev + `You can now navigate to: ${dashboardPath}\n`);
      }
    } catch (error) {
      setDebugInfo(prev => prev + `❌ Error: ${error.message}\n`);
      setDebugInfo(prev => prev + `Stack trace: ${error.stack}\n`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-6">Debug Login for Hostel Operations Assistant</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Login Credentials</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={testLogin}
                  disabled={isLoading}
                  className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Testing...' : 'Test Login'}
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-slate-700 mb-4">Debug Output</h2>
              <div className="bg-slate-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                <pre className="whitespace-pre-wrap">{debugInfo}</pre>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Expected Test Credentials</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> operations@hostelhaven.com</p>
              <p><strong>Password:</strong> Ops123!</p>
              <p><strong>Expected Role:</strong> hostel_operations_assistant</p>
              <p><strong>Expected Dashboard:</strong> /operations-dashboard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugLogin;
