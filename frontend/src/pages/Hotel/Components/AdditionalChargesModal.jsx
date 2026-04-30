import { useEffect, useState } from "react";
import { calculateOtherCharges } from "../Helper/hotelHelper.js";
import { toast } from "sonner";

const createRow = (charge = {}) => ({
  rowId: Date.now() + Math.random(),
  _id: charge?._id || "",
  option: charge?.name || "",
  value: "",
  action: "sub",
  taxPercentage: charge?.taxPercentage || 0,
  taxAmt: 0,
  hsn: charge?.hsn || "",
  finalValue: 0,
  amountType: "percentage",
  includeTax: true, // NEW: tax included by default
});

export default function AdditionalChargesModal({
  isOpen,
  onClose,
  onSave,
  additionalChargeData = [],
  formData = {},
  discountBasedOnGrossAmount = true,
  selectedForRoom = false,
  selectedRoomId,
}) {
  const [rows, setRows] = useState(
    formData?.otherChargeDetails.length > 0
      ? formData?.otherChargeDetails
      : [createRow(additionalChargeData?.[0] || {})],
  );

  const [forAllRooms, setForAllRooms] = useState(false);

  useEffect(() => {
    if (!selectedForRoom || !selectedRoomId) return;

    const selectedRoom = formData?.selectedRooms?.find(
      (item) => item.roomId === selectedRoomId,
    );

    if (
      selectedRoom &&
      Array.isArray(selectedRoom.otherChargeDetails) &&
      selectedRoom.otherChargeDetails.length > 0
    ) {
      setRows(selectedRoom.otherChargeDetails);
    }
  }, [selectedForRoom, selectedRoomId, formData?.selectedRooms]);

  const selectedRoomDetails = selectedForRoom
    ? formData?.selectedRooms?.find((room) => room.roomId === selectedRoomId)
    : null;

  const grandTotal = selectedRoomDetails
    ? selectedRoomDetails?.amountWithOutTax
    : formData?.grandTotal
      ? formData?.grandTotal
      : 0;

  const recalculateRow = async (row) => {
    const discountData = await calculateOtherCharges({
      total: Number(grandTotal || 0),
      inputValue: Number(row?.value || 0),
      inputType: row?.amountType,
      taxPercentage: Number(row?.taxPercentage || 0),
      discountBasedOnGrossAmount,
      formData,
    });

    let taxAmt = Number(discountData?.taxAmt || 0);
    let finalValue = Number(discountData?.finalValue || 0);

    // NEW: if tax is NOT included, calculate tax on top of finalValue and add it
    if (!row.includeTax && Number(row.taxPercentage || 0) > 0) {
      const extraTax = (finalValue * Number(row.taxPercentage)) / 100;
      taxAmt = extraTax;
      finalValue = finalValue + extraTax;
    }

    return {
      ...row,
      taxAmt,
      finalValue,
    };
  };

  const addRow = () => {
    if (rows.length >= 1) {
      const lastRow = rows[rows.length - 1];
      if (!lastRow._id || Number(lastRow.value) <= 0) {
        toast.error(
          "Please fill the charge and value in the last row before adding a new row.",
        );
        return;
      }
    }
    setRows((prev) => [...prev, createRow()]);
  };

  const removeRow = (rowId) => {
    setRows((prev) => prev.filter((row) => row.rowId !== rowId));
  };

  const update = async (rowId, field, val) => {
    const currentRow = rows.find((row) => row.rowId === rowId);
    if (!currentRow) return;

    let updatedRow = { ...currentRow };

    if (field === "charge") {
      const additionalCharge = additionalChargeData.find(
        (item) => String(item._id) === String(val),
      );
      if (!additionalCharge) {
        toast.error("Please select a valid additional charge");
        return;
      }
      updatedRow = {
        ...updatedRow,
        _id: additionalCharge._id,
        option: additionalCharge.name,
        taxPercentage: Number(additionalCharge.taxPercentage || 0),
        hsn: additionalCharge.hsn || "",
      };
      updatedRow = await recalculateRow(updatedRow);
    } else if (field === "value") {
      updatedRow = { ...updatedRow, value: val };
      updatedRow = await recalculateRow(updatedRow);
    } else if (field === "amountType") {
      updatedRow = { ...updatedRow, amountType: val };
      updatedRow = await recalculateRow(updatedRow);
    } else if (field === "includeTax") {
      // NEW: toggle tax inclusion and recalculate
      updatedRow = { ...updatedRow, includeTax: val };
      updatedRow = await recalculateRow(updatedRow);
    } else {
      updatedRow = { ...updatedRow, [field]: val };
    }

    setRows((prev) =>
      prev.map((row) => (row.rowId === rowId ? updatedRow : row)),
    );
  };

  const totalCharges = rows
    .filter((r) => r.action === "add" && Number(r.finalValue) > 0)
    .reduce((a, r) => a + Number(r.finalValue || 0), 0);

  const totalDiscount = rows
    .filter((r) => r.action === "sub" && Number(r.finalValue) > 0)
    .reduce((a, r) => a + Number(r.finalValue || 0), 0);

  const balanceAmount = Number(grandTotal || 0) + totalCharges - totalDiscount;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl overflow-hidden rounded-md bg-white shadow-[0_20px_60px_rgba(15,26,46,0.3),0_0_0_1px_rgba(15,26,46,0.1)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3.5">
          {selectedForRoom && selectedRoomId ? (
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-2 transition-all duration-200 hover:border-blue-500 hover:bg-blue-50">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-400 text-blue-600 focus:ring-2 focus:ring-blue-400"
                value={forAllRooms}
                onChange={(e) => setForAllRooms(e.target.checked)}
              />
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-slate-700">
                  For All Rooms
                </span>
              </div>
            </label>
          ) : (
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
          )}

          {Number(grandTotal || 0) > 0 && (
            <div className="text-right">
              <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                Grand Total
              </p>
              <p className="m-0 text-center text-[13px] font-extrabold text-blue-500">
                {Number(grandTotal || 0).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            {totalCharges > 0 && (
              <div className="text-right">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                  Charges
                </p>
                <p className="m-0 text-center text-[13px] font-extrabold text-pink-500">
                  +₹{totalCharges.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {totalDiscount > 0 && (
              <div className="text-right">
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">
                  Discount
                </p>
                <p className="m-0 text-center text-[13px] font-extrabold text-green-400">
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

        {/* Column Headers — added "Tax" column */}
        <div className="grid grid-cols-[1fr_152px_88px_110px_100px_110px_36px] gap-2.5 border-b border-slate-200 bg-slate-50 px-5 py-2.5">
          {["Charge Type", "Operation", "Value As", "Value", "Tax", "Amount", ""].map(
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

        {/* Rows */}
        <div className="max-h-[280px] overflow-y-auto bg-white px-5 py-3 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1">
          <div className="flex flex-col gap-2">
            {rows.map((row) => {
              const isSub = row.action === "sub";
              const hasTax = Number(row.taxPercentage || 0) > 0;

              return (
                <div
                  key={row.rowId}
                  className={`grid grid-cols-[1fr_152px_88px_110px_100px_110px_36px] items-center gap-2.5 rounded border px-3 py-2.5 transition ${
                    isSub
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  {/* Charge Type */}
                  <select
                    value={row._id}
                    onChange={(e) => update(row.rowId, "charge", e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2.5 py-[7px] text-[13px] font-semibold text-slate-900 outline-none transition focus:border-slate-900"
                  >
                    <option value="">Select charge</option>
                    {additionalChargeData.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}{" "}
                        {Number(c.taxPercentage) > 0
                          ? `(${c.taxPercentage}%)`
                          : ""}
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
                          onClick={() => update(row.rowId, "action", val)}
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

                  {/* Value As */}
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
                          onClick={() => update(row.rowId, "amountType", val)}
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

                  {/* Value Input */}
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-[7px] focus-within:border-slate-900">
                    <span className="shrink-0 text-[12px] font-bold text-slate-400">
                      {row.amountType === "flat" ? "₹" : "%"}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={row.value}
                      onChange={(e) => update(row.rowId, "value", e.target.value)}
                      className="w-full border-none bg-transparent text-[13px] font-bold text-slate-900 outline-none [font-variant-numeric:tabular-nums] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>

                  {/* NEW: Include Tax Toggle */}
                  {hasTax ? (
                    <div className="flex overflow-hidden rounded border border-slate-200">
                      {[
                        { val: true, label: "INC" },
                        { val: false, label: "EXC" },
                      ].map(({ val, label }) => {
                        const active = row.includeTax === val;
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => update(row.rowId, "includeTax", val)}
                            className={`flex-1 py-[7px] text-[11px] font-extrabold tracking-[0.04em] transition ${
                              active
                                ? val === true
                                  ? "bg-amber-500 text-white"
                                  : "bg-blue-600 text-white"
                                : "bg-white text-slate-400"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // No tax on this charge — show a muted placeholder
                    <div className="flex items-center justify-center rounded border border-dashed border-slate-200 py-[7px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        No Tax
                      </span>
                    </div>
                  )}

                  {/* Final Amount (read-only) */}
                  <div className="flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-[7px]">
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

                  {/* Remove Row */}
                  <button
                    type="button"
                    onClick={() => removeRow(row.rowId)}
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

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.07em] text-green-600">
            Balance Amount : {balanceAmount.toLocaleString("en-IN")}
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
              onClick={() => {
                for (let row of rows) {
                  if (!row._id || !row.value || Number(row.value) <= 0) {
                    toast.error("Please complete all rows before saving");
                    return;
                  }
                }
                onSave(rows, selectedForRoom, forAllRooms);
              }}
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