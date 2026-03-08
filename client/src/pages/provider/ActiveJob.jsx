import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import socket from '../../socket';
import StatusBadge from '../../components/StatusBadge';
import MapView from '../../components/MapView';
import { compressImage } from '../../utils/image';

export default function ActiveJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);

  useEffect(() => {
    api.get(`/bookings/${id}`).then(r => { 
      setBooking(r.data); 
      setNotes(r.data.workNotes || '');
      setBeforeImages(r.data.beforeImages || []);
      setAfterImages(r.data.afterImages || []);
      setLoading(false); 
    });
    socket.emit('join:booking', id);
    // ... rest of the socket logic
  }, [id]);

  const handleImageAdd = async (e, type) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        if (type === 'before') setBeforeImages(prev => [...prev, compressed].slice(0, 3));
        else setAfterImages(prev => [...prev, compressed].slice(0, 3));
      } catch (err) {
        console.error('Compression failed', err);
      }
    }
  };

  const updateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/bookings/${id}/status`, { 
        status, 
        workNotes: notes,
        beforeImages,
        afterImages
      });
      setBooking(data);
      if (status === 'completed') {
        alert('🎉 Job completed successfully!');
        navigate('/provider');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
    }
  };

  if (loading) return <div className="min-h-dvh bg-[#0f0f13] flex items-center justify-center text-zinc-400 text-sm animate-pulse">Loading job...</div>;
  if (!booking) return null;

  const markers = [];
  if (booking.pickup?.coordinates?.[0]) markers.push({ lat: booking.pickup.coordinates[1], lng: booking.pickup.coordinates[0], label: 'Customer Pickup' });
  if (booking.drop?.coordinates?.[0]) markers.push({ lat: booking.drop.coordinates[1], lng: booking.drop.coordinates[0], label: 'Drop Point' });
  const mapCenter = booking.pickup?.coordinates?.[1] ? [booking.pickup.coordinates[1], booking.pickup.coordinates[0]] : [19.076, 72.877];

  const nextStatuses = {
    confirmed: 'in_progress',
    in_progress: 'completed',
  };

  const nextStatus = nextStatuses[booking.status];
  const nextLabels = { in_progress: '🚀 Start Job', completed: '✅ Mark Complete' };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => navigate('/provider')} className="w-9 h-9 bg-zinc-800 rounded-xl flex items-center justify-center text-white">←</button>
        <div>
          <h1 className="text-lg font-bold text-white">{booking.serviceId?.icon} {booking.serviceId?.name}</h1>
          <StatusBadge status={booking.status} />
        </div>
      </div>

      <div className="px-4">
        <MapView center={mapCenter} zoom={14} markers={markers} height="210px" />
      </div>

      <div className="flex-1 bg-zinc-900 rounded-t-3xl mt-4 px-5 pt-5 pb-8 overflow-y-auto">
        {/* Customer info */}
        <div className="bg-zinc-800 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 mb-0.5">Customer</p>
            <p className="text-white font-semibold">{booking.customerId?.name}</p>
            <p className="text-zinc-400 text-sm">{booking.customerId?.phone}</p>
          </div>
          <div className="flex gap-2">
            <a href={`tel:${booking.customerId?.phone}`}
              className="w-11 h-11 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center text-xl">📞</a>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-zinc-800 rounded-2xl p-4 mb-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            <p className="text-white text-sm">{booking.pickup?.address || 'Pickup not set'}</p>
          </div>
          {booking.drop?.address && (
            <div className="flex items-center gap-2">
              <span className="text-red-400">●</span>
              <p className="text-white text-sm">{booking.drop.address}</p>
            </div>
          )}
          {booking.scheduledDate && (
            <p className="text-zinc-400 text-xs">📅 Scheduled: {new Date(booking.scheduledDate).toLocaleDateString('en-IN')} · {booking.estimatedDays} day(s)</p>
          )}
        </div>

        {booking.customerNotes && (
          <div className="bg-zinc-800 rounded-xl p-3 mb-4">
            <p className="text-xs text-zinc-400 mb-1">Customer Notes</p>
            <p className="text-white text-sm">{booking.customerNotes}</p>
          </div>
        )}

        {/* Fare */}
        <div className="bg-zinc-800 rounded-xl p-3 mb-4 flex justify-between items-center">
          <p className="text-zinc-400 text-sm">Job Earning</p>
          <p className="text-orange-400 font-bold text-xl">₹{booking.fare}</p>
        </div>

        {/* Work notes */}
        {['confirmed', 'in_progress'].includes(booking.status) && (
          <div className="mb-4">
            <label className="text-xs text-zinc-400 mb-1 block">Work Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Describe what you did..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none" />
          </div>
        )}

        {/* Photos */}
        <div className="mb-6">
          <label className="text-xs text-zinc-400 mb-2 block uppercase tracking-wider font-semibold">Service Photos</label>
          
          <div className="space-y-4">
            {/* Before images */}
            <div>
              <p className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-widest">Before Work</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {['confirmed', 'in_progress'].includes(booking.status) && beforeImages.length < 3 && (
                  <label className="w-16 h-16 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer shrink-0">
                    <span className="text-xl text-zinc-500">+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageAdd(e, 'before')} />
                  </label>
                )}
                {beforeImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    {['confirmed', 'in_progress'].includes(booking.status) && (
                      <button onClick={() => setBeforeImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* After images */}
            <div>
              <p className="text-[10px] text-zinc-500 mb-2 font-bold uppercase tracking-widest">After Completion</p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {booking.status === 'in_progress' && afterImages.length < 3 && (
                  <label className="w-16 h-16 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer shrink-0">
                    <span className="text-xl text-zinc-500">+</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageAdd(e, 'after')} />
                  </label>
                )}
                {afterImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    {booking.status === 'in_progress' && (
                      <button onClick={() => setAfterImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action button */}
        {nextStatus && (
          <button onClick={() => updateStatus(nextStatus)} disabled={updating}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-base hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 mb-3">
            {updating ? 'Updating...' : nextLabels[nextStatus]}
          </button>
        )}

        {booking.status === 'completed' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center">
            <p className="text-green-400 font-bold">✅ Job Completed</p>
            <p className="text-zinc-400 text-sm mt-1">Payment will be credited to your wallet once customer pays</p>
          </div>
        )}
      </div>
    </div>
  );
}
