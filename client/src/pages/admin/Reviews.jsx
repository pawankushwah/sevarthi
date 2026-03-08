import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function AdminReviews() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = () => {
    setLoading(true);
    api.get('/admin/reviews').then(r => { setReviews(r.data); setLoading(false); });
  };

  const handleModerate = async (id) => {
    if (!confirm('Moderate this review? This will remove the comment and rating.')) return;
    await api.delete(`/admin/reviews/${id}`);
    fetchReviews();
  };

  return (
    <div className="min-h-dvh bg-[#0f0f13] flex flex-col pb-10">
      <div className="px-6 pt-14 pb-5 bg-zinc-900 flex items-center gap-4 sticky top-0 z-10 border-b border-zinc-800">
        <button onClick={() => navigate('/admin')} className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center text-white">←</button>
        <h1 className="text-xl font-bold text-white flex-1">Moderation</h1>
      </div>

      <div className="px-5 mt-6">
        {loading ? (
          <div className="space-y-4">
             {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-zinc-900 rounded-3xl animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No reviews to moderate</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r._id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-white font-bold text-sm">{r.customerId?.name}</p>
                    <p className="text-zinc-500 text-[10px] uppercase">Service: {r.serviceId?.name} · Provider: {r.providerId?.name}</p>
                  </div>
                  <div className="flex text-amber-500 text-xs">
                    {'⭐'.repeat(r.rating)}
                  </div>
                </div>
                <p className="text-zinc-300 text-sm italic mb-4">"{r.review || 'No comment provided'}"</p>
                <button onClick={() => handleModerate(r._id)}
                  className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold hover:bg-red-500/20 transition-all">
                  🚨 Remove Content (Moderate)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
