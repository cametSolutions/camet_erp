import { useState, useEffect, useRef } from "react";

const Demo = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  // Function to get scroll position
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-xl font-bold mb-4">Scroll Position: {scrollPosition}px</h1>
      <div
        ref={containerRef}
        className="w-full max-w-md h-64 overflow-y-auto border border-gray-300 rounded-lg p-2"
      >
        {/* Long list of items */}
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="p-2 border-b border-gray-200">
            Item {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Demo;
