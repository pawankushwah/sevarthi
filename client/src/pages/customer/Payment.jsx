import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../api';

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const showReview = params.get('review') === '1';

  const [booking, setBooking] = useState(null);
  const [method, setMethod] = useState('upi');
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [rated, setRated] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get(`/bookings/${id}`),
      api.get('/wallet/balance')
    ]).then(([bR, wR]) => {
      setBooking(bR.data);
      setBalance(wR.data.balance);
      setLoading(false);
    });
  }, [id]);

  const upiLink = booking
    ? `upi://pay?pa=${booking.providerId?.upiId || '9303011791@ptsbi'}&pn=${encodeURIComponent(booking.providerId?.name || 'Provider')}&am=${booking.fare}&cu=INR&tn=Sevarthi+Booking+${booking._id}`
    : '';

  const handlePay = async () => {
    if (method === 'wallet' && balance < booking?.fare) {
      alert('Insufficient wallet balance');
      return;
    }
    setPaying(true);
    try {
      await api.patch(`/bookings/${id}/payment`, { paymentMethod: method });
      setPaid(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleReview = async () => {
    try {
      await api.patch(`/bookings/${id}/review`, { rating, review });
      setRated(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      alert('Review failed');
    }
  };

  if (loading) return (
    <div className="min-h-dvh bg-[#0f0f13] flex items-center justify-center">
      <div className="text-zinc-400 animate-pulse">Loading...</div>
    </div>
  );

  if (paid || (booking?.isPaid && !showReview)) {
    return (
      <div className="min-h-dvh bg-[#0f0f13] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center text-4xl mb-5">✅</div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Done!</h2>
        <p className="text-zinc-400 text-sm text-center mb-8">₹{booking?.fare} sent to {booking?.providerId?.name}</p>
        <button onClick={() => navigate('/')} className="w-full max-w-xs py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20">Back to Home</button>
      </div>
    );
  }

  if (rated) {
    return (
      <div className="min-h-dvh bg-[#0f0f13] flex flex-col items-center justify-center px-6">
        <div className="text-5xl mb-4">⭐</div>
        <h2 className="text-xl font-bold text-white">Thanks for rating!</h2>
      </div>
    );
  }

  if (showReview && booking?.isPaid) {
    return (
      <div className="min-h-dvh bg-[#0f0f13] flex flex-col px-6 py-12">
        <button onClick={() => navigate(-1)} className="text-zinc-400 text-sm mb-6 flex items-center gap-2 font-medium">← Back</button>
        <h1 className="text-2xl font-bold text-white mb-2">Rate your experience</h1>
        <p className="text-zinc-400 text-sm mb-8">How was {booking.providerId?.name}?</p>

        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button key={star} onClick={() => setRating(star)} className="active:scale-90 transition-transform">
              <span className={`text-4xl transition-all ${star <= rating ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-700'}`}>★</span>
            </button>
          ))}
        </div>

        <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} placeholder="Share your experience (optional)..."
          className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm mb-6 focus:outline-none focus:border-orange-500 resize-none transition-colors" />

        <button onClick={handleReview} className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/20">Submit Review</button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col px-5 py-12">
      <button onClick={() => navigate(-1)} className="text-zinc-400 text-sm mb-6 flex items-center gap-2 font-medium transition-colors hover:text-white group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
      </button>
      <h1 className="text-2xl font-bold text-white mb-1">Payment</h1>
      <p className="text-zinc-400 text-sm mb-6">{booking?.serviceId?.icon} {booking?.serviceId?.name}</p>

      {/* Fare display */}
      <div className="bg-linear-to-b from-zinc-800 to-zinc-900 border border-zinc-700 rounded-[2rem] p-8 mb-8 text-center shadow-xl">
        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-2">Amount to Pay</p>
        <p className="text-5xl font-extrabold text-white mb-2 tracking-tight">₹{Number(booking?.fare).toFixed(2)}</p>
        <div className="h-px bg-zinc-800 w-12 mx-auto mb-3" />
        <p className="text-zinc-500 text-[11px] font-medium">to <span className="text-zinc-300">{booking?.providerId?.name}</span></p>
      </div>

      {/* Method toggle */}
      <div className="flex gap-2.5 mb-8 p-1.5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
        {[
          { key: 'upi', icon: '📱', label: 'UPI' },
          { key: 'wallet', icon: '💳', label: 'Wallet' },
          { key: 'cash', icon: '💵', label: 'Cash' },
        ].map(m => (
          <button key={m.key} onClick={() => setMethod(m.key)}
            className={`flex-1 py-3.5 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 transition-all ${method === m.key ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20' : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'}`}>
            <span className="text-lg">{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      {/* Wallet Info */}
      {method === 'wallet' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Your Balance</p>
              <p className={`text-2xl font-bold ${balance >= booking?.fare ? 'text-white' : 'text-red-400'}`}>₹{balance}</p>
            </div>
            <button onClick={() => navigate('/wallet')} className="text-xs font-bold text-orange-500 bg-orange-500/10 px-4 py-2 rounded-xl hover:bg-orange-500/20 transition-all">Recharge</button>
          </div>
          {balance < booking?.fare ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
              <p className="text-red-400 text-xs leading-relaxed font-medium">Insufficient funds. Please recharge your wallet or choose another payment method.</p>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
              <span className="text-green-400 shrink-0 mt-0.5">✅</span>
              <p className="text-green-400 text-xs leading-relaxed font-medium">Payment will be instant. ₹{Number(booking?.fare).toFixed(2)} will be deducted from your Sevarthi wallet.</p>
            </div>
          )}
        </div>
      )}

      {/* UPI QR */}
      {method === 'upi' && (
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="bg-white p-5 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-linear-to-tr from-orange-500/5 to-transparent pointer-events-none" />
            <QRCodeSVG value={upiLink} size={220} className="relative z-10" />
          </div>
          <div className="text-center">
            <p className="text-xs text-zinc-500 font-medium mb-4 uppercase tracking-[0.2em]">Scan & Pay</p>
            <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 inline-flex items-center gap-4 transition-all hover:border-zinc-700">
               <div>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-0.5 text-left">UPI ID</p>
                 <p className="text-white text-[15px] font-mono font-semibold tracking-tight">{booking?.providerId?.upiId || '9303011791@ptsbi'}</p>
               </div>
               <button onClick={() => navigator.clipboard.writeText(booking?.providerId?.upiId || '9303011791@ptsbi')} className="p-2.5 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">📋</button>
            </div>
          </div>
        </div>
      )}

      {/* Cash instructions */}
      {method === 'cash' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
             <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-2xl">💵</div>
             <p className="text-white font-bold">Cash Payment</p>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed mb-1">Please keep <span className="text-white font-bold">₹{booking?.fare}</span> ready.</p>
          <p className="text-zinc-500 text-[11px] font-medium">Hand it to {booking?.providerId?.name} and confirm payment completion below.</p>
        </div>
      )}

      <button onClick={handlePay} disabled={paying || (method === 'wallet' && balance < booking?.fare)}
        className="w-full py-5 rounded-[1.5rem] bg-orange-500 text-white font-extrabold text-lg hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100 shadow-xl shadow-orange-500/20 group">
        {paying ? (
          <div className="flex items-center justify-center gap-3">
             <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
             <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
             <span>{method === 'upi' ? 'I\'ve Paid via UPI' : method === 'wallet' ? 'Confirm Wallet Payment' : 'Confirm Cash Payment'}</span>
             <span className="text-xl group-active:translate-x-1 transition-transform">→</span>
          </div>
        )}
      </button>
    </div>
  );
}
