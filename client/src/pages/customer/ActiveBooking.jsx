import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import socket from '../../socket';
import StatusBadge from '../../components/StatusBadge';
import MapView from '../../components/MapView';

export default function ActiveBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [providerLoc, setProviderLoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');

  const fetchBooking = () => api.get(`/bookings/${id}`).then(r => { setBooking(r.data); setLoading(false); });

  const handleReschedule = async () => {
    try {
      await api.patch(`/bookings/${id}/reschedule`, { scheduledDate: newDate });
      setIsRescheduling(false);
      fetchBooking();
    } catch (err) {
      alert(err.response?.data?.message || 'Rescheduling failed');
    }
  };

  useEffect(() => {
    fetchBooking();
    socket.emit('join:booking', id);

    socket.on('booking:status', ({ bookingId, status }) => {
      if (bookingId === id) setBooking(b => b ? { ...b, status } : b);
    });
    socket.on('booking:accepted', (b) => {
      if (b._id === id) setBooking(b);
    });
    socket.on('booking:provider_location', ({ coordinates }) => {
      setProviderLoc({ lat: coordinates[1], lng: coordinates[0] });
    });

    const interval = setInterval(fetchBooking, 8000);
    return () => {
      clearInterval(interval);
      socket.off('booking:status');
      socket.off('booking:accepted');
      socket.off('booking:provider_location');
    };
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this booking?')) return;
    await api.patch(`/bookings/${id}/cancel`, {});
    fetchBooking();
  };

  if (loading) return (
    <div className="min-h-dvh bg-[#0f0f13] flex items-center justify-center">
      <div className="text-zinc-400 text-sm animate-pulse">Loading booking...</div>
    </div>
  );

  if (!booking) return null;

  const markers = [];
  if (booking.pickup?.coordinates?.[0]) markers.push({ lat: booking.pickup.coordinates[1], lng: booking.pickup.coordinates[0], label: 'Pickup' });
  if (booking.drop?.coordinates?.[0]) markers.push({ lat: booking.drop.coordinates[1], lng: booking.drop.coordinates[0], label: 'Drop' });
  if (providerLoc) markers.push({ lat: providerLoc.lat, lng: providerLoc.lng, label: '🛠️ Provider' });

  const mapCenter = booking.pickup?.coordinates?.[0]
    ? [booking.pickup.coordinates[1], booking.pickup.coordinates[0]]
    : [19.076, 72.877];

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
        <button onClick={() => navigate('/')} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">←</button>
        <h1 className="text-xl font-bold text-white">Booking Tracker</h1>
      </div>

      <div className="flex-1 min-h-[180px] relative z-0">
        <MapView center={mapCenter} zoom={14} markers={markers} height="100%" />
      </div>

      <div className="bg-zinc-900/95 backdrop-blur-md rounded-t-[2.5rem] -mt-8 z-10 px-6 pt-8 pb-10 border-t border-zinc-800 shadow-2xl overflow-y-auto">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-700/50 rounded-full" />
        
        {/* Status */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-zinc-400">{booking.serviceId?.icon} {booking.serviceId?.name}</p>
            <p className="text-white font-bold text-lg">₹{booking.fare}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        {/* Status timeline */}
        <div className="flex justify-between items-center mb-8 mt-2 relative px-2">
          <div className="absolute top-3 left-6 right-6 h-0.5 bg-zinc-800" />
          {['requested', 'confirmed', 'in_progress', 'completed'].map((s, i) => {
            const statuses = ['requested', 'confirmed', 'in_progress', 'completed'];
            const current = statuses.indexOf(booking.status);
            const done = i <= current;
            return (
              <div key={s} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'}`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className="text-[10px] font-medium text-zinc-400 capitalize">{s.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>

        {/* Provider info */}
        {booking.providerId ? (
          <div className="bg-zinc-800 rounded-2xl p-4 mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Your Service Provider</p>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-white font-semibold">{booking.providerId.name}</p>
                {booking.providerId.rating?.count > 0 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded-md border border-amber-500/20 font-bold">★ {booking.providerId.rating.avg}</span>
                )}
              </div>
              <p className="text-zinc-400 text-sm">{booking.providerId.phone}</p>
              {booking.providerId.vehicleDetails?.number && (
                <p className="text-xs text-orange-400 mt-1">{booking.providerId.vehicleDetails.model} · {booking.providerId.vehicleDetails.number}</p>
              )}
            </div>
            <a href={`tel:${booking.providerId.phone}`}
              className="w-11 h-11 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center text-xl">
              📞
            </a>
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-2xl p-4 mb-4 text-center">
            <div className="text-2xl mb-2 animate-pulse">🔍</div>
            <p className="text-white font-semibold">Searching for provider...</p>
            <p className="text-zinc-400 text-xs mt-1">We'll notify you once someone accepts</p>
          </div>
        )}

        {/* Work Photos */}
        {(booking.customerImages?.length > 0 || booking.beforeImages?.length > 0 || booking.afterImages?.length > 0) && (
          <div className="mb-6">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-3">Service Photos</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[...(booking.customerImages || []), ...(booking.beforeImages || []), ...(booking.afterImages || [])].map((img, i) => (
                <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border border-zinc-700 shrink-0">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Addresses */}
        <div className="bg-zinc-800/60 rounded-3xl p-5 mb-6 flex flex-col gap-4 border border-zinc-700/50">
          <div className="flex items-start gap-4">
            <span className="text-green-400 mt-0.5 text-lg">●</span>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-0.5">Pickup</p>
              <p className="text-white text-[15px] font-medium leading-tight">{booking.pickup?.address || 'Not specified'}</p>
            </div>
          </div>
          {booking.drop?.address && (
            <div className="flex items-start gap-4">
              <span className="text-red-400 mt-0.5 text-lg">●</span>
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500 mb-0.5">Destination</p>
                <p className="text-white text-[15px] font-medium leading-tight">{booking.drop.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reschedule View */}
        {isRescheduling && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-5 mb-6">
            <h3 className="text-orange-400 font-bold mb-3">Reschedule Service</h3>
            <div className="flex flex-col gap-3">
              <input type="date" className="bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm" 
                onChange={e => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
              <div className="flex gap-2">
                <button onClick={handleReschedule} disabled={!newDate} className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm">Confirm</button>
                <button onClick={() => setIsRescheduling(false)} className="flex-1 py-3 bg-zinc-800 text-zinc-400 rounded-xl font-bold text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {['confirmed', 'in_progress', 'completed'].includes(booking.status) && !booking.isPaid && (
            <button onClick={() => navigate(`/payment/${id}`)}
              className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 active:scale-95 transition-all shadow-xl shadow-orange-500/20">
              💳 Pay Now — ₹{Number(booking.fare).toFixed(2)}
            </button>
          )}
          {['requested', 'confirmed'].indexOf(booking.status) !== -1 && !isRescheduling && (
            <button onClick={() => setIsRescheduling(true)}
              className="w-full py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-sm hover:bg-zinc-700 transition-all">
              📅 Reschedule Booking
            </button>
          )}
          {['requested', 'confirmed'].includes(booking.status) && (
            <button onClick={handleCancel}
              className="w-full py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-sm">
              Cancel Booking
            </button>
          )}
          {booking.status === 'completed' && booking.isPaid && !booking.rating && (
            <button onClick={() => navigate(`/payment/${id}?review=1`)}
              className="w-full py-3 rounded-2xl bg-zinc-800 border border-zinc-700 text-white font-semibold text-sm">
              ⭐ Rate this service
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
