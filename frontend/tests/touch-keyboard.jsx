// Local-only fixture: open /tests/touch-keyboard.html in the Vite dev server.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import TouchKeyboardScope from "../src/components/common/touchKeyboard/TouchKeyboardScope";
import TouchInput from "../src/components/common/touchKeyboard/TouchInput";
import "../src/index.css";

export default function Fixture() {
  const [search, setSearch] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState("");
  const [modal, setModal] = useState(false);
  const [note, setNote] = useState("");
  return <TouchKeyboardScope><main className="h-screen flex flex-col p-4 gap-4">
    <h1>KOT keyboard regression fixture</h1>
    <label>Item search <TouchInput aria-label="Item search" value={search} onChange={e => setSearch(e.target.value)} /></label>
    <label>Quantity <TouchInput aria-label="Quantity" type="number" step="0.5" min="0.5" value={quantity || ""}
      onChange={e => setQuantity(parseFloat(e.target.value) || 0)} onBlur={e => setQuantity(Math.max(0.5, parseFloat(e.target.value) || 0.5))} /></label>
    <label>Phone <TouchInput aria-label="Phone" keyboardType="number" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} /></label>
    <label>Date <TouchInput aria-label="Date" type="date" /></label>
    <button onClick={() => setModal(true)}>Open remarks dialog</button>
    <output>State: {JSON.stringify({ search, quantity, phone, note })}</output>
    <div className="flex-1 min-h-0 overflow-y-auto">Order items</div>
    <button>Save KOT fixture</button>
    {modal && <div className="kot-details-modal fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-4 max-h-[85vh] overflow-auto">
        <TouchKeyboardScope><label>Remarks <TouchInput as="textarea" aria-label="Remarks" value={note} onChange={e => setNote(e.target.value)} /></label></TouchKeyboardScope>
        <button onClick={() => setModal(false)}>Close dialog</button>
      </div>
    </div>}
  </main></TouchKeyboardScope>;
}
createRoot(document.getElementById("root")).render(<BrowserRouter><Fixture /></BrowserRouter>);
