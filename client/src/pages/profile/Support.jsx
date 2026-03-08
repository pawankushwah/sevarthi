import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, PhoneCall, Mail, FileText } from 'lucide-react';

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col">
      <div className="flex items-center gap-4 px-6 pt-14 pb-5 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:bg-zinc-700 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-white">Support & Help</h1>
      </div>

      <div className="px-5 py-6 flex-1">
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-white mb-2">How can we help?</h2>
          <p className="text-zinc-400 text-sm">We're here to support you 24/7.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-zinc-800/80 active:scale-[0.98] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-white">Chat</span>
          </button>
          
          <button className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-zinc-800/80 active:scale-[0.98] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-white">Call Us</span>
          </button>
          
          <button className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-zinc-800/80 active:scale-[0.98] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-white">Email</span>
          </button>
          
          <button className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 flex flex-col items-center gap-3 hover:border-orange-500/50 hover:bg-zinc-800/80 active:scale-[0.98] transition-all group">
            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-white">FAQs</span>
          </button>
        </div>

        <div>
          <h3 className="text-zinc-400 font-semibold mb-3 uppercase tracking-wider text-xs">Recent Issues</h3>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <button className="w-full text-left px-5 py-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
              <p className="text-white text-sm font-medium mb-1">Issue with recent ride payment</p>
              <p className="text-zinc-500 text-xs">Ticket: #4912 • Closed</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
