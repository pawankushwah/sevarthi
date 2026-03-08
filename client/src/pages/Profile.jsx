import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Pencil, Bell, Headphones, LogOut, ChevronRight } from 'lucide-react';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-28">
      <div className="px-5 pt-12 pb-6 bg-zinc-900/50">
        <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            {user?.name ? <span className="text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span> : <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-zinc-400 text-sm">{user?.phone}</p>
            {user?.email && <p className="text-zinc-500 text-xs mt-0.5">{user.email}</p>}
            <div className="mt-2 inline-block px-2 py-0.5 bg-orange-500/20 border border-orange-500/30 rounded-md text-orange-400 text-[10px] font-bold uppercase tracking-wider">
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 flex-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden mb-6">
          <button onClick={() => navigate('/profile/edit')} className="w-full px-5 py-4 flex items-center justify-between border-b border-zinc-800 hover:bg-zinc-800/70 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <Pencil className="w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-white text-[15px] font-medium">Edit Profile</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
          
          <button onClick={() => navigate('/profile/notifications')} className="w-full px-5 py-4 flex items-center justify-between border-b border-zinc-800 hover:bg-zinc-800/70 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <Bell className="w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-white text-[15px] font-medium">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
          
          <button onClick={() => navigate('/profile/support')} className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-800/70 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                <Headphones className="w-4 h-4 text-zinc-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <span className="text-white text-[15px] font-medium">Support & Help</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </button>
        </div>

        <button 
          onClick={logout}
          className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-[15px] hover:bg-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" /> Log Out
        </button>

        <p className="text-center text-zinc-600 text-xs mt-6">App Version 1.0.0</p>
      </div>

      <BottomNav />
    </div>
  );
}
