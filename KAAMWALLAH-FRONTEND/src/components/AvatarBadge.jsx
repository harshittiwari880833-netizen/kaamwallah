const gradients = [
  'from-sky-500 via-brand-500 to-cyan-300',
  'from-cyan-500 via-sky-500 to-blue-400',
  'from-brand-500 via-cyan-400 to-sky-300',
];

export default function AvatarBadge({ seed = 'KW', size = 'md', imgSrc }) {
  const sizes = {
    sm: 'h-10 w-10 text-sm rounded-2xl',
    md: 'h-14 w-14 text-base rounded-[1.4rem]',
    lg: 'h-24 w-24 text-2xl rounded-[2rem]',
  };

  if (imgSrc) {
    return <img src={imgSrc} alt={seed} className={`object-cover ${sizes[size]}`} />;
  }

  const initials = (seed || 'KW')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const gradient = gradients[(seed || 'KW').length % gradients.length];

  return (
    <div className={`flex flex-shrink-0 items-center justify-center bg-gradient-to-br ${gradient} font-extrabold text-white shadow-glow ${sizes[size]}`}>
      {initials}
    </div>
  );
}
