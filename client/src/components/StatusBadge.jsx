export default function StatusBadge({ status }) {
  const map = {
    requested:   { label: 'Requested',   bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    confirmed:   { label: 'Confirmed',   bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    in_progress: { label: 'In Progress', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    completed:   { label: 'Completed',   bg: 'bg-green-500/20 text-green-400 border-green-500/30' },
    cancelled:   { label: 'Cancelled',   bg: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const { label, bg } = map[status] || { label: status, bg: 'bg-zinc-700 text-zinc-300 border-zinc-600' };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bg}`}>
      {label}
    </span>
  );
}
