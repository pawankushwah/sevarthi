import { useState, useEffect } from 'react';
import api from '../../api';
import BottomNav from '../../components/BottomNav';

export default function AdminProviders() {
  const [tab, setTab] = useState('pending');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = (approved) => {
    setLoading(true);
    api.get(`/admin/providers?approved=${approved}`).then(r => { setProviders(r.data); setLoading(false); });
  };

  useEffect(() => { fetchProviders(tab === 'approved'); }, [tab]);

  const approve = async (id) => {
    await api.patch(`/admin/providers/${id}/approve`);
    setProviders(p => p.filter(x => x._id !== id));
  };

  const reject = async (id) => {
    await api.patch(`/admin/providers/${id}/reject`);
    fetchProviders(tab === 'approved');
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Service Providers</h1>
      </div>

      {/* Tab toggle */}
      <div className="px-4 flex gap-2 mb-5">
        {[
          { key: 'pending', label: '⏳ Pending' },
          { key: 'approved', label: '✅ Approved' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-orange-500 text-white' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-4 flex-1">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-2xl mb-3 animate-pulse" />)
        ) : providers.length === 0 ? (
          <div className="text-center py-16 text-zinc-500 text-sm">No {tab} providers</div>
        ) : (
          providers.map(p => (
            <div key={p._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-3">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-bold">{p.name}</p>
                  <p className="text-zinc-400 text-sm">{p.phone}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base">{p.serviceId?.icon}</span>
                    <span className="text-xs text-orange-400 font-semibold">{p.serviceId?.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${p.serviceId?.group === 'rides' ? 'border-orange-500/40 text-orange-400' : p.serviceId?.group === 'quick' ? 'border-blue-500/40 text-blue-400' : 'border-purple-500/40 text-purple-400'}`}>
                      {p.serviceId?.group}
                    </span>
                  </div>
                  {p.vehicleDetails?.number && (
                    <p className="text-zinc-500 text-xs mt-1">🚗 {p.vehicleDetails.model} · {p.vehicleDetails.number}</p>
                  )}
                  {p.upiId && <p className="text-zinc-500 text-xs">💳 {p.upiId}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  {p.rating?.count > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">⭐ {p.rating.avg}</span>
                  )}
                </div>
              </div>

              {tab === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => approve(p._id)}
                    className="flex-1 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 active:scale-95 transition-all">
                    ✓ Approve
                  </button>
                  <button onClick={() => reject(p._id)}
                    className="flex-1 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-semibold text-sm">
                    ✗ Reject
                  </button>
                </div>
              )}

              {tab === 'approved' && (
                <div className="flex gap-2">
                  <button onClick={() => reject(p._id)}
                    className="flex-1 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl text-xs font-medium">
                    Revoke Approval
                  </button>
                  <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl ${p.isAvailable ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.isAvailable ? 'bg-green-400' : 'bg-zinc-600'}`} />
                    <span className="text-xs">{p.isAvailable ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
