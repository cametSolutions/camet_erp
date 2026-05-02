import { useState } from "react";

const CHARGES = [
  "Transportation", "Laundry", "Room Service", "Minibar",
  "Parking", "Spa", "Airport Transfer", "Breakfast",
  "Loyalty Discount", "Promo Code", "Early Checkout", "Staff Discount"
];

export default function AdditionalChargesModal({ isOpen, onClose, onSave ,additionalChargeData , formData , setFormData}) {
  const [rows, setRows] = useState([
    { id: 1, charge: "", operation: "add", amountType: "flat", value: "" }
  ]);

  

  const addRow = () =>
    setRows(r => [...r, { id: Date.now(), charge: "", operation: "add", amountType: "flat", value: "" }]);

  const removeRow = (id) => setRows(r => r.filter(x => x.id !== id));

  const update = (id, field, val) =>
    setRows(r => r.map(x => x.id === id ? { ...x, [field]: val } : x));

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0f172a] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Additional Charges</p>
              <p className="text-[11px] text-gray-400">Add extra fees or subtract discounts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Column Labels */}
        <div className="grid grid-cols-12 gap-3 px-6 pt-4 pb-1">
          <p className="col-span-4 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Charge type</p>
          <p className="col-span-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Operation</p>
          <p className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Value as</p>
          <p className="col-span-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Amount</p>
          <p className="col-span-1"></p>
        </div>

        {/* Rows */}
        <div className="px-6 pb-4 space-y-3 mt-1 max-h-72 overflow-y-auto">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`grid grid-cols-12 gap-3 items-center p-3 rounded-xl border transition-all duration-150 ${
                row.operation === "add"
                  ? "bg-slate-50 border-slate-200"
                  : "bg-green-50 border-green-200"
              }`}
            >
              {/* Charge dropdown */}
              <div className="col-span-4">
                <select
                  value={row.charge}
                  onChange={(e) => update(row.id, "charge", e.target.value)}
                  className="w-full text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                >
                  <option value="">Select charge</option>
                  {additionalChargeData.map(c => <option key={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Add / Subtract toggle */}
              <div className="col-span-3">
                <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => update(row.id, "operation", "add")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold transition-all duration-150 ${
                      row.operation === "add"
                        ? "bg-[#0f172a] text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => update(row.id, "operation", "subtract")}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 text-xs font-semibold transition-all duration-150 ${
                      row.operation === "subtract"
                        ? "bg-green-600 text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Subtract
                  </button>
                </div>
              </div>

              {/* Flat / % toggle */}
              <div className="col-span-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() => update(row.id, "amountType", "flat")}
                    className={`flex-1 py-2 text-xs font-semibold transition-all duration-150 ${
                      row.amountType === "flat"
                        ? "bg-[#0f172a] text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    ₹
                  </button>
                  <button
                    type="button"
                    onClick={() => update(row.id, "amountType", "percent")}
                    className={`flex-1 py-2 text-xs font-semibold transition-all duration-150 ${
                      row.amountType === "percent"
                        ? "bg-[#0f172a] text-white"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div className="col-span-2">
                <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 gap-1 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition-all">
                  <span className="text-xs text-gray-400 font-medium">
                    {row.amountType === "flat" ? "₹" : "%"}
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={row.value}
                    onChange={(e) => update(row.id, "value", e.target.value)}
                    className="w-full text-sm font-medium text-gray-700 bg-transparent outline-none"
                  />
                </div>
              </div>

              {/* Remove */}
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Add row button */}
          <button
            type="button"
            onClick={addRow}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-gray-300 text-xs font-semibold text-gray-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add another charge
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0f172a]">
          <span className="text-xs text-slate-400 font-medium">
            {rows.length} charge{rows.length !== 1 ? "s" : ""} added
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(rows)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold active:scale-95 transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              Save charges
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}