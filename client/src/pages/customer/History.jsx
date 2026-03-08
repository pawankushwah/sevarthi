import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';

export default function History() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my').then(r => { setBookings(r.data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      <div className="px-6 pt-14 pb-6 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50 mb-4">
        <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
        <p className="text-zinc-400 text-[15px] font-medium mt-1">{bookings.length} total services</p>
      </div>

      <div className="px-5 flex-1">
        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-32 bg-zinc-900/60 rounded-3xl mb-4 animate-pulse" />)
        ) : bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 mt-4">
            <span className="text-6xl drop-shadow-md">📋</span>
            <p className="text-zinc-400 font-medium">No bookings yet</p>
            <button onClick={() => navigate('/')} className="px-8 py-3 bg-orange-500 text-white rounded-2xl text-[15px] font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Book a Service</button>
          </div>
        ) : (
          bookings.map(b => (
            <button key={b._id} onClick={() => navigate(`/booking/${b._id}`)}
              className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-3xl p-5 mb-4 text-left hover:bg-zinc-800/60 hover:border-zinc-700 active:scale-[0.98] transition-all shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl shadow-inner">
                    {b.serviceId?.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold text-[17px] leading-tight mb-0.5">{b.serviceId?.name}</p>
                    <p className="text-zinc-500 text-[11px] font-semibold tracking-wide uppercase">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="flex items-center justify-between bg-zinc-950/30 rounded-xl p-3 border border-zinc-800/50 mt-3">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] shrink-0">👤</div>
                  <p className="text-zinc-300 text-sm font-medium truncate">{b.providerId?.name || 'Awaiting provider'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {b.isPaid && <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md text-[9px] text-green-400 font-bold uppercase tracking-wider">Paid</span>}
                  <p className="text-orange-400 font-extrabold text-base">₹{b.fare}</p>
                </div>
              </div>

              {['confirmed', 'in_progress', 'completed'].includes(b.status) && !b.isPaid && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/payment/${b._id}`); }}
                    className="text-xs font-bold text-white bg-orange-500 px-6 py-2 rounded-xl active:scale-95 transition-all shadow-lg shadow-orange-500/20"
                  >
                    💳 Pay Now
                  </button>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Booking #{b._id.slice(-6).toUpperCase()}</div>
                </div>
              )}

              {b.status === 'completed' && b.isPaid && (
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center">
                  {b.rating ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 text-sm">{'★'.repeat(b.rating)}</span>
                      <span className="text-zinc-500 text-xs font-medium">Your rating</span>
                    </div>
                  ) : (
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/payment/${b._id}?review=1`); }}
                      className="text-xs font-bold text-orange-500 bg-orange-500/10 px-4 py-2 rounded-xl active:scale-95 transition-all"
                    >
                      ⭐ Rate Service
                    </button>
                  )}
                  <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Booking #{b._id.slice(-6).toUpperCase()}</div>
                </div>
              )}
            </button>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
