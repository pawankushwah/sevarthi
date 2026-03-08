import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, ShieldCheck, User, Hammer } from 'lucide-react';
import api from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      if (data.user.role === 'provider') navigate('/provider');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role) => {
    const creds = {
      customer: { phone: '9999999999', password: 'password' },
      provider: { phone: '8888888888', password: 'password' },
      admin: { phone: '0000000000', password: 'admin123' }
    };
    
    setQuickLoading(role);
    setError('');
    try {
      const { data } = await api.post('/auth/login', creds[role]);
      login(data.user, data.token);
      if (data.user.role === 'provider') navigate('/provider');
      else if (data.user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || `Quick login failed for ${role}`);
    } finally {
      setQuickLoading(null);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col px-6 py-10 overflow-y-auto pb-20">
      <button onClick={() => navigate('/')} className="text-zinc-400 text-sm mb-8 flex items-center gap-2">
        ← Back
      </button>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-2xl mb-4 shadow-lg shadow-orange-500/20">⚡</div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-zinc-400 text-sm mt-1">Sign in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Phone Number</label>
          <input
            type="tel" placeholder="10-digit phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            required
          />
        </div>
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Password</label>
          <input
            type="password" placeholder="Your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
            required
          />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

        <button
          type="submit" disabled={loading || quickLoading}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-semibold text-base mt-2 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-zinc-400 text-sm text-center mt-6">
        New here?{' '}
        <Link to="/register" className="text-orange-400 font-semibold hover:text-orange-300">
          Create Account
        </Link>
      </p>

      {/* Quick Login Section */}
      <div className="mt-10 border-t border-zinc-800 pt-8">
        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4 ml-1">Demo Quick Access</p>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => quickLogin('customer')}
            disabled={loading || quickLoading}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <User className="w-5 h-5 text-zinc-400" />
            <span className="text-[11px] font-bold text-white text-center">Customer<br/>Login</span>
          </button>
          
          <button 
            onClick={() => quickLogin('provider')}
            disabled={loading || quickLoading}
            className="flex flex-col items-center justify-center gap-2 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
          >
            <Hammer className="w-5 h-5 text-zinc-400" />
            <span className="text-[11px] font-bold text-white text-center">Provider<br/>Login</span>
          </button>
        </div>
        
        <button 
          onClick={() => quickLogin('admin')}
          disabled={loading || quickLoading}
          className="w-full mt-3 flex items-center justify-center gap-3 p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span className="text-[11px] font-bold text-zinc-300">Login as Admin</span>
        </button>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/demo')}
            className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-orange-400 transition-colors"
          >
            ⚙️ Configure Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}
