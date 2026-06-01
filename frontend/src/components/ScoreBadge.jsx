const ScoreBadge = ({ label, score, size = 'md' }) => {
  const getColor = (s) => {
    if (s >= 85) return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40', bar: 'bg-green-500' };
    if (s >= 70) return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', bar: 'bg-emerald-500' };
    if (s >= 50) return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', bar: 'bg-amber-500' };
    if (s >= 30) return { text: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40', bar: 'bg-orange-500' };
    return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40', bar: 'bg-red-500' };
  };

  const c = getColor(score);
  const isSm = size === 'sm';

  return (
    <div className={`${isSm ? 'p-2' : 'p-3'} ${c.bg} rounded-lg border ${c.border}`}>
      <p className={`${isSm ? 'text-[10px]' : 'text-xs'} text-gray-400 mb-1`}>{label}</p>
      <div className="flex items-center gap-2">
        <span className={`${isSm ? 'text-base' : 'text-xl'} font-bold ${c.text}`}>{score}</span>
        {!isSm && (
          <div className="flex-1 h-1.5 bg-astroDark/50 rounded-full overflow-hidden">
            <div className={`h-full ${c.bar} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
          </div>
        )}
      </div>
    </div>
  );
};

const ScorePanel = ({ astro, photo, tourism, global: g }) => (
  <div className="grid grid-cols-4 gap-2">
    <ScoreBadge label="Astro" score={astro} size="sm" />
    <ScoreBadge label="Photo" score={photo} size="sm" />
    <ScoreBadge label="Turismo" score={tourism} size="sm" />
    <ScoreBadge label="Global" score={g} size="sm" />
  </div>
);

export { ScoreBadge, ScorePanel };
export default ScorePanel;
