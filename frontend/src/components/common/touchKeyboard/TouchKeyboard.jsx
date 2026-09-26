/* eslint-disable react/prop-types */
import { useState } from "react";

export default function TouchKeyboard({ type, allowDecimal, onKey, onClose, panelRef }) {
  const [numbers, setNumbers] = useState(type === "number");
  const [uppercase, setUppercase] = useState(false);
  const numeric = type === "number";
  const rows = numbers
    ? ["123", "456", "789", numeric ? (allowDecimal ? ".0" : "0") : ".0,@-/'"]
    : ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
  const key = (label, action = label, extra = "") => (
    <button key={label} type="button" className={`kot-touch-key ${extra}`}
      onClick={() => onKey(action)} aria-label={label === "⌫" ? "Backspace" : label}>
      {label}
    </button>
  );
  return (
    <section ref={panelRef} className="kot-touch-keyboard" aria-label="KOT touch keyboard"
      onPointerDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
      onMouseDown={(event) => { event.preventDefault(); event.stopPropagation(); }}
      onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between mb-2 text-sm font-semibold text-slate-700">
        <span>{numeric ? "Number keypad" : "Touch keyboard"}</span>
        <button type="button" className="kot-touch-key px-4" onClick={onClose} aria-label="Close keyboard">Close ×</button>
      </div>
      <div className={numbers ? "mx-auto max-w-md space-y-1.5" : "space-y-1.5"}>
        {rows.map((row, index) => (
          <div key={index} className="flex justify-center gap-1 sm:gap-2">
            {[...row].map((letter) => key(uppercase ? letter.toUpperCase() : letter))}
            {index === rows.length - 1 && key("⌫", "Backspace")}
          </div>
        ))}
        <div className="flex gap-1 sm:gap-2">
          {!numeric && <button type="button" className="kot-touch-key" onClick={() => setNumbers(!numbers)}>{numbers ? "ABC" : "123"}</button>}
          {!numbers && <button type="button" className="kot-touch-key" aria-pressed={uppercase} onClick={() => setUppercase(!uppercase)}>⇧</button>}
          {!numeric && key("Space", " ", "grow-[3]")}
          {key("Clear")}
          <button type="button" className="kot-touch-key kot-touch-done" onClick={onClose}>Done</button>
        </div>
      </div>
    </section>
  );
}
