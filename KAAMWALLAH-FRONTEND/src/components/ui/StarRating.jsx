export default function StarRating({ rating = 0, max = 5, size = 'sm' }) {
  const sizeClass = size === 'lg' ? 'text-xl' : size === 'md' ? 'text-base' : 'text-sm';
  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`} aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half = !filled && i < rating;
        return (
          <span key={i} className={filled ? 'text-amber-400' : half ? 'text-amber-300' : 'text-slate-200'}>
            ★
          </span>
        );
      })}
    </span>
  );
}
