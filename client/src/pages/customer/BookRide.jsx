import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Flag, Pencil } from 'lucide-react';
import api from '../../api';
import MapView from '../../components/MapView';
import ServiceIcon from '../../components/ServiceIcon';
import { compressImage } from '../../utils/image';

function getDistanceKm(c1, c2) {
  const R = 6371;
  const dLat = ((c2[1] - c1[1]) * Math.PI) / 180;
  const dLon = ((c2[0] - c1[0]) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((c1[1] * Math.PI) / 180) * Math.cos((c2[1] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function BookRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const service = state?.service;

  const [selectingFor, setSelectingFor] = useState(null); // 'pickup', 'drop', or null
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [pickupAddr, setPickupAddr] = useState('');
  const [dropAddr, setDropAddr] = useState('');
  const [days, setDays] = useState(1);
  const [scheduledDate, setScheduledDate] = useState('');
  const [notes, setNotes] = useState('');
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userPos, setUserPos] = useState([19.076, 72.877]);

  useEffect(() => {
    if (!service) navigate('/');
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const c = [pos.coords.longitude, pos.coords.latitude];
          setPickup(c);
          setPickupAddr('Your current location');
          setUserPos([pos.coords.latitude, pos.coords.longitude]); // Lat, Lng for map
        },
        err => {
          console.error("Location permission denied", err);
          alert("Please enable location services to find providers near you.");
        }
      );
    }
  };

  useEffect(() => {
    if (!service) return;
    let f = service.basePrice;
    if (service.pricingModel === 'per_km' && pickup && drop) {
      const dist = getDistanceKm(pickup, drop);
      f = Math.max(service.basePrice, service.basePrice + service.perUnitRate * dist);
    } else if (service.pricingModel === 'per_day') {
      f = service.basePrice + service.perUnitRate * days;
    }
    setFare(Math.ceil(f));
  }, [pickup, drop, days, service]);

  const handleMapClick = (coords) => {
    if (selectingFor === 'pickup') { 
      setPickup(coords); 
      setPickupAddr(`📍 ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`); 
      setUserPos([coords[1], coords[0]]); // Convert [lng,lat] -> [lat,lng]
    }
    if (selectingFor === 'drop') { 
      setDrop(coords); 
      setDropAddr(`📍 ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`); 
      setUserPos([coords[1], coords[0]]); // Convert [lng,lat] -> [lat,lng]
    }
  };

  const handleSearchSelect = (loc) => {
    const coords = [loc.lng, loc.lat];
    if (selectingFor === 'pickup') { setPickup(coords); setPickupAddr(`📍 ${loc.address}`); setUserPos([loc.lat, loc.lng]); }
    if (selectingFor === 'drop') { setDrop(coords); setDropAddr(`📍 ${loc.address}`); setUserPos([loc.lat, loc.lng]); }
  };

  const [customerImages, setCustomerImages] = useState([]);

  const handleImageAdd = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        setCustomerImages(prev => [...prev, compressed].slice(0, 3));
      } catch (err) {
        console.error('Compression failed', err);
      }
    }
  };

  const handleBook = async () => {
    setLoading(true);
    try {
      const payload = {
        serviceId: service._id,
        pickup: { coordinates: pickup || [0, 0], address: pickupAddr },
        drop: { coordinates: drop || [0, 0], address: dropAddr },
        customerNotes: notes,
        customerImages,
        distanceKm: pickup && drop ? getDistanceKm(pickup, drop) : 0,
        estimatedDays: days,
        scheduledDate: scheduledDate || null,
      };
      const { data } = await api.post('/bookings/request', payload);
      navigate(`/booking/${data._id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  const isExtended = service.group === 'extended';
  const isRide = service.category === 'Rides';
  const needsDrop = isRide;
  
  const markers = [];
  if (pickup) markers.push({ lat: pickup[1], lng: pickup[0], label: isRide ? 'Pickup' : 'Location' });
  if (drop && needsDrop) markers.push({ lat: drop[1], lng: drop[0], label: 'Drop' });

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50 shrink-0">
        <button onClick={() => { if (selectingFor) setSelectingFor(null); else navigate('/'); }} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors shrink-0">←</button>
        <div className="flex-1 truncate">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 truncate">
            <ServiceIcon name={service.name} className="w-5 h-5 text-orange-400 shrink-0" />
            <span className="truncate">{selectingFor ? (selectingFor === 'pickup' ? (needsDrop ? 'Select Pickup' : 'Select Location') : 'Select Destination') : service.name}</span>
          </h1>
          {!selectingFor && <p className="text-sm text-zinc-400 mt-0.5 truncate">{service.description}</p>}
        </div>
      </div>

      {/* Map */}
      <div className={`relative z-0 bg-zinc-900 transition-all duration-300 ${selectingFor ? 'flex-1' : 'h-48 shrink-0'}`}>
        <div className="absolute inset-0">
          <MapView
            center={userPos} zoom={14}
            markers={markers}
            onMark={handleMapClick}
            height="100%"
            showSearch={!!selectingFor}
            onSearchSelect={handleSearchSelect}
          />
        </div>
        
        {selectingFor && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur px-4 py-2.5 rounded-full border border-zinc-700 shadow-xl flex items-center gap-2 pointer-events-none z-40 whitespace-nowrap">
            {selectingFor === 'pickup' ? <MapPin className="w-4 h-4 text-orange-400" /> : <Flag className="w-4 h-4 text-orange-400" />}
            <span className="text-xs text-zinc-300 font-medium">Drag map to set {selectingFor}</span>
          </div>
        )}
      </div>

      {/* Bottom Container */}
      {selectingFor ? (
        <div className="bg-zinc-900/95 backdrop-blur-md rounded-t-[2.5rem] -mt-6 z-50 px-6 pt-6 pb-8 border-t border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] shrink-0">
          <div className="flex flex-col gap-2 mb-6">
             <p className="text-sm text-zinc-400 font-medium tracking-wide uppercase">Confirming {selectingFor === 'pickup' ? (needsDrop ? 'pickup' : 'location') : 'destination'}</p>
             <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">
               {(selectingFor === 'pickup' ? pickupAddr : dropAddr)?.replace('📍 ', '') || 'Searching location...'}
             </h3>
          </div>
          <button 
            onClick={() => {
              if (selectingFor === 'pickup' && needsDrop && !drop) setSelectingFor('drop');
              else setSelectingFor(null);
            }}
            disabled={selectingFor === 'pickup' ? !pickup : !drop}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg disabled:opacity-50 hover:bg-orange-600 active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20"
          >
            Confirm {selectingFor === 'pickup' ? (needsDrop ? 'Pickup' : 'Location') : 'Destination'}
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900/95 backdrop-blur-md rounded-t-[2.5rem] -mt-6 z-50 flex-1 flex flex-col border-t border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] overflow-hidden pb-[env(safe-area-inset-bottom)]">
          <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mt-3 shrink-0" />
          <div className="flex-1 overflow-y-auto px-6 pt-6 pb-10 flex flex-col">
            
            {/* Location pins */}
            <div className="flex flex-col gap-3 mb-6 shrink-0">
              <button onClick={() => setSelectingFor('pickup')}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-zinc-700/60 bg-zinc-800/80 hover:bg-zinc-700/80 transition-all text-left relative group/loc">
                <span className="text-green-400 text-lg leading-none shrink-0">●</span>
                <span className={`text-[15px] font-medium line-clamp-1 pr-8 ${pickupAddr ? 'text-white' : 'text-zinc-500'}`}>{pickupAddr?.replace('📍 ', '') || (needsDrop ? 'Set pickup location' : 'Set your location')}</span>
                <Pencil className="w-4 h-4 text-zinc-500 absolute right-5 group-hover/loc:text-orange-400 transition-colors" />
              </button>
              {needsDrop && (
                <button onClick={() => setSelectingFor('drop')}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl border border-zinc-700/60 bg-zinc-800/80 hover:bg-zinc-700/80 transition-all text-left relative group/loc">
                  <span className="text-red-400 text-lg leading-none shrink-0">●</span>
                  <span className={`text-[15px] font-medium line-clamp-1 pr-8 ${dropAddr ? 'text-white' : 'text-zinc-500'}`}>{dropAddr?.replace('📍 ', '') || 'Set destination'}</span>
                  <Pencil className="w-4 h-4 text-zinc-500 absolute right-5 group-hover/loc:text-orange-400 transition-colors" />
                </button>
              )}
            </div>

            {/* Extended-specific fields */}
            {isExtended && (
              <div className="flex flex-col gap-4 mb-6 shrink-0 bg-zinc-800/50 p-5 rounded-2xl border border-zinc-700/50">
                <div>
                  <label className="text-xs text-zinc-400 mb-2 block font-medium">Scheduled Date</label>
                  <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="text-xs text-zinc-400 font-medium">Estimated Days</label>
                    <span className="text-white font-bold bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700 text-sm">{days} Days</span>
                  </div>
                  <input type="range" min={1} max={30} value={days} onChange={e => setDays(Number(e.target.value))}
                    className="w-full accent-orange-500 mt-2" />
                </div>
              </div>
            )}

            {/* Images */}
            <div className="mb-6 shrink-0">
              <label className="text-xs text-zinc-400 mb-2 block font-medium uppercase tracking-wider">Context Photos (Optional)</label>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <label className="w-16 h-16 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-orange-500/50 transition-colors shrink-0">
                  <span className="text-2xl text-zinc-500">+</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                </label>
                {customerImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 shrink-0">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => setCustomerImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-0 right-0 bg-black/50 text-white w-5 h-5 flex items-center justify-center text-[10px]">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4 shrink-0">
              <label className="text-xs text-zinc-400 mb-1 block font-medium uppercase tracking-wider">Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Describe the work needed..."
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 resize-none" />
            </div>

            <div className="mt-auto pt-4 shrink-0">
              {/* Fare */}
              <div className="flex items-center justify-between bg-zinc-800/80 rounded-2xl p-5 mb-5 border border-zinc-700/50">
                <div>
                  <p className="text-sm font-medium text-zinc-400 mb-1">Estimated fare</p>
                  <p className="text-3xl font-extrabold text-white">₹{fare}</p>
                  <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-wider font-semibold">
                    {service.pricingModel === 'per_km' ? 'Based on distance' : service.pricingModel === 'per_day' ? `${days} day(s) × ₹${service.perUnitRate}` : 'Flat rate'}
                  </p>
                </div>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-orange-400 shadow-inner shrink-0">
                  <ServiceIcon name={service.name} className="w-8 h-8" />
                </div>
              </div>

              <button onClick={handleBook} disabled={loading || !pickup || (needsDrop && !drop)}
                className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-orange-500/20">
                {loading ? 'Booking...' : `Book ${service.name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
