import { useState } from "react";

export default function AdditionalChargesModal({
  isOpen,
  onClose,
  onSave,
  additionalChargeData = [],
}) {
  const [rows, setRows] = useState([
    { id: 1, chargeId: "", option: "", action: "add", amountType: "flat", value: "", taxPercentage: 0 },
  ]);

  const addRow = () =>
    setRows((r) => [
      ...r,
      { id: Date.now(), chargeId: "", option: "", action: "add", amountType: "flat", value: "", taxPercentage: 0 },
    ]);

  const removeRow = (id) => setRows((r) => r.filter((x) => x.id !== id));

  const update = (id, field, val) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [field]: val } : x)));

  // When charge dropdown changes, also update _id, option, taxPercentage
  const handleChargeSelect = (id, selectedName) => {
    const found = additionalChargeData.find((c) => c.name === selectedName);
    if (!found) return;
    setRows((r) =>
      r.map((x) =>
        x.id === id
          ? { ...x, chargeId: found._id, option: found.name, taxPercentage: found.taxPercentage }
          : x
      )
    );
  };

  // Build the final output object per row
  const buildOutput = (row) => {
    const rawValue = parseFloat(row.value) || 0;
    const taxAmt = parseFloat(((rawValue * row.taxPercentage) / 100).toFixed(2));
    const finalValue = parseFloat((rawValue + taxAmt).toFixed(2));
    return {
      _id: row.chargeId,
      option: row.option,
      value: String(rawValue),
      action: row.action,
      taxPercentage: row.taxPercentage,
      taxAmt,
      finalValue,
    };
  };

  const handleSave = () => {
    const output = rows
      .filter((r) => r.chargeId && r.value)
      .map(buildOutput);
    onSave(output);
  };

  if (!isOpen) return null;

  const NAV = "#0f172a";
  const PINK = "#e91e8c";
  const BORDER = "#e2e8f0";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700;800&display=swap');
    .acm * { box-sizing: border-box; font-family: 'Nunito Sans', sans-serif; }
    .acm-modal { animation: acmUp 0.22s cubic-bezier(0.16,1,0.3,1) both; }
    @keyframes acmUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .acm-row { animation: acmRow 0.15s ease both; }
    @keyframes acmRow { from { opacity:0; transform:translateX(-4px); } to { opacity:1; transform:translateX(0); } }
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; }
    .acm-scroll::-webkit-scrollbar { width:4px; }
    .acm-scroll::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
    .acm-save:hover { background:#c4176e !important; }
    .acm-save:active { transform:scale(0.97) !important; }
    .acm-cancel:hover { background:#f1f5f9 !important; }
    .acm-addrow:hover { border-color:${NAV} !important; color:${NAV} !important; }
    .acm-close:hover { background:rgba(255,255,255,0.14) !important; }
    select:focus, input:focus { outline:none; }
  `;

  const LABEL = { fontSize:"11px", fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", color:"#374151", margin:0 };

  return (
    <div className="acm">
      <style>{css}</style>
      <div
        style={{ position:"fixed", inset:0, zIndex:50, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", background:"rgba(15,26,46,0.55)", backdropFilter:"blur(3px)" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="acm-modal" style={{ width:"100%", maxWidth:"700px", background:"#fff", borderRadius:"6px", overflow:"hidden", boxShadow:"0 20px 60px rgba(15,26,46,0.3), 0 0 0 1px rgba(15,26,46,0.1)" }}>

          {/* HEADER */}
          <div style={{ background:NAV, padding:"13px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", border:"2px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              </div>
              <span style={{ fontSize:"14px", fontWeight:800, color:"#fff" }}>Other Charges</span>
            </div>
            <button className="acm-close" onClick={onClose} style={{ width:28, height:28, borderRadius:"4px", border:"none", background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.45)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* COLUMN LABELS */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 140px 80px 110px 90px 90px 32px", gap:"8px", padding:"10px 20px 8px", background:"#f8fafc", borderBottom:`1px solid ${BORDER}` }}>
            {["Charge", "Action", "Value As", "Amount", "Tax Amt", "Final Value", ""].map((l, i) => (
              <p key={i} style={LABEL}>{l}</p>
            ))}
          </div>

          {/* ROWS */}
          <div className="acm-scroll" style={{ padding:"12px 20px", maxHeight:"300px", overflowY:"auto", background:"#fff" }}>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
              {rows.map((row, idx) => {
                const rawValue = parseFloat(row.value) || 0;
                const taxAmt = parseFloat(((rawValue * row.taxPercentage) / 100).toFixed(2));
                const finalValue = parseFloat((rawValue + taxAmt).toFixed(2));
                const isSub = row.action === "sub";

                return (
                  <div key={row.id} className="acm-row"
                    style={{ display:"grid", gridTemplateColumns:"1fr 140px 80px 110px 90px 90px 32px", gap:"8px", alignItems:"center", padding:"9px 12px", borderRadius:"4px", border:`1px solid ${isSub ? "#bbf7d0" : BORDER}`, background: isSub ? "#f0fdf4" : "#f8fafc", animationDelay:`${idx*0.04}s`, transition:"all 0.2s" }}
                  >
                    {/* Charge select */}
                    <select value={row.option} onChange={(e) => handleChargeSelect(row.id, e.target.value)}
                      style={{ width:"100%", fontSize:"12px", fontWeight:600, color: row.option ? "#0f172a" : "#94a3b8", background:"#fff", border:`1px solid ${BORDER}`, borderRadius:"4px", padding:"6px 8px", cursor:"pointer", fontFamily:"'Nunito Sans',sans-serif" }}
                      onFocus={e => e.currentTarget.style.borderColor = NAV} onBlur={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      <option value="">Select charge</option>
                      {additionalChargeData.map((c) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>

                    {/* Add / Sub toggle */}
                    <div style={{ display:"flex", borderRadius:"4px", overflow:"hidden", border:`1px solid ${BORDER}` }}>
                      {[{ val:"add", label:"ADD" }, { val:"sub", label:"SUB" }].map(({ val, label }) => {
                        const active = row.action === val;
                        return (
                          <button key={val} type="button" onClick={() => update(row.id, "action", val)}
                            style={{ flex:1, padding:"6px 4px", fontSize:"10px", fontWeight:800, letterSpacing:"0.05em", fontFamily:"'Nunito Sans',sans-serif", background: active ? (val === "add" ? NAV : "#15803d") : "#fff", color: active ? "#fff" : "#94a3b8", border:"none", cursor:"pointer", transition:"all 0.15s" }}
                          >{label}</button>
                        );
                      })}
                    </div>

                    {/* ₹ / % toggle */}
                    <div style={{ display:"flex", borderRadius:"4px", overflow:"hidden", border:`1px solid ${BORDER}` }}>
                      {[{ val:"flat", label:"₹" }, { val:"percent", label:"%" }].map(({ val, label }) => {
                        const active = row.amountType === val;
                        return (
                          <button key={val} type="button" onClick={() => update(row.id, "amountType", val)}
                            style={{ flex:1, padding:"6px 0", fontSize:"13px", fontWeight:800, fontFamily:"'Nunito Sans',sans-serif", background: active ? NAV : "#fff", color: active ? "#fff" : "#94a3b8", border:"none", cursor:"pointer", transition:"all 0.15s" }}
                          >{label}</button>
                        );
                      })}
                    </div>

                    {/* Amount input */}
                    <div style={{ display:"flex", alignItems:"center", gap:"3px", background:"#fff", border:`1px solid ${BORDER}`, borderRadius:"4px", padding:"6px 8px" }}
                      onFocus={e => e.currentTarget.style.borderColor = NAV} onBlur={e => e.currentTarget.style.borderColor = BORDER}
                    >
                      <span style={{ fontSize:"11px", color:"#94a3b8", fontWeight:700, flexShrink:0 }}>{row.amountType === "flat" ? "₹" : "%"}</span>
                      <input type="number" min="0" placeholder="0" value={row.value}
                        onChange={(e) => update(row.id, "value", e.target.value)}
                        style={{ width:"100%", fontSize:"12px", fontWeight:700, color:"#0f172a", background:"transparent", border:"none", outline:"none", fontFamily:"'Nunito Sans',sans-serif", fontVariantNumeric:"tabular-nums" }}
                      />
                    </div>

                    {/* Tax Amt — read only */}
                    <div style={{ display:"flex", alignItems:"center", gap:"3px", background: taxAmt > 0 ? "#fefce8" : "#f8fafc", border:`1px solid ${taxAmt > 0 ? "#fde68a" : BORDER}`, borderRadius:"4px", padding:"6px 8px" }}>
                      <span style={{ fontSize:"11px", color:"#94a3b8", fontWeight:700 }}>₹</span>
                      <span style={{ fontSize:"12px", fontWeight:700, color: taxAmt > 0 ? "#92400e" : "#94a3b8", fontVariantNumeric:"tabular-nums" }}>
                        {taxAmt > 0 ? taxAmt.toFixed(2) : "0"}
                      </span>
                      {row.taxPercentage > 0 && (
                        <span style={{ fontSize:"9px", fontWeight:800, color:"#92400e", marginLeft:"2px", background:"#fde68a", borderRadius:"3px", padding:"0 3px" }}>{row.taxPercentage}%</span>
                      )}
                    </div>

                    {/* Final Value — read only */}
                    <div style={{ display:"flex", alignItems:"center", gap:"3px", background: finalValue > 0 ? "#f0fdf4" : "#f8fafc", border:`1px solid ${finalValue > 0 ? "#86efac" : BORDER}`, borderRadius:"4px", padding:"6px 8px" }}>
                      <span style={{ fontSize:"11px", color:"#94a3b8", fontWeight:700 }}>₹</span>
                      <span style={{ fontSize:"12px", fontWeight:800, color: finalValue > 0 ? "#15803d" : "#94a3b8", fontVariantNumeric:"tabular-nums" }}>
                        {finalValue > 0 ? finalValue.toFixed(2) : "0"}
                      </span>
                    </div>

                    {/* Remove */}
                    <button type="button" onClick={() => removeRow(row.id)}
                      style={{ width:28, height:28, borderRadius:"4px", border:`1px solid ${BORDER}`, background:"#fff", color:"#cbd5e1", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#fff1f2"; e.currentTarget.style.borderColor="#fecdd3"; e.currentTarget.style.color="#f43f5e"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor=BORDER; e.currentTarget.style.color="#cbd5e1"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                );
              })}

              <button type="button" className="acm-addrow" onClick={addRow}
                style={{ width:"100%", padding:"8px", border:`1.5px dashed ${BORDER}`, borderRadius:"4px", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px", fontSize:"11px", fontWeight:800, letterSpacing:"0.06em", textTransform:"uppercase", color:"#94a3b8", cursor:"pointer", fontFamily:"'Nunito Sans',sans-serif", transition:"all 0.15s", marginTop:"2px" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Charge
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", background:"#f8fafc", borderTop:`1px solid ${BORDER}` }}>
            <span style={{ fontSize:"11px", fontWeight:800, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>
              {rows.filter(r => r.chargeId && r.value).length} / {rows.length} configured
            </span>
            <div style={{ display:"flex", gap:"10px" }}>
              <button type="button" className="acm-cancel" onClick={onClose}
                style={{ padding:"7px 18px", fontSize:"12px", fontWeight:800, letterSpacing:"0.04em", color:NAV, background:"#fff", border:`1.5px solid ${BORDER}`, borderRadius:"4px", cursor:"pointer", fontFamily:"'Nunito Sans',sans-serif", transition:"background 0.15s" }}
              >CANCEL</button>
              <button type="button" className="acm-save" onClick={handleSave}
                style={{ padding:"7px 22px", fontSize:"12px", fontWeight:800, letterSpacing:"0.05em", color:"#fff", background:PINK, border:"none", borderRadius:"4px", cursor:"pointer", fontFamily:"'Nunito Sans',sans-serif", display:"flex", alignItems:"center", gap:"6px", transition:"background 0.15s, transform 0.1s" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                SAVE
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}