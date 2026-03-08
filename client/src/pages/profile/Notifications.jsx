import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Bell, CheckCircle2, Ticket, Zap } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'promo', title: '50% off your next ride!', desc: 'Use code SEVARTHI50 to get a discount on your next ride.', time: '2 hours ago', unread: true, icon: Ticket, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 2, type: 'system', title: 'Payment Successful', desc: 'Your payment of ₹150 for your recent ride was successful.', time: '1 day ago', unread: false, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 3, type: 'promo', title: 'New Electricians available in your area', desc: 'Book a certified electrician now with no surge pricing.', time: '3 days ago', unread: false, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Notifications</h1>
      </div>

      <div className="px-5 py-6 flex-1 flex flex-col gap-3">
        {mockNotifications.map(notif => (
          <div key={notif.id} className={`p-4 rounded-2xl flex gap-4 transition-colors ${notif.unread ? 'bg-zinc-800/80 border border-zinc-700/50' : 'bg-transparent border border-zinc-800/30'}`}>
            <div className={`w-12 h-12 rounded-full ${notif.bg} flex items-center justify-center shrink-0`}>
              <notif.icon className={`w-6 h-6 ${notif.color}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={`text-[15px] font-semibold ${notif.unread ? 'text-white' : 'text-zinc-300'}`}>{notif.title}</h3>
                {notif.unread && <span className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />}
              </div>
              <p className="text-zinc-400 text-sm leading-snug mb-2">{notif.desc}</p>
              <p className="text-zinc-500 text-xs font-medium">{notif.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
