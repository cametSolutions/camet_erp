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
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 flex flex-col
                  justify-between min-h-[155px] sm:min-h-[130px] transition-all duration-200
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
        <div className="absolute top-3 right-3 z-10 bg-white/20 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1">
          <span className="text-[8px] sm:text-[9px] font-semibold text-white/80 uppercase tracking-wider">
            View breakdown
          </span>
        </div>
      )}

      {/* Illustration */}
      <Illustration />

      {/* Label */}
      <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-white/60 z-10 mt-8">
        {title}
      </p>

      {/* Value */}
      <p className="text-[1.15rem] sm:text-[1.4rem] lg:text-[1.5rem] font-bold text-white z-10 leading-tight mt-1 tracking-tight break-all max-w-[65%] sm:max-w-[70%]">
        {value}
      </p>

      {/* Subtitle */}
      <p className="text-[10px] sm:text-[11px] text-white/55 z-10 mt-1">{subtitle}</p>

      {/* Cash / Bank breakdown — only on daily & monthly cards */}
      {hasBreakdown && (
        <div className="z-10 mt-3 pt-3 border-t border-white/20 flex items-center justify-between gap-2 sm:gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-white/80">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
              <p className="text-[8px] sm:text-[9px] text-white uppercase tracking-wider leading-none">Cash</p>
            </div>
            <p className="text-[12px] sm:text-[14px] font-semibold text-white leading-tight mt-1 break-all">
              {cashTotal}
            </p>
          </div>

          <div className="w-px h-6 bg-white/20 shrink-0" />

          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-1 text-white/80">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                <path d="M3 10h18M3 10V20h18V10M3 10L12 3l9 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              </svg>
              <p className="text-[8px] sm:text-[9px] text-white uppercase tracking-wider leading-none">Bank</p>
            </div>
            <p className="text-[12px] sm:text-[14px] font-semibold text-white leading-tight mt-1 break-all">
              {bankTotal}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
