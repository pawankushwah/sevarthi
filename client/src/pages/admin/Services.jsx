import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function AdminServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [newService, setNewService] = useState({ name: '', category: '', group: 'quick', basePrice: 0, icon: '🛠️' });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = () => {
    setLoading(true);
    api.get('/services').then(r => { setServices(r.data); setLoading(false); });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (editingService) {
      await api.patch(`/admin/services/${editingService._id}`, newService);
    } else {
      await api.post('/admin/services', newService);
    }
    closeModal();
    fetchServices();
  };

  const editService = (s) => {
    setEditingService(s);
    setNewService({ name: s.name, category: s.category, group: s.group, basePrice: s.basePrice, icon: s.icon });
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditingService(null);
    setNewService({ name: '', category: '', group: 'quick', basePrice: 0, icon: '🛠️' });
  };

  const toggleStatus = async (s) => {
    await api.patch(`/admin/services/${s._id}`, { isActive: !s.isActive });
    fetchServices();
  };

  const deleteService = async (id) => {
    if (!confirm('Delete this service?')) return;
    await api.delete(`/admin/services/${id}`);
    fetchServices();
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-10">
      <div className="px-6 pt-14 pb-5 bg-zinc-900 flex items-center gap-4 sticky top-0 z-10 border-b border-zinc-800">
        <button onClick={() => navigate('/admin')} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white">←</button>
        <h1 className="text-xl font-bold text-white flex-1">Categories</h1>
        <button onClick={() => setShowAdd(true)} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20">+ Add</button>
      </div>

      <div className="px-5 mt-6">
        {loading ? (
          <div className="space-y-3">
             {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-zinc-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {services.map(s => (
              <div key={s._id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{s.name}</h3>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-wider">{s.group} · {s.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleStatus(s)} 
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${s.isActive ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                    {s.isActive ? 'Active' : 'Off'}
                  </button>
                  <button onClick={() => editService(s)} className="p-2 text-zinc-400 hover:text-white transition-colors">✏️</button>
                  <button onClick={() => deleteService(s._id)} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-5">
            <h2 className="text-xl font-bold text-white mb-6">{editingService ? 'Edit Service' : 'New Service'}</h2>
            <div className="space-y-4 mb-8">
              <input required placeholder="Name (e.g. Salon for Men)" value={newService.name} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" 
                onChange={e => setNewService({...newService, name: e.target.value})} />
              <input required placeholder="Category (e.g. Grooming)" value={newService.category} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" 
                onChange={e => setNewService({...newService, category: e.target.value})} />
              <select className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none"
                value={newService.group}
                onChange={e => setNewService({...newService, group: e.target.value})}>
                <option value="quick">Quick Service</option>
                <option value="rides">Ride Service</option>
                <option value="extended">Project/Extended</option>
              </select>
              <input type="number" required placeholder="Base Price" value={newService.basePrice} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" 
                onChange={e => setNewService({...newService, basePrice: e.target.value})} />
              <input placeholder="Icon (emoji)" value={newService.icon} className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:border-orange-500 outline-none" 
                onChange={e => setNewService({...newService, icon: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-orange-500 text-white py-3.5 rounded-2xl font-bold hover:bg-orange-600 transition-all">{editingService ? 'Update' : 'Create'}</button>
              <button type="button" onClick={closeModal} className="flex-1 bg-zinc-800 text-zinc-400 py-3.5 rounded-2xl font-bold hover:bg-zinc-700 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
