import { useState, useEffect } from 'react';
import api from '../../api';
import BottomNav from '../../components/BottomNav';

export default function Earnings() {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/balance').then(r => { setWallet(r.data); setLoading(false); });
  }, []);

  const credits = wallet.transactions.filter(t => t.type === 'credit');
  const totalEarned = credits.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-20">
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-bold text-white">Earnings</h1>
        <p className="text-zinc-400 text-sm">Your wallet & income</p>
      </div>

      {/* Stats row */}
      <div className="px-4 grid grid-cols-2 gap-3 mb-5">
        <div className="bg-linear-to-br from-orange-600 to-orange-400 rounded-2xl p-4 shadow-lg shadow-orange-500/20">
          <p className="text-orange-100 text-xs mb-1">Wallet Balance</p>
          <p className="text-white text-2xl font-bold">{loading ? '...' : `₹${wallet.balance.toFixed(0)}`}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-400 text-xs mb-1">Total Earned</p>
          <p className="text-green-400 text-2xl font-bold">{loading ? '...' : `₹${totalEarned}`}</p>
        </div>
      </div>

      <div className="px-4">
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Transaction History</h2>
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-14 bg-zinc-900 rounded-xl mb-2 animate-pulse" />)
        ) : wallet.transactions.length === 0 ? (
          <div className="text-center py-10 text-zinc-500 text-sm">No transactions yet. Complete jobs to earn!</div>
        ) : (
          wallet.transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 mb-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {tx.type === 'credit' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-white text-sm font-medium leading-tight line-clamp-1">{tx.note || 'Transaction'}</p>
                  <p className="text-zinc-500 text-xs">{new Date(tx.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
