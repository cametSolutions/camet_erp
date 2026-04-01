import React, { useState } from "react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = {
  section: {
    background: "#ffffff",
    border: "0.5px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
    marginBottom: "14px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 16px",
    background: "#1e293b",
  },
  headerTitle: {
    fontSize: "12px",
    fontWeight: 500,
    color: "#ffffff",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  btnAdd: {
    background: "#22c55e",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "5px 13px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "13px",
  },
  thead: { background: "#f8fafc" },
  th: {
    padding: "9px 14px",
    fontSize: "11px",
    fontWeight: 500,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "0.5px solid #e2e8f0",
    textAlign: "left",
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  thRight: { textAlign: "right" },
  thCenter: { textAlign: "center" },
  td: {
    padding: "10px 14px",
    borderBottom: "0.5px solid #f1f5f9",
    color: "#0f172a",
    verticalAlign: "middle",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tdRight: { textAlign: "right" },
  tdCenter: { textAlign: "center" },
  tdSub: {
    display: "block",
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "2px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  tdGreen: { color: "#16a34a", fontWeight: 500 },
  tdRed: { color: "#dc2626" },
  footRow: { background: "#f8fafc" },
  footTd: {
    padding: "9px 14px",
    fontSize: "12px",
    fontWeight: 500,
    color: "#64748b",
    borderBottom: "none",
  },
  badgeOk: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: 500,
    background: "#dcfce7",
    color: "#15803d",
    whiteSpace: "nowrap",
  },
  badgePend: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: 500,
    background: "#fef9c3",
    color: "#a16207",
    whiteSpace: "nowrap",
  },
  acts: { display: "flex", gap: "5px", justifyContent: "center" },
  btnEdit: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "none",
    borderRadius: "5px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: 500,
    cursor: "pointer",
  },
  btnDel: {
    background: "#fff1f2",
    color: "#be123c",
    border: "none",
    borderRadius: "5px",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: 500,
    cursor: "pointer",
  },
  emptyTd: {
    textAlign: "center",
    padding: "24px",
    color: "#94a3b8",
    fontSize: "13px",
  },
};

const inputStyle = {
  width: "100%",
  border: "0.5px solid #cbd5e1",
  borderRadius: "7px",
  padding: "8px 10px",
  fontSize: "13px",
  color: "#0f172a",
  background: "#ffffff",
  boxSizing: "border-box",
};

// ─── Reusable Modal ───────────────────────────────────────────────────────────
const Modal = ({ title, children, onCancel, onSave, saveLabel }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
    zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: "#ffffff", borderRadius: "12px", border: "0.5px solid #e2e8f0",
      padding: "24px", width: "100%", maxWidth: "380px", margin: "0 16px",
    }}>
      <p style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 500, color: "#0f172a" }}>
        {title}
      </p>
      {children}
      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "16px" }}>
        <button onClick={onCancel} style={{
          background: "transparent", color: "#64748b",
          border: "0.5px solid #e2e8f0", borderRadius: "7px",
          padding: "8px 16px", fontSize: "13px", cursor: "pointer",
        }}>
          Cancel
        </button>
        <button onClick={onSave} style={{
          background: "#1e293b", color: "#fff", border: "none",
          borderRadius: "7px", padding: "8px 18px",
          fontSize: "13px", fontWeight: 500, cursor: "pointer",
        }}>
          {saveLabel}
        </button>
      </div>
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom: "12px" }}>
    <label style={{
      display: "block", fontSize: "11px", fontWeight: 500,
      color: "#64748b", textTransform: "uppercase",
      letterSpacing: "0.04em", marginBottom: "4px",
    }}>
      {label}
    </label>
    {children}
  </div>
);

// ─── Advance Receipt ──────────────────────────────────────────────────────────
const defaultAdv = { date: "", no: "", mode: "Cash", amount: "", status: "Received" };

