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
  cashLabel = "Cash",
  bankLabel = "Bank",
  cashIcon = "cash",
  bankIcon = "bank",
}) => {
  const isClickable = !!onClick;
  const hasBreakdown = !!cashTotal && !!bankTotal;

  const DetailIcon = ({ type }) => {
    if (type === "available") {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M4 10L12 4L20 10V20H4V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9 14L11 16L15 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }

    if (type === "blocked") {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 11V8C8 5.79086 9.79086 4 12 4C14.2091 4 16 5.79086 16 8V11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (type === "hotel") {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M4 20V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8 9H10M14 9H16M8 13H10M14 13H16M10 20V16H14V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (type === "restaurant") {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M7 4V11M10 4V11M7 8H10M8.5 11V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M15 4C17 6 17 9 15 11V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    }

    if (type === "bank") {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
          <path d="M3 10h18M3 10V20h18V10M3 10L12 3l9 7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      );
    }

    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    );
  };

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
              <DetailIcon type={cashIcon} />
              <p className="text-[8px] sm:text-[9px] text-white uppercase tracking-wider leading-none">{cashLabel}</p>
            </div>
            <p className="text-[12px] sm:text-[14px] font-semibold text-white leading-tight mt-1 break-all">
              {cashTotal}
            </p>
          </div>

          <div className="w-px h-6 bg-white/20 shrink-0" />

          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-1 text-white/80">
              <DetailIcon type={bankIcon} />
              <p className="text-[8px] sm:text-[9px] text-white uppercase tracking-wider leading-none">{bankLabel}</p>
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
