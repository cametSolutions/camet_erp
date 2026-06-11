/* eslint-disable react/prop-types */

const StatCard = ({
  title,
  value,
  subtitle,
  bgColor,
  illustration: Illustration,
  onClick,
  cashTotal,
  bankTotal,
}) => {
  const isClickable = !!onClick;
  const hasBreakdown = !!cashTotal && !!bankTotal;

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 flex flex-col
                  justify-between min-h-[130px] transition-all duration-200
                  ${isClickable
                    ? "cursor-pointer hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                    : ""
                  }`}
      style={{ backgroundColor: bgColor, filter: "saturate(0.75) brightness(0.92)" }}
    >
      {/* Subtle dark overlay */}
      <div className="absolute inset-0 bg-black/5 rounded-2xl" />

      {/* Clickable hint badge */}
      {isClickable && (
        <div className="absolute top-3 right-3 z-10 bg-white/20 rounded-full px-2 py-0.5">
          <span className="text-[9px] font-semibold text-white/80 uppercase tracking-wider">
            View breakdown
          </span>
        </div>
      )}

      {/* Illustration */}
      <Illustration />

      {/* Label */}
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 z-10 mt-8">
        {title}
      </p>

      {/* Value */}
      <p className="text-[1.75rem] font-bold text-white z-10 leading-none mt-1 tracking-tight">
        {value}
      </p>

      {/* Subtitle */}
      <p className="text-[11px] text-white/55 z-10 mt-1">{subtitle}</p>

      {/* Cash / Bank breakdown — only on daily & monthly cards */}
      {hasBreakdown && (
        <div className="z-10 mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {/* Cash icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/70 flex-shrink-0">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
            </svg>
            <div className="font-bold text-left ">
              <p className="text-[8px] text-white uppercase tracking-wider leading-none">Cash</p>
              <p className="text-[14px] font-semibold text-white leading-tight">{cashTotal}</p>
            </div>
          </div>

          <div className="w-px h-6 bg-white/20" />

          <div className="flex items-center gap-1.5">
            {/* Bank icon */}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-white/70 flex-shrink-0">
              <path d="M3 10h18M3 10V20h18V10M3 10L12 3l9 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
            <div className="font-bold  text-right">
              <p className="text-[8px] text-white uppercase tracking-wider leading-none">Bank</p>
              <p className="text-[14px] font-semibold text-white leading-tight">{bankTotal}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;