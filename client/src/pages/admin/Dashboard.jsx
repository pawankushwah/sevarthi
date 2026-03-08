import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BottomNav from '../../components/BottomNav';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/bookings')]).then(([s, b]) => {
      setStats(s.data); setRecentBookings(b.data.slice(0, 10)); setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { label: 'Total Bookings', value: stats.totalBookings, icon: '📋', color: 'text-blue-400' },
    { label: 'Completed', value: stats.completedBookings, icon: '✅', color: 'text-green-400' },
    { label: 'Total Revenue', value: `₹${Number(stats.totalRevenue).toFixed(2)}`, icon: '💰', color: 'text-orange-400' },
    { label: 'Customers', value: stats.totalCustomers, icon: '👤', color: 'text-purple-400' },
    { label: 'Providers', value: stats.totalProviders, icon: '🛠️', color: 'text-cyan-400' },
    { label: 'Pending Approval', value: stats.pendingProviders, icon: '⏳', color: 'text-amber-400' },
  ] : [];

  const statusColors = {
    requested: 'text-amber-400', confirmed: 'text-blue-400',
    in_progress: 'text-orange-400', completed: 'text-green-400', cancelled: 'text-red-400',
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      <div className="px-5 pt-12 pb-4 bg-zinc-900/50">
        <p className="text-zinc-400 text-xs">⚡ Sevarthi Admin</p>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div className="px-4 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {statCards.map(s => (
              <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span>{s.icon}</span>
                  <span className="text-xs text-zinc-400">{s.label}</span>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin actions */}
      <div className="px-4 mt-6 grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/admin/services')}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-zinc-800 transition-colors">
          <span className="text-2xl">📁</span>
          <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Categories</span>
        </button>
        <button onClick={() => navigate('/admin/reviews')}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col items-center gap-3 hover:bg-zinc-800/80 hover:border-red-500/30 transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">🚨</div>
          <span className="text-3xl">�️</span>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] group-hover:text-red-400 transition-colors">Moderation</span>
        </button>
      </div>

      {/* Provider approval shortcut */}
      {stats?.pendingProviders > 0 && (
        <div className="mx-4 mt-4">
          <button onClick={() => navigate('/admin/providers')}
            className="w-full bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 text-left hover:bg-amber-500/30 active:scale-[0.98] transition-all">
            <p className="text-amber-400 font-bold">⏳ {stats.pendingProviders} provider(s) awaiting approval</p>
            <p className="text-zinc-400 text-sm">Tap to review and approve →</p>
          </button>
        </div>
      )}

      {/* Recent bookings */}
      <div className="px-4 mt-5">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Recent Bookings</h2>
        {recentBookings.map(b => (
          <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-2 flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{b.serviceId?.icon} {b.customerId?.name}</p>
              <p className="text-zinc-500 text-xs">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {b.providerId?.name || 'Unassigned'}</p>
            </div>
            <div className="text-right">
              <p className={`text-xs font-semibold capitalize ${statusColors[b.status]}`}>{b.status.replace('_', ' ')}</p>
              <p className="text-zinc-400 text-sm">₹{b.fare}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
