import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
const colorMap = {
  'from-blue-500 to-cyan-400': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
  'from-yellow-500 to-amber-400': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
  'from-orange-500 to-amber-500': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  'from-purple-500 to-pink-400': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
  'from-emerald-500 to-teal-400': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  'from-cyan-500 to-sky-400': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
};

function CategoryCard({ category }) {
  const navigate = useNavigate();
  const colors = colorMap[category.color] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };

  return (
    <article
      onClick={() => navigate('/jobs', { state: { category: category.title } })}
      className={`group cursor-pointer rounded-[1.75rem] border ${colors.border} ${colors.bg} p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg`}
    >
      <div className="flex flex-col gap-3">
        {/* Emoji */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} shadow-md text-2xl`}>
          {category.emoji}
        </div>

        {/* Title */}
        <h3 className={`font-bold text-base ${colors.text} leading-tight`}>
          {category.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-5 line-clamp-2">{category.description}</p>
      </div>
    </article>
  );
}

export default memo(CategoryCard);