const AdvanceTable = ({ data, onChange }) => {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultAdv);

  const openAdd  = () => { setForm(defaultAdv); setEditId(null); setModal(true); };
  const openEdit = (r)  => { setForm({ ...r });  setEditId(r.id); setModal(true); };
  const close    = ()   => setModal(false);

  const save = () => {
    if (!form.date || !form.amount) return;
    const parsed = { ...form, amount: parseFloat(form.amount) };
    if (editId !== null) {
      onChange(data.map((r) => (r.id === editId ? { ...parsed, id: editId } : r)));
    } else {
      const newId = data.length ? Math.max(...data.map((r) => r.id)) + 1 : 1;
      onChange([...data, { ...parsed, id: newId }]);
    }
    close();
  };

  const del   = (id) => onChange(data.filter((r) => r.id !== id));
  const total = data.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <div style={css.section}>
        <div style={css.header}>
          <span style={css.headerTitle}>Advance Receipt</span>
          <button style={css.btnAdd} onClick={openAdd}>+ Add</button>
        </div>

        <table style={css.table}>
          <thead style={css.thead}>
            <tr>
              <th style={{ ...css.th, width: "40%" }}>Date / Receipt</th>
              <th style={{ ...css.th, ...css.thRight, width: "22%" }}>Amount</th>
              <th style={{ ...css.th, ...css.thCenter, width: "20%" }}>Status</th>
              <th style={{ ...css.th, ...css.thCenter, width: "18%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={4} style={css.emptyTd}>No advance receipts yet</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id}>
                  <td style={css.td}>
                    <span style={{ fontWeight: 500 }}>{r.date}</span>
                    <span style={css.tdSub}>{r.no} · {r.mode}</span>
                  </td>
                  <td style={{ ...css.td, ...css.tdRight, ...css.tdGreen }}>
                    ₹{Number(r.amount).toFixed(2)}
                  </td>
                  <td style={{ ...css.td, ...css.tdCenter }}>
                    <span style={r.status === "Received" ? css.badgeOk : css.badgePend}>
                      {r.status}
                    </span>
                  </td>
                  <td style={{ ...css.td, ...css.tdCenter }}>
                    <div style={css.acts}>
                      <button style={css.btnEdit} onClick={() => openEdit(r)}>Edit</button>
                      <button style={css.btnDel}  onClick={() => del(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {data.length > 0 && (
              <tr style={css.footRow}>
                <td style={{ ...css.footTd, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Advance
                </td>
                <td style={{ ...css.footTd, ...css.tdRight, color: "#16a34a" }}>
                  ₹{total.toFixed(2)}
                </td>
                <td colSpan={2} style={css.footTd} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={editId !== null ? "Edit Advance Receipt" : "Add Advance Receipt"}
          onCancel={close} onSave={save}
          saveLabel={editId !== null ? "Update" : "Add"}
        >
          <Field label="Date">
            <input type="date" style={inputStyle} value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Receipt No.">
            <input type="text" style={inputStyle} placeholder="ADV-001" value={form.no}
              onChange={(e) => setForm({ ...form, no: e.target.value })} />
          </Field>
          <Field label="Payment Mode">
            <select style={inputStyle} value={form.mode}
              onChange={(e) => setForm({ ...form, mode: e.target.value })}>
              {["Cash", "UPI", "Card", "Bank Transfer"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="Amount (₹)">
            <input type="number" style={inputStyle} placeholder="0.00" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Status">
            <select style={inputStyle} value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Received</option>
              <option>Pending</option>
            </select>
          </Field>
        </Modal>
      )}
    </>
  );
};

// ─── Other Charges ────────────────────────────────────────────────────────────
const defaultChr = { ledger: "", desc: "", date: "", amount: "" };

const ChargesTable = ({ data, onChange }) => {
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultChr);

  const openAdd  = () => { setForm(defaultChr); setEditId(null); setModal(true); };
  const openEdit = (r)  => { setForm({ ...r });  setEditId(r.id); setModal(true); };
  const close    = ()   => setModal(false);

  const save = () => {
    if (!form.ledger || !form.amount) return;
    const parsed = { ...form, amount: parseFloat(form.amount) };
    if (editId !== null) {
      onChange(data.map((r) => (r.id === editId ? { ...parsed, id: editId } : r)));
    } else {
      const newId = data.length ? Math.max(...data.map((r) => r.id)) + 1 : 1;
      onChange([...data, { ...parsed, id: newId }]);
    }
    close();
  };

  const del   = (id) => onChange(data.filter((r) => r.id !== id));
  const total = data.reduce((s, r) => s + Number(r.amount), 0);

  return (
    <>
      <div style={css.section}>
        <div style={css.header}>
          <span style={css.headerTitle}>Other / Additional Charges</span>
          <button style={css.btnAdd} onClick={openAdd}>+ Add</button>
        </div>

        <table style={css.table}>
          <thead style={css.thead}>
            <tr>
              <th style={{ ...css.th, width: "46%" }}>Ledger / Description</th>
              <th style={{ ...css.th, ...css.thRight, width: "22%" }}>Amount</th>
              <th style={{ ...css.th, ...css.thCenter, width: "32%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={3} style={css.emptyTd}>No charges added yet</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id}>
                  <td style={css.td}>
                    <span style={{ fontWeight: 500 }}>{r.ledger}</span>
                    {(r.desc || r.date) && (
                      <span style={css.tdSub}>
                        {[r.desc, r.date].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </td>
                  <td style={{ ...css.td, ...css.tdRight, ...css.tdRed }}>
                    ₹{Number(r.amount).toFixed(2)}
                  </td>
                  <td style={{ ...css.td, ...css.tdCenter }}>
                    <div style={css.acts}>
                      <button style={css.btnEdit} onClick={() => openEdit(r)}>Edit</button>
                      <button style={css.btnDel}  onClick={() => del(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {data.length > 0 && (
              <tr style={css.footRow}>
                <td style={{ ...css.footTd, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Total Charges
                </td>
                <td style={{ ...css.footTd, ...css.tdRight, color: "#dc2626" }}>
                  ₹{total.toFixed(2)}
                </td>
                <td style={css.footTd} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal
          title={editId !== null ? "Edit Charge" : "Add Charge"}
          onCancel={close} onSave={save}
          saveLabel={editId !== null ? "Update" : "Add"}
        >
          <Field label="Ledger Name">
            <input type="text" style={inputStyle} placeholder="e.g. Laundry" value={form.ledger}
              onChange={(e) => setForm({ ...form, ledger: e.target.value })} />
          </Field>
          <Field label="Description">
            <input type="text" style={inputStyle} placeholder="Details..." value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })} />
          </Field>
          <Field label="Date">
            <input type="date" style={inputStyle} value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Amount (₹)">
            <input type="number" style={inputStyle} placeholder="0.00" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
        </Modal>
      )}
    </>
  );
};

// ─── Main Export ──────────────────────────────────────────────────────────────
//
// In your booking page parent component add:
//   const [advances, setAdvances] = useState([]);
//   const [charges,  setCharges]  = useState([]);
//
// Then in your JSX right column:
//   <BookingSummaryTables
//     advanceReceipts={advances}  onAdvanceChange={setAdvances}
//     otherCharges={charges}      onChargesChange={setCharges}
//   />

const BookingSummaryTables = ({
  advanceReceipts = [],
  onAdvanceChange = () => {},
  otherCharges    = [],
  onChargesChange = () => {},
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
    <AdvanceTable data={advanceReceipts} onChange={onAdvanceChange} />
    <ChargesTable data={otherCharges}    onChange={onChargesChange} />
  </div>
);

export default BookingSummaryTables;