import { useNavigate } from 'react-router-dom';
import { Zap, Bike, Droplet, Hammer, Paintbrush, Brush, Home } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col items-center justify-between px-8 py-14">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="w-24 h-24 rounded-3xl bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30">
          <Zap className="w-12 h-12 text-white fill-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-2">Sevarthi</h1>
        <p className="text-zinc-400 text-base text-center max-w-[280px] leading-relaxed">
          Rides, repairs, and skilled workers — all at your doorstep.
        </p>
      </div>

      {/* Hero illustration */}
      <div className="grid grid-cols-3 gap-4 my-12 w-full max-w-sm">
        {[
          { icon: Bike, label: 'Rides' },
          { icon: Zap, label: 'Electrician' },
          { icon: Droplet, label: 'Plumber' },
          { icon: Hammer, label: 'Carpenter' },
          { icon: Home, label: 'Cleaning' },
          { icon: Paintbrush, label: 'Painter' },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-4 flex flex-col items-center gap-3 border border-zinc-800/80 hover:border-orange-500/30 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center shadow-inner transition-colors">
              <s.icon className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs font-medium text-zinc-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-4 w-full max-w-sm mb-6">
        <button
          onClick={() => navigate('/login')}
          className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-lg tracking-wide hover:bg-orange-600 active:scale-[0.98] transition-all shadow-xl shadow-orange-500/20"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full py-4 rounded-2xl bg-zinc-800 text-white font-bold text-lg hover:bg-zinc-700 active:scale-[0.98] transition-all border border-zinc-700"
        >
          Create Account
        </button>
        <button
          onClick={() => navigate('/demo')}
          className="w-full py-4 rounded-2xl bg-zinc-900/50 text-zinc-400 font-bold text-base hover:bg-zinc-800 active:scale-[0.98] transition-all border border-zinc-800 border-dashed mt-2"
        >
          🤖 Try Demo Mode
        </button>
      </div>
    </div>
  );
}
