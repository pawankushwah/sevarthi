import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import BottomNav from '../../components/BottomNav';
import { useAuth } from '../../context/AuthContext';

export default function Wallet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [amount, setAmount] = useState('');
  const [showRecharge, setShowRecharge] = useState(false);

  const fetchWallet = () => api.get('/wallet/balance').then(r => { setWallet(r.data); setLoading(false); });

  useEffect(() => { fetchWallet(); }, []);

  const handleRecharge = async () => {
    const amt = Number(amount);
    if (!amt || amt < 10) return alert('Minimum recharge is ₹10');
    setRecharging(true);
    try {
      await api.post('/wallet/recharge', { amount: amt });
      setAmount(''); setShowRecharge(false);
      fetchWallet();
    } catch (err) {
      alert(err.response?.data?.message || 'Recharge failed');
    } finally {
      setRecharging(false);
    }
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      {/* Header */}
      <div className="px-6 pt-14 pb-6 bg-zinc-900/40 backdrop-blur-md sticky top-0 z-10 border-b border-zinc-800/50 mb-6">
        <h1 className="text-3xl font-extrabold text-white">Wallet</h1>
        <p className="text-zinc-400 text-[15px] font-medium mt-1">Manage your Sevarthi balance</p>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {/* Balance card */}
        <div className="mx-6 bg-linear-to-br from-orange-600 to-orange-400 rounded-3xl p-8 shadow-2xl shadow-orange-500/20 mb-8 relative overflow-hidden shrink-0 mt-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
          <p className="text-orange-100/90 text-[13px] font-semibold tracking-wide uppercase mb-2 relative z-10">Available Balance</p>
          <p className="text-white text-6xl font-extrabold mb-6 relative z-10">
            {loading ? '...' : `₹${wallet.balance.toFixed(2)}`}
          </p>
          <div className="flex items-center gap-3 relative z-10 bg-black/10 px-3 py-1.5 rounded-xl backdrop-blur-sm">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px]">👤</div>
            <span className="text-orange-50 text-sm font-medium">{user?.name}</span>
          </div>
        </div>

        {/* Recharge button */}
        <div className="px-6 mb-8 shrink-0">
          <button onClick={() => setShowRecharge(!showRecharge)}
            className="w-full py-4 rounded-2xl bg-zinc-800 border-2 border-zinc-700/50 text-white font-bold text-lg flex items-center justify-center gap-2 hover:border-orange-500/50 hover:bg-zinc-700/50 active:scale-[0.98] transition-all shadow-lg">
            ➕ Add Money
          </button>

          {showRecharge && (
            <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 fade-in">
              <label className="text-xs text-zinc-400 mb-2 block">Enter amount</label>
              <div className="flex gap-2 mb-3">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="₹ Amount" min={10}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500" />
                <button onClick={handleRecharge} disabled={recharging}
                  className="px-5 py-3 bg-orange-500 text-white font-bold rounded-xl text-sm disabled:opacity-50">
                  {recharging ? '...' : 'Add'}
                </button>
              </div>
              <div className="flex gap-2">
                {quickAmounts.map(a => (
                  <button key={a} onClick={() => setAmount(String(a))}
                    className="flex-1 py-2 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg text-xs font-medium hover:border-orange-500 hover:text-orange-400 transition-colors">
                    ₹{a}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transactions */}
        <div className="px-6 pb-20">
          <h2 className="text-sm font-bold text-zinc-400 tracking-wider uppercase mb-4">Transaction History</h2>
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="h-16 bg-zinc-900/80 rounded-2xl mb-3 animate-pulse" />)
          ) : wallet.transactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm bg-zinc-900/30 rounded-3xl border border-zinc-800/50">
              No transactions yet
            </div>
          ) : (
            wallet.transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800/60 rounded-2xl px-5 py-4 mb-3 hover:bg-zinc-800/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'credit' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'credit' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-white text-[15px] font-semibold leading-tight mb-1">{tx.note || 'Transaction'}</p>
                    <p className="text-zinc-500 text-[11px] font-medium tracking-wide uppercase">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={`font-bold text-lg ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
