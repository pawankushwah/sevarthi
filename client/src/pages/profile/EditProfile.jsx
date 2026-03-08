import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Phone, Mail, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [serviceId, setServiceId] = useState(user?.serviceId || '');
  const [services, setServices] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'provider') {
      api.get('/services').then(r => setServices(r.data));
    }
  }, [user?.role]);
  
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', { name, phone, email, serviceId });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Edit Profile</h1>
      </div>

      <div className="px-6 py-6 flex-1">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              {name ? <span className="text-4xl font-bold">{name.charAt(0).toUpperCase()}</span> : <User className="w-10 h-10" />}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4 pb-10">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-zinc-500" />
              </div>
              <input 
                type="text" required
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-zinc-500" />
              </div>
              <input 
                type="tel" required
                value={phone} 
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-zinc-500" />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
                placeholder="Optional"
              />
            </div>
          </div>

          {user?.role === 'provider' && (
            <>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Service Category</label>
                <select 
                  value={serviceId} 
                  onChange={e => setServiceId(e.target.value)}
                  className="w-full bg-zinc-900/80 border border-zinc-800 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:border-orange-500 transition-all font-medium appearance-none"
                >
                  <option value="">Select Service</option>
                  {services.map(s => (
                    <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1.5 block uppercase tracking-wider">Personal UPI ID</label>
                <input 
                  type="text" 
                  value={user?.upiId || ''} 
                  placeholder="name@upi"
                  disabled
                  className="w-full bg-zinc-900/40 border border-zinc-800 text-zinc-500 rounded-2xl px-4 py-3.5 focus:outline-none font-medium opacity-60"
                />
                <p className="text-[10px] text-zinc-600 mt-1 ml-1 italic">* Contact Admin to update payment details</p>
              </div>
            </>
          )}

          <button 
            type="submit" disabled={saving}
            className="w-full py-4 mt-6 rounded-2xl bg-orange-500 text-white font-bold text-[15px] hover:bg-orange-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 disabled:opacity-50"
          >
            <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
