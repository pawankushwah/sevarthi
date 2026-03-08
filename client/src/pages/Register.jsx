import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const RIDE_GROUPS = ['rides'];
const QUICK_GROUPS = ['quick'];
const EXT_GROUPS = ['extended'];

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = role, 2 = details
  const [role, setRole] = useState('');
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '',
    serviceId: '', serviceGroup: '',
    vehicletype: '', vehicleNumber: '', vehicleModel: '',
    upiId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role === 'provider') {
      api.get('/services').then(r => setServices(r.data));
    }
  }, [role]);

  const selectedService = services.find(s => s._id === form.serviceId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = {
        name: form.name, phone: form.phone, email: form.email,
        password: form.password, role,
      };
      if (role === 'provider') {
        payload.serviceId = form.serviceId;
        payload.serviceGroup = selectedService?.group || '';
        payload.vehicleDetails = {
          type: form.vehicletype, number: form.vehicleNumber, model: form.vehicleModel
        };
        payload.upiId = form.upiId;
      }
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      if (data.user.role === 'provider') navigate('/provider');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (step === 1) {
    return (
      <div className="min-h-dvh bg-[#0f0f13] flex flex-col px-6 py-10">
        <button onClick={() => navigate('/')} className="text-zinc-400 text-sm mb-8">← Back</button>
        <h1 className="text-2xl font-bold text-white mb-2">I am a...</h1>
        <p className="text-zinc-400 text-sm mb-8">Choose how you want to use Sevarthi</p>
        <div className="flex flex-col gap-4">
          {[
            { role: 'customer', icon: '👤', label: 'Customer', desc: 'Book rides and services' },
            { role: 'provider', icon: '🛠️', label: 'Service Provider', desc: 'Offer your skills and earn' },
          ].map(r => (
            <button key={r.role} onClick={() => { setRole(r.role); setStep(2); }}
              className="flex items-center gap-4 p-5 bg-zinc-900 border border-zinc-700 rounded-2xl hover:border-orange-500 active:scale-95 transition-all text-left">
              <span className="text-3xl">{r.icon}</span>
              <div>
                <p className="text-white font-semibold">{r.label}</p>
                <p className="text-zinc-400 text-sm">{r.desc}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-zinc-400 text-sm text-center mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-400 font-semibold">Sign In</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col px-6 py-10 overflow-y-auto">
      <button onClick={() => setStep(1)} className="text-zinc-400 text-sm mb-6">← Back</button>
      <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
      <p className="text-zinc-400 text-sm mb-6">As a {role === 'customer' ? 'Customer' : 'Service Provider'}</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
          { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '10-digit phone' },
          { label: 'Email (optional)', key: 'email', type: 'email', placeholder: 'email@example.com' },
          { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">{label}</label>
            <input type={type} placeholder={placeholder} value={form[key]}
              onChange={e => f(key, e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500 transition-colors"
              required={key !== 'email'} />
          </div>
        ))}

        {role === 'provider' && (
          <>
            <div>
              <label className="text-xs text-zinc-400 font-medium mb-1 block">Select Your Service</label>
              <select value={form.serviceId} onChange={e => f('serviceId', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500"
                required>
                <option value="">-- Choose a service --</option>
                {['rides', 'quick', 'extended'].map(grp => (
                  <optgroup key={grp} label={grp === 'rides' ? '🏍️ Rides' : grp === 'quick' ? '⚡ Quick Services' : '🔨 Extended Services'}>
                    {services.filter(s => s.group === grp).map(s => (
                      <option key={s._id} value={s._id}>{s.icon} {s.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedService?.group === 'rides' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Vehicle Type', key: 'vehicletype', placeholder: 'Bike / Auto / Cab' },
                    { label: 'Vehicle Number', key: 'vehicleNumber', placeholder: 'MH12AB1234' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-zinc-400 font-medium mb-1 block">{label}</label>
                      <input type="text" placeholder={placeholder} value={form[key]}
                        onChange={e => f(key, e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-orange-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-medium mb-1 block">Vehicle Model</label>
                  <input type="text" placeholder="Honda Activa / Bajaj RE" value={form.vehicleModel}
                    onChange={e => f('vehicleModel', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500" />
                </div>
              </>
            )}

            <div>
              <label className="text-xs text-zinc-400 font-medium mb-1 block">UPI ID (for payments)</label>
              <input type="text" placeholder="yourname@upi" value={form.upiId}
                onChange={e => f('upiId', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-orange-500" />
            </div>
          </>
        )}

        {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-semibold text-base mt-2 hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        {role === 'provider' && (
          <p className="text-xs text-zinc-500 text-center">Your account will be reviewed and approved by admin before you can start accepting jobs.</p>
        )}
      </form>
    </div>
  );
}
