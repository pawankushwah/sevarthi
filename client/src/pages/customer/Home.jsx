import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Bike, Zap, Hammer } from 'lucide-react';
import api from '../../api';
import BottomNav from '../../components/BottomNav';
import ServiceIcon from '../../components/ServiceIcon';
import MapView from '../../components/MapView';

const SERVICE_GROUPS = [
  { key: 'quick', label: 'Quick', Icon: Zap, color: 'from-blue-600 to-blue-400', activeClass: 'bg-linear-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/30' },
  { key: 'rides', label: 'Rides', Icon: Bike, color: 'from-orange-600 to-orange-400', activeClass: 'bg-linear-to-r from-orange-600 to-orange-400 text-white shadow-lg shadow-orange-500/30' },
  { key: 'extended', label: 'Projects', Icon: Hammer, color: 'from-purple-600 to-purple-400', activeClass: 'bg-linear-to-r from-purple-600 to-purple-400 text-white shadow-lg shadow-purple-500/30' },
];

export default function CustomerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState('quick');
  const [services, setServices] = useState([]);
  const [userPos, setUserPos] = useState([19.076, 72.877]);
  const [locationAddr, setLocationAddr] = useState('Detecting location...');
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    api.get('/services').then(r => { setServices(r.data); setLoading(false); });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserPos([pos.coords.latitude, pos.coords.longitude]);
          setLocationAddr('Your current location');
        },
        () => {
          setLocationAddr('Location access denied');
        }
      );
    }
  }, []);

  const handleLocationConfirm = (coords) => {
    setUserPos([coords[1], coords[0]]);
    setLocationAddr(`📍 ${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`);
    setIsPickingLocation(false);
  };

  const handleSearchSelect = (loc) => {
    setUserPos([loc.lat, loc.lng]);
    setLocationAddr(`📍 ${loc.address}`);
    setIsPickingLocation(false);
  };

  const filtered = services.filter(s => s.group === activeGroup);

  const handleServiceSelect = (service) => {
    navigate('/book', { state: { service } });
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-28">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
        <p className="text-zinc-400 text-sm font-medium mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
      </div>

      {/* Location Bar */}
      <div className="px-5 mt-5">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between group h-14">
          <div className="flex items-center gap-3 overflow-hidden">
            <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
            <span className="text-sm text-zinc-300 font-medium truncate">{locationAddr.replace('📍 ', '')}</span>
          </div>
          <button 
            onClick={() => setIsPickingLocation(true)}
            className="text-xs font-bold text-orange-500 uppercase tracking-wider hover:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Search pill */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-700/80 rounded-2xl px-5 py-1 shadow-sm focus-within:border-orange-500/50 transition-colors">
          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text"
            placeholder="Search services..."
            className="flex-1 bg-transparent border-none outline-none py-3 text-white text-[15px] font-medium placeholder:text-zinc-500"
            onChange={(e) => {
              const q = e.target.value;
              setTimeout(() => {
                setLoading(true);
                api.get(`/services?search=${q}`).then(r => {
                  setServices(r.data);
                  setLoading(false);
                });
              }, 300);
            }}
          />
        </div>
      </div>

      {/* Group tabs */}
      <div className="px-5 mt-6">
        <div className="flex gap-2.5 bg-zinc-900/40 p-1.5 rounded-2xl border border-zinc-800/50">
          {SERVICE_GROUPS.map(g => (
            <button key={g.key} onClick={() => setActiveGroup(g.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${activeGroup === g.key ? g.activeClass : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
              <g.Icon className="w-4 h-4" />
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="px-5 mt-6 mb-8 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900/80 rounded-3xl h-36 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map(service => (
              <button key={service._id} onClick={() => handleServiceSelect(service)}
                className="bg-zinc-900/80 border border-zinc-800/60 rounded-3xl p-5 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-zinc-800/80 active:scale-[0.98] transition-all group shadow-sm">
                <div className="w-14 h-14 bg-zinc-800 group-hover:bg-zinc-700 rounded-2xl flex items-center justify-center text-orange-400 transition-colors shadow-inner">
                  <ServiceIcon name={service.name} className="w-7 h-7" />
                </div>
                <span className="text-sm text-zinc-300 font-semibold text-center leading-tight group-hover:text-white">{service.name}</span>
                <div className="mt-auto pt-2">
                  <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-[11px] font-bold">
                    ₹{service.basePrice}
                    {service.pricingModel === 'per_km' ? '/km' : service.pricingModel === 'per_hour' ? '/hr' : service.pricingModel === 'per_day' ? '/day' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      {isPickingLocation && (
        <div className="fixed inset-0 z-50 bg-[#0f0f13] flex flex-col">
          <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900 border-b border-zinc-800 shrink-0">
            <button onClick={() => setIsPickingLocation(false)} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white">←</button>
            <h1 className="text-xl font-bold text-white">Select Location</h1>
          </div>
          <div className="flex-1 relative">
            <MapView 
              center={userPos} 
              zoom={14} 
              height="100%" 
              showSearch 
              onMark={handleLocationConfirm}
              onSearchSelect={handleSearchSelect}
              markers={[{ lat: userPos[0], lng: userPos[1], label: 'Selected Location' }]}
            />
          </div>
          <div className="p-6 bg-zinc-900 border-t border-zinc-800 shrink-0">
             <p className="text-sm text-zinc-400 mb-4 text-center italic">Tap on the map or use search to set your service area</p>
             <button onClick={() => setIsPickingLocation(false)} className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-bold">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
