const Tooltip = ({ children, style }) => (
  <div
    className="z-9999 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-2xl px-4 py-2 border border-gray-700/50
               max-w-none whitespace-nowrap"
    style={{
      width: "200px",        
      maxHeight: "120px",   
      overflowY: "auto",     
      filter: "drop-shadow(0 10px 25px rgba(0, 0, 0, 0.4))",
      ...style,
    }}
  >
    <div className="relative z-10 font-medium leading-relaxed">{children}</div>
    {/* Optional glow and borders if needed */}
    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="absolute inset-0 rounded-lg border border-gradient-to-br from-blue-400/30 to-purple-400/20 pointer-events-none" />
  </div>
);
export default Tooltip;