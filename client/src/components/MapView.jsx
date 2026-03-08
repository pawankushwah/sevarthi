import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const orangeIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
});

// Component to handle map center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    // Fix for tiles not loading when container size changes
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [center, zoom, map]);
  return null;
}

function ClickToMark({ onMark }) {
  useMapEvents({ click(e) { if (onMark) onMark([e.latlng.lng, e.latlng.lat]); } });
  return null;
}

export default function MapView({ center = [19.076, 72.877], zoom = 13, markers = [], onMark, height = '280px', showSearch = false, onSearchSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.slice(0, 4));
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (r) => {
    onSearchSelect?.({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      address: r.display_name.split(',').slice(0, 3).join(',')
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: 'Your current location'
          };
          setUserLocation([coords.lat, coords.lng]);
          onSearchSelect?.(coords);
          setIsLocating(false);
        },
        () => setIsLocating(false),
        { enableHighAccuracy: true }
      );
    }
  };

  return (
    <div style={{ height }} className="rounded-2xl overflow-hidden border border-zinc-800 relative z-0">
      
      {showSearch && (
        <div className="absolute top-2 left-2 right-2 z-401 pointer-events-auto flex flex-col gap-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="flex-1 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl text-black text-sm outline-none shadow-lg border border-zinc-200"
            />
            <button type="submit" className="bg-orange-500 text-white w-12 rounded-xl shadow-lg border border-orange-600 flex items-center justify-center">
              {isSearching ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : '🔍'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-zinc-200">
              {searchResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-100/80 active:bg-zinc-200 transition-colors"
                >
                  <p className="text-sm font-medium text-zinc-900 truncate">{r.display_name.split(',')[0]}</p>
                  <p className="text-[10px] text-zinc-500 truncate">{r.display_name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Focus on me button */}
      <button 
        onClick={handleCurrentLocation}
        disabled={isLocating}
        className={`absolute bottom-6 right-4 z-401 w-12 h-12 bg-white shadow-xl rounded-2xl flex items-center justify-center hover:bg-zinc-100 active:scale-90 transition-all outline-none border border-zinc-200 text-blue-500 group ${isLocating ? 'opacity-70' : ''}`}
        title="Focus on my location"
      >
        <Navigation className={`w-6 h-6 fill-blue-500 transition-all ${isLocating ? 'animate-pulse scale-75' : 'group-active:rotate-45'}`} />
      </button>

      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <ChangeView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onMark && <ClickToMark onMark={onMark} />}
        
        {/* User location dot */}
        {userLocation && (
          <CircleMarker 
            center={userLocation} 
            radius={8} 
            pathOptions={{ fillColor: '#3b82f6', fillOpacity: 0.8, color: 'white', weight: 2 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        )}

        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} icon={orangeIcon}>
            {m.label && <Popup>{m.label}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
