import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import socket from '../../socket';
import BottomNav from '../../components/BottomNav';
import StatusBadge from '../../components/StatusBadge';

export default function ProviderHome() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [available, setAvailable] = useState(user?.isAvailable || false);
  const [bookings, setBookings] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchData = async () => {
    const [myJobs, available] = await Promise.all([
      api.get('/bookings/my'),
      user?.isApproved ? api.get('/bookings/available') : Promise.resolve({ data: [] }),
    ]);
    setBookings(myJobs.data);
    setPendingRequests(available.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    socket.on('booking:new', (b) => {
      if (b.serviceId?._id === user?.serviceId) {
        setPendingRequests(p => [b, ...p.filter(x => x._id !== b._id)]);
      }
    });
    // Auto-refresh every 15s
    const interval = setInterval(fetchData, 15000);
    return () => { clearInterval(interval); socket.off('booking:new'); };
  }, [user?._id]);

  // Demo Mode: Auto-spawn fake requests for providers to test accepting
  useEffect(() => {
    if (!available || localStorage.getItem('demoMode') !== 'true') return;
    const simInterval = setInterval(async () => {
      try {
        const { data } = await api.get('/bookings/available');
        if (data.length === 0) {
          await api.post('/bookings/simulate');
        }
      } catch (e) {
        console.error("Simulation failed", e);
      }
    }, 12000); // Check and spawn every 12s
    return () => clearInterval(simInterval);
  }, [available]);

  const toggleAvailability = async () => {
    setToggling(true);
    const next = !available;
    setAvailable(next); // optimistic
    try {
      await api.patch('/auth/me/availability', { isAvailable: next });
    } catch {
      setAvailable(!next); // revert on failure
    } finally {
      setToggling(false);
    }
  };

  const acceptBooking = async (bookingId) => {
    try {
      const { data } = await api.patch(`/bookings/${bookingId}/accept`);
      navigate(`/provider/job/${bookingId}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept');
      fetchData();
    }
  };

  const activeJob = bookings.find(b => ['confirmed', 'in_progress'].includes(b.status));

  if (!user?.isApproved) {
    return (
      <div className="min-h-dvh bg-[#0f0f13] flex flex-col items-center justify-center px-6 pb-20">
        <div className="text-5xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">Awaiting Approval</h2>
        <p className="text-zinc-400 text-sm text-center">Your profile is under review. We'll notify you once approved.</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      {/* Header */}
      <div className="px-5 pt-12 pb-5 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-zinc-400 text-xs">{user?.serviceId?.icon || '🛠️'} {user?.serviceGroup?.toUpperCase()}</p>
            <h1 className="text-xl font-bold text-white">{user?.name}</h1>
          </div>
          {/* Availability toggle */}
          <button onClick={toggleAvailability} disabled={toggling}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm transition-all ${available ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
            <span className={`w-2 h-2 rounded-full ${available ? 'bg-green-400 animate-pulse' : 'bg-zinc-600'}`} />
            {available ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Active job banner */}
      {activeJob && (
        <div className="mx-4 mt-4">
          <button onClick={() => navigate(`/provider/job/${activeJob._id}`)}
            className="w-full bg-orange-500/20 border border-orange-500/40 rounded-2xl p-4 text-left hover:bg-orange-500/30 transition-all active:scale-[0.98]">
            <p className="text-orange-400 text-xs font-semibold mb-1">ACTIVE JOB</p>
            <p className="text-white font-bold">{activeJob.serviceId?.icon} {activeJob.serviceId?.name}</p>
            <p className="text-zinc-300 text-sm">{activeJob.customerId?.name} · ₹{activeJob.fare}</p>
            <StatusBadge status={activeJob.status} />
          </button>
        </div>
      )}

      {/* Pending requests */}
      {available && pendingRequests.length > 0 && (
        <div className="px-4 mt-5">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">New Requests ({pendingRequests.length})</h2>
          {pendingRequests.map(req => (
            <div key={req._id} className="bg-zinc-900 border border-zinc-700 rounded-2xl p-4 mb-3 fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{req.customerId?.name}</p>
                  <p className="text-zinc-400 text-sm">{req.pickup?.address || 'Location not specified'}</p>
                  <p className="text-zinc-500 text-xs mt-1">{req.customerNotes}</p>
                </div>
                <p className="text-orange-400 font-bold text-lg">₹{req.fare}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => acceptBooking(req._id)}
                  className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 active:scale-95 transition-all">
                  ✓ Accept
                </button>
                <button className="flex-1 py-3 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl font-semibold text-sm">
                  ✗ Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent jobs */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center justify-between">
          Recent Jobs
          <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded-full">Last 5</span>
        </h2>
        {bookings.filter(b => !['confirmed', 'in_progress'].includes(b.status)).slice(0, 5).map(b => (
          <div key={b._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-3 flex items-center justify-between group">
            <div>
              <p className="text-white text-sm font-bold group-active:text-orange-400 transition-colors">{b.customerId?.name}</p>
              <p className="text-zinc-500 text-[10px] font-medium mt-0.5 uppercase tracking-wider">{new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {b.serviceId?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={b.status} />
              <span className="text-zinc-300 font-black text-sm">₹{b.fare}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews feed */}
      <div className="px-4 mt-8 pb-10">
        <h2 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
          <span>Feedback</span>
          {user?.rating?.avg > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2.5 py-1 rounded-lg border border-amber-500/20">★ {user.rating.avg} ({user.rating.count})</span>}
        </h2>
        <div className="space-y-4">
          {bookings.filter(b => b.rating).length === 0 ? (
            <div className="text-center py-10 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
               <span className="text-2xl opacity-30">⭐</span>
               <p className="text-zinc-500 text-xs mt-2 italic">No reviews yet. Complete more jobs!</p>
            </div>
          ) : (
            bookings.filter(b => b.rating).map(r => (
              <div key={r._id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-5 shadow-inner">
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">👤</div>
                      <div>
                        <p className="text-white text-xs font-bold">{r.customerId?.name}</p>
                        <p className="text-zinc-500 text-[9px] uppercase tracking-tighter">Booking #{r._id.slice(-6).toUpperCase()}</p>
                      </div>
                   </div>
                   <div className="flex text-[10px] text-amber-400">
                      {'★'.repeat(r.rating)}
                   </div>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed italic">"{r.review || 'No comment provided'}"</p>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
