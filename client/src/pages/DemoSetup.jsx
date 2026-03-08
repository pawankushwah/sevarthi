import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Bot, User, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function DemoSetup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState(localStorage.getItem('demoMode') === 'true');
  const [loading, setLoading] = useState(null); // 'customer' | 'provider' | 'admin'
  const [error, setError] = useState('');

  const handleSelect = (isDemo) => {
    localStorage.setItem('demoMode', isDemo ? 'true' : 'false');
    setMode(isDemo);
  };

  const quickLogin = async (role) => {
    const creds = {
      customer: { phone: '9999999999', password: 'password' },
      provider: { phone: '8888888888', password: 'password' },
      admin: { phone: '0000000000', password: 'admin123' }
    };
    
    setLoading(role);
    setError('');
    try {
      const { data } = await api.post('/auth/login', creds[role]);
      login(data.user, data.token);
      if (data.user.role === 'provider') navigate('/provider');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to login as ${role}. Ensure account exists.`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col items-center justify-center p-6 py-12">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2 text-center">App Configuration</h1>
        <p className="text-zinc-400 text-sm text-center mb-8">
          Choose behavior and quickly access demo accounts.
        </p>

        <div className="space-y-6">
          {/* Mode Selection */}
          <section>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">Behavior Mode</h2>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleSelect(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  !mode ? 'border-orange-500 bg-orange-500/10' : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                }`}
              >
                <User className={`w-8 h-8 shrink-0 ${!mode ? 'text-orange-400' : 'text-zinc-500'}`} />
                <div>
                  <h3 className={`font-bold text-sm ${!mode ? 'text-orange-400' : 'text-white'}`}>Normal Mode</h3>
                  <p className="text-[11px] text-zinc-500 leading-tight">Requires multiple real devices to test.</p>
                </div>
              </button>

              <button 
                onClick={() => handleSelect(true)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  mode ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800'
                }`}
              >
                <Bot className={`w-8 h-8 shrink-0 ${mode ? 'text-green-400' : 'text-zinc-500'}`} />
                <div>
                  <h3 className={`font-bold text-sm ${mode ? 'text-green-400' : 'text-white'}`}>Demo Mode (Auto-React)</h3>
                  <p className="text-[11px] text-zinc-500 leading-tight">Bots automatically accept and complete jobs.</p>
                </div>
              </button>
            </div>
          </section>

          {/* Quick Login */}
          <section>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 ml-1">Quick Access</h2>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => quickLogin('customer')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-2 p-5 bg-zinc-800 border border-zinc-700 rounded-2xl hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5 text-orange-400" />
                <span className="text-xs font-bold text-white text-center">Login as<br/>Customer</span>
              </button>
              
              <button 
                onClick={() => quickLogin('provider')}
                disabled={loading}
                className="flex flex-col items-center justify-center gap-2 p-5 bg-zinc-800 border border-zinc-700 rounded-2xl hover:bg-zinc-700 transition-all active:scale-95 disabled:opacity-50"
              >
                <LogIn className="w-5 h-5 text-green-400" />
                <span className="text-xs font-bold text-white text-center">Login as<br/>Provider</span>
              </button>
            </div>
            
            <button 
              onClick={() => quickLogin('admin')}
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-3 p-4 bg-zinc-800/40 border border-zinc-700/50 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span className="text-xs font-bold text-white">Login as Admin</span>
            </button>
          </section>
        </div>

        {error && <p className="mt-6 text-red-400 text-[11px] bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">{error}</p>}

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-8 py-4 rounded-2xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-800 transition-all"
        >
          Continue to Homepage
        </button>
      </div>
    </div>
  );
}
