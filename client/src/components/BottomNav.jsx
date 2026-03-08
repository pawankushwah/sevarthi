import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ClipboardList, Wallet, User, BarChart2, Users } from 'lucide-react';

const customerTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/history', icon: ClipboardList, label: 'Bookings' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const providerTabs = [
  { path: '/provider', icon: Home, label: 'Home' },
  { path: '/provider/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const adminTabs = [
  { path: '/admin', icon: BarChart2, label: 'Dashboard' },
  { path: '/admin/providers', icon: Users, label: 'Providers' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = user?.role === 'provider' ? providerTabs : user?.role === 'admin' ? adminTabs : customerTabs;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 transition-colors ${active ? 'text-orange-500' : 'text-zinc-500 hover:text-orange-400'}`}>
              <tab.icon className={`w-6 h-6 ${active ? 'fill-orange-500/20' : ''}`} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
