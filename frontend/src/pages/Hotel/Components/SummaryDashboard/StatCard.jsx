/* eslint-disable react/prop-types */
const ArrowUpIcon = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 10 10"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M5 8V2M2 5L5 2L8 5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const StatCard = ({
  title,
  value,
  subtitle,
  bgColor,
  illustration: Illustration,
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-[22px] pb-0 flex flex-col justify-between min-h-[210px]"
      style={{ backgroundColor: bgColor }}
    >
      {/* Illustration */}
      <Illustration />

      {/* Top row */}
      <div className="flex justify-between items-start z-10 relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 m-0">
          {title}
        </p>
        <div className="flex flex-col gap-[3px]">
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-white/60 block" />
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-white/60 block" />
          <span className="w-[3.5px] h-[3.5px] rounded-full bg-white/60 block" />
        </div>
      </div>

      {/* Value */}
      <p className="text-[28px] font-extrabold text-white mt-2 mb-0 leading-none tracking-tight z-10 relative">
        {value}
      </p>

      {/* Subtitle pill */}
      <div className="mt-3 mb-4 z-10 relative">
        <span className="inline-flex items-center gap-[5px] bg-black/[0.18] text-white/90 text-[11px] font-medium px-[13px] py-[6px] rounded-full">
          <ArrowUpIcon />
          {subtitle}
        </span>
      </div>
    </div>
  );
};

export default StatCard;