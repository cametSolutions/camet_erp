/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import TouchKeyboard from "./TouchKeyboard";
import { Keyboard } from "lucide-react";
import "./touchKeyboard.css";

export const TouchKeyboardContext = createContext(null);

function KeyboardScope({ children }) {
  const [active, setActive] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [height, setHeight] = useState(0);
  const panelRef = useRef(null);
  const activeRef = useRef(null);
  const location = useLocation();
  const api = useMemo(() => ({
    open(field) {
      activeRef.current = field;
      setActive(field);
    },
    close(field) {
      if (field && activeRef.current !== field) return;
      activeRef.current = null;
      setActive(null);
      setKeyboardOpen(false);
      setHeight(0);
    },
  }), []);

  useEffect(() => { api.close(); }, [location.key, api]);
  useLayoutEffect(() => {
    if (!active || !keyboardOpen || !panelRef.current) {
      setHeight(0);
      return;
    }
    const measure = () => setHeight(panelRef.current?.getBoundingClientRect().height || 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [active, keyboardOpen]);
  useEffect(() => {
    if (height) active?.current.element?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [height, active]);

  const done = () => {
    activeRef.current?.current.element?.blur();
    api.close();
  };
  return (
    <TouchKeyboardContext.Provider value={api}>
      <div className="kot-touch-scope" data-keyboard-open={!!active && keyboardOpen}
        data-launcher-visible={!!active && !keyboardOpen}
        style={{ "--kot-keyboard-height": `${height}px` }}
        onPointerDownCapture={(event) => {
          if (activeRef.current && !event.target.closest("[data-kot-touch-input], .kot-touch-keyboard")) done();
        }}>
        {children}
        {active && !keyboardOpen && (
          <div className="kot-touch-keyboard kot-touch-launcher"
            onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
            onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
            onClick={(event) => event.stopPropagation()}>
            <button type="button" className="kot-touch-launcher-button"
              aria-label="Open touch keyboard" title="Open touch keyboard for the selected input"
              onClick={() => {
                activeRef.current?.current.element?.focus({ preventScroll: true });
                setKeyboardOpen(true);
              }}>
              <Keyboard aria-hidden="true" size={25} strokeWidth={1.8} />
            </button>
          </div>
        )}
        {active && keyboardOpen && <TouchKeyboard key={active.current.numeric ? "number" : "text"}
          type={active.current.numeric ? "number" : "text"}
          allowDecimal={active.current.allowDecimal} panelRef={panelRef}
          onKey={(key) => activeRef.current?.current.press(key)} onClose={done} />}
      </div>
    </TouchKeyboardContext.Provider>
  );
}

// Table selection is also embedded in the POS: reuse its existing keyboard.
export default function TouchKeyboardScope({ children }) {
  const existing = useContext(TouchKeyboardContext);
  return existing ? children : <KeyboardScope>{children}</KeyboardScope>;
}
