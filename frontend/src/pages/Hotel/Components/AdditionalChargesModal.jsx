import { useState } from "react";
import { calculateOtherCharges } from "../Helper/hotelHelper.js";
import { taxCalculator } from "../Helper/taxCalculator.js";
import { toast } from "sonner";
export default function AdditionalChargesModal({
  isOpen,
  onClose,
  onSave,
  additionalChargeData = [],
  formData = {},
  discountBasedOnGrossAmount = true,
}) {
  const [rows, setRows] = useState([
    {
      _id: additionalChargeData[0]?._id || 1,
      option: additionalChargeData[0]?.name || "",
      value: 0,
      action: "sub",
      taxPercentage: additionalChargeData[0]?.taxPercentage || 0,
      taxAmt: 0,
      hsn: additionalChargeData[0]?.hsn || "",
      finalValue: 0,
      amountType: "percentage",
    },
  ]);

  const addRow = () => {
    if(rows.length >= 1){
      let lastRow = rows[rows.length - 1];
      if(lastRow.option === "" || lastRow.value === "" || lastRow.action === "" || lastRow.taxPercentage === "" || lastRow.taxAmt === "" || lastRow.hsn === "" || lastRow.finalValue === "") {
        toast.error("Please fill all the fields in the last row before adding a new row.");
        return;
      }
    }
    setRows((prev) => [
      ...prev,
      {
        _id: 1,
        option:  "",
        value: 0,
        action: "sub",
        taxPercentage:  0,
        taxAmt: 0,
        hsn:  "",
        finalValue: 0,
        amountType: "percentage",
      },
    ]);
  };

  const removeRow = (id) => {
    setRows((prev) => prev.filter((row) => row._id !== id));
  };
  const update = async (id, field, val) => {
    console.log(field, val);
    if (field == "value" || field == "charge" || field == "amountType") {
      let additionalCharge = {};
      let specificRow = rows.find((row) => row._id === id) || {};
      console.log(specificRow);
      if (field == "charge") {
        additionalCharge = additionalChargeData.find((row) => row._id == val);
        if (!additionalCharge) {
          toast.error("Please select a valid additional charge");
          return;
        }
        specificRow._id = val;
        specificRow.option = additionalCharge.name;
        specificRow.taxPercentage = additionalCharge.taxPercentage;
        specificRow.hsn = additionalCharge.hsn;
      } else if (field == "value") {
        specificRow.value = val;
      } else if(field == "amountType") {
        specificRow.amountType = val;
      }
      let discountData = await calculateOtherCharges({
        total: formData?.grandTotal || 0,
        inputValue: specificRow?.value || 0,
        inputType: specificRow?.amountType,
        taxPercentage: specificRow?.taxPercentage || 0,
        discountBasedOnGrossAmount,
        formData,
      });
      specificRow.taxAmt = discountData.taxAmt;
      specificRow.finalValue = discountData.finalValue;
      setRows((prev) =>
        prev.map((row) => (row._id === id ? { ...specificRow } : row)),
      );
    } else {
      setRows((prev) =>
        prev.map((row) => (row._id === id ? { ...row, [field]: val } : row)),
      );
    }
  };

  const totalCharges = rows
    .filter((r) => r.action === "add" && r.finalValue)
    .reduce((a, r) => a + parseFloat(r.finalValue || 0), 0);

  const totalDiscount = rows
    .filter((r) => r.action === "sub" && r.finalValue)
    .reduce((a, r) => a + parseFloat(r.finalValue || 0), 0);

  const balanceAmount = (formData?.grandTotal + totalCharges )  - totalDiscount;

    console.log(totalCharges);
    console.log(totalDiscount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl overflow-hidden rounded-md bg-white shadow-[0_20px_60px_rgba(15,26,46,0.3),0_0_0_1px_rgba(15,26,46,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/30 text-white">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </div>
            <span className="text-[15px] font-extrabold tracking-[0.01em] text-white">
              Other Charges
            </span>
          </div>
          {formData?.grandTotal > 0 && (
            <div className="text-right">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                Grand Total
              </p>
              <p className="m-0 text-[13px] font-extrabold text-blue-500 text-center">
                {formData?.grandTotal.toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {totalCharges > 0 && (
              <div className="text-right">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                  Charges
                </p>
                <p className="m-0 text-[13px] font-extrabold text-pink-500 text-center">
                  +₹{totalCharges.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {totalDiscount > 0 && (
              <div className="text-right">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                  Discount
                </p>
                <p className="m-0 text-[13px] font-extrabold text-green-400 text-center">
                  −₹{totalDiscount.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="flex h-[30px] w-[30px] items-center justify-center rounded bg-white/10 text-white/50 transition hover:bg-white/15"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* COLUMN LABELS */}
        <div className="grid grid-cols-[1fr_152px_88px_120px_120px_36px] gap-2.5 border-b border-slate-200 bg-slate-50 px-5 py-2.5">
          {["Charge Type", "Operation", "Value As", "Value", "Amount", ""].map(
            (label, i) => (
              <p
                key={i}
                className="m-0 text-[11px] font-extrabold uppercase tracking-[0.08em] text-gray-700"
              >
                {label}
              </p>
            ),
          )}
        </div>

        {/* ROWS */}
        <div className="max-h-[280px] overflow-y-auto bg-white px-5 py-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const isSub = row.action === "sub";

              return (
                <div
                  key={row._id}
                  className={`grid grid-cols-[1fr_152px_88px_120px_120px_36px] items-center gap-2.5 rounded border px-3 py-2.5 transition ${
                    isSub
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* Charge Type */}
                  <select
                    value={row._id}
                    onChange={(e) => update(row._id, "charge", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-[7px] text-[13px] font-semibold text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="">Select charge</option>
                    {additionalChargeData.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}{" "}
                        {c.taxPercentage > 0 && `(${c.taxPercentage}%)`}
                      </option>
                    ))}
                  </select>

                  {/* Operation */}
                  <div className="flex overflow-hidden rounded border border-slate-200">
                    {[
                      { val: "add", label: "ADD" },
                      { val: "sub", label: "SUB" },
                    ].map(({ val, label }) => {
                      const active = row.action === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => update(row._id, "action", val)}
                          className={`flex-1 px-1 py-[7px] text-[11px] font-extrabold tracking-[0.05em] transition ${
                            active
                              ? val === "add"
                                ? "bg-slate-900 text-white"
                                : "bg-green-700 text-white"
                              : "bg-white text-slate-400"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Amount Type */}
                  <div className="flex overflow-hidden rounded border border-slate-200">
                    {[
                      { val: "flat", label: "₹" },
                      { val: "percentage", label: "%" },
                    ].map(({ val, label }) => {
                      const active = row.amountType === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => update(row._id, "amountType", val)}
                          className={`flex-1 py-[7px] text-[13px] font-extrabold transition ${
                            active
                              ? "bg-slate-900 text-white"
                              : "bg-white text-slate-400"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Value */}
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-[7px] focus-within:border-slate-900">
                    <span className="shrink-0 text-[12px] font-bold text-slate-400">
                      {row.amountType === "flat" ? "₹" : "%"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={row.value}
                      onChange={(e) => update(row._id, "value", e.target.value)}
                      className="w-full border-none bg-transparent text-[13px] font-bold text-slate-900 outline-none [font-variant-numeric:tabular-nums] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Amount */}
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-[7px] focus-within:border-slate-900">
                    <span className="shrink-0 text-[12px] font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      readOnly
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={row.finalValue}
                      className="w-full border-none bg-transparent text-[13px] font-bold text-slate-900 outline-none [font-variant-numeric:tabular-nums] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => removeRow(row._id)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-300 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addRow}
              className="mt-0.5 flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-slate-200 bg-transparent px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-slate-400 transition hover:border-slate-900 hover:text-slate-900"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Charge
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-green-600">
            Balance Amount : {balanceAmount}
          </span>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-200 bg-white px-5 py-2 text-[13px] font-extrabold tracking-[0.04em] text-slate-900 transition hover:bg-slate-100"
            >
              CANCEL
            </button>

            <button
              type="button"
              onClick={() => onSave(rows)}
              className="flex items-center gap-1.5 rounded bg-pink-600 px-6 py-2 text-[13px] font-extrabold tracking-[0.05em] text-white transition hover:bg-pink-700 active:scale-[0.97]"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
