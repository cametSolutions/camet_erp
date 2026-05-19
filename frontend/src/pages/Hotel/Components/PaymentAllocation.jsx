import { useState, useEffect, useMemo } from "react";
import api from "@/api/api";
import { useSelector } from "react-redux";

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n ?? 0);

export default function PaymentAllocation({
  isOpen = true,
  onClose = () => {},
  onConfirm = () => {},
  selectedCheckIns = [],
  cmp_id,
  applicableAmount,
  otherCharges,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [saleData, setSaleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOtherCharge, setSelectedOtherCharge] = useState({});
  // Stores one discount entry per sale: { saleId, saleNumber, finalValue, ... }
  const [restaurantSaleWiseTaggedOtherCharges, setRestaurantSaleWiseTaggedOtherCharges] = useState([]);

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );

  const discountBasedOnGrossAmount =
    org?.configurations?.[0]?.discountBasedOnGrossAmount ?? false;

  // Find the DISCOUNT charge head from otherCharges
  useEffect(() => {
    if (otherCharges?.length > 0) {
      const discountHead = otherCharges.find(
        (item) => item?.name?.toUpperCase().trim() === "DISCOUNT",
      );
      if (discountHead) {
        setSelectedOtherCharge(discountHead);
      }
    }
  }, [otherCharges]);

  const handleFetch = async () => {
    try {
      setLoading(true);
      const checkInNumbers = selectedCheckIns
        .filter((item) => item?.voucherNumber)
        .map((item) => item.voucherNumber);

      const response = await api.get(
        `/api/sUsers/getRestaurantSales/${cmp_id}`,
        {
          params: { checkInNumbers, cmp_id },
          withCredentials: true,
        },
      );
      setSaleData(response.data?.data ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCheckIns?.length > 0) {
      handleFetch();
    }
  }, [selectedCheckIns]);

  // Normalize: support both _id (Mongo) and id (mapped). Prefer _id.
  const getSaleId = (sale) => sale?._id ?? sale?.id ?? null;

  const selectedItem = useMemo(
    () => saleData.find((i) => getSaleId(i) === selectedId) ?? null,
    [saleData, selectedId],
  );

  // ── Helper: get discount finalValue for a specific sale ──────────────────
  const getDiscountForSale = (sale) => {
    const saleMongoId = getSaleId(sale);
    const entry = restaurantSaleWiseTaggedOtherCharges.find(
      (item) => item?.saleId === saleMongoId,
    );
    return Number(entry?.finalValue || 0);
  };

  // ── Per-row net (used in table AND summary) ──────────────────────────────
  const getNetForSale = (sale) =>
    +(sale.subTotal - getDiscountForSale(sale)).toFixed(2);

  // ── Summary values for the SELECTED row only ─────────────────────────────
  const selectedDiscount = selectedItem
    ? getDiscountForSale(selectedItem)
    : 0;

  const netPayable = selectedItem
    ? getNetForSale(selectedItem)
    : 0;

  const balance = +(applicableAmount - netPayable).toFixed(2);

  // ── Footer totals (all rows) ─────────────────────────────────────────────
  const totalRaw = (saleData || []).reduce((s, i) => s + (i.subTotal ?? 0), 0);
  const totalDiscount = restaurantSaleWiseTaggedOtherCharges.reduce(
    (acc, item) => acc + Number(item?.finalValue || 0),
    0,
  );
  const totalNet = +(totalRaw - totalDiscount).toFixed(2);

  const canConfirm = !!selectedItem && balance >= 0;

  const handleRowClick = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
    setDiscountValue("");
  };

  const handleDiscountInput = (value, selectedDataForPayment) => {
    const inputAmount = Number(value) || 0;
    const flatItems = selectedDataForPayment?.items || [];

    let calculatedDiscount = inputAmount; // default: flat amount

    if (discountType === "percentage") {
      const baseAmount = flatItems.reduce(
        (acc, item) => acc + Number(item?.total || 0),
        0,
      );
      calculatedDiscount = +((baseAmount * inputAmount) / 100).toFixed(2);
    }

    const taxAmount =
      (Number(calculatedDiscount) *
        Number(selectedOtherCharge?.taxPercentage || 0)) /
      100;

    setRestaurantSaleWiseTaggedOtherCharges((prev) => {
      // Remove any existing entry for this sale, then add the updated one
      const filtered = prev.filter(
        (item) =>
          item?.saleId !== getSaleId(selectedDataForPayment) &&
          item?.saleNumber !== selectedDataForPayment?.salesNumber,
      );

      return [
        ...filtered,
        {
          _id: selectedOtherCharge?._id,
          option: selectedOtherCharge?.name,
          value: inputAmount,
          action: "sub",
          taxPercentage: Number(selectedOtherCharge?.taxPercentage || 0),
          taxAmt: taxAmount,
          hsn: selectedOtherCharge?.hsn,
          finalValue: +(Number(calculatedDiscount) + taxAmount).toFixed(2),
          saleId: getSaleId(selectedDataForPayment),
          saleNumber: selectedDataForPayment?.salesNumber,
        },
      ];
    });

    setDiscountValue(inputAmount);
  };

  const handleConfirm = () => {
    console.log(restaurantSaleWiseTaggedOtherCharges);
    if (canConfirm) onConfirm(restaurantSaleWiseTaggedOtherCharges);
  };

  const hasDiscountHead = Object.keys(selectedOtherCharge || {}).length > 0;
  // tfoot colSpan: sel-radio + saleNo + amtToPay [+ discHead + disc] + netPayable
  const tfootColSpan = hasDiscountHead ? 3 : 2;

  if (!isOpen) return null;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ── */}
        <div style={S.head}>
          <div style={S.headLeft}>
            <div style={S.headIcon}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16v2l-2 6 2 6v2H4v-2l2-6-2-6V4z" />
                <line x1="4" y1="13" x2="20" y2="13" />
              </svg>
            </div>
            <div>
              <div style={S.headTitle}>Payment Allocation</div>
              <div style={S.headSub}>Select KOT / Sale to apply payment</div>
            </div>
          </div>
          <button style={S.closeBtn} onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* ── Info bar ── */}
        <div style={S.infoBar}>
          {selectedCheckIns.map((item, idx) => (
            <InfoChip key={idx} label="Check-In No" value={item.voucherNumber} />
          ))}
          {selectedCheckIns.map((item, idx) => (
            <InfoChip key={`guest-${idx}`} label="Guest Name" value={item.guestId?.partyName} />
          ))}
          <InfoChip
            label="Applicable Amount"
            value={fmt(applicableAmount)}
            valueColor="#1a8a4a"
            last
          />
        </div>

        {/* ── Table / Loader ── */}
        <div style={{ overflowX: "auto", position: "relative" }}>
          {loading ? (
            <div style={S.loaderWrap}>
              <div style={S.spinnerRing} />
              <span style={S.loaderText}>Loading sales data…</span>
              <div style={S.skeletonTable}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={S.skeletonRow}>
                    <div style={{ ...S.skeletonCell, width: 20, borderRadius: "50%" }} />
                    <div style={{ ...S.skeletonCell, width: 90 }} />
                    <div style={{ ...S.skeletonCell, width: 70, marginLeft: "auto" }} />
                    <div style={{ ...S.skeletonCell, width: 110 }} />
                    <div style={{ ...S.skeletonCell, width: 70, marginLeft: "auto" }} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <table style={S.table}>
              <thead>
                <tr style={S.theadRow}>
                  <th style={{ ...S.th, width: 32 }} />
                  <th style={S.th}>Sale No.</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount to Pay</th>
                  {hasDiscountHead && (
                    <>
                      <th style={S.th}>Discount Head</th>
                      <th style={S.th}>Discount</th>
                    </>
                  )}
                  <th style={{ ...S.th, textAlign: "right" }}>Net Payable</th>
                </tr>
              </thead>
              <tbody>
                {saleData.length === 0 ? (
                  <tr>
                    <td colSpan={hasDiscountHead ? 6 : 4} style={S.emptyCell}>
                      No sales records found for the selected check-ins.
                    </td>
                  </tr>
                ) : (
                  saleData.map((item) => {
                    const isSel = getSaleId(item) === selectedId;
                    // Each row uses its OWN discount entry
                    const rowDiscount = getDiscountForSale(item);
                    const rowNet = getNetForSale(item);
                    const rowDiscountEntry = restaurantSaleWiseTaggedOtherCharges.find(
                      (d) => d?.saleId === getSaleId(item),
                    );

                    return (
                      <tr
                        key={getSaleId(item)}
                        style={{ ...S.tr, ...(isSel ? S.trSel : {}) }}
                        onClick={() => handleRowClick(getSaleId(item))}
                      >
                        <td style={S.td}>
                          <div style={{ ...S.radio, ...(isSel ? S.radioSel : {}) }}>
                            {isSel && <div style={S.radioDot} />}
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={S.sBadge}>{item.salesNumber}</span>
                        </td>
                        <td style={{ ...S.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                          {fmt(item.subTotal)}
                        </td>

                        {hasDiscountHead && (
                          <>
                            {/* Discount Head column */}
                            <td style={S.td} onClick={(e) => e.stopPropagation()}>
                              {isSel ? (
                                <div style={S.discWrap}>
                                  <p>{selectedOtherCharge?.name}</p>
                                </div>
                              ) : rowDiscountEntry ? (
                                <span style={{ fontSize: 11, color: "#5a1aa0" }}>
                                  {selectedOtherCharge?.name}
                                </span>
                              ) : (
                                <span style={{ color: "#c5d5e8", fontSize: 12 }}>—</span>
                              )}
                            </td>

                            {/* Discount input / display column */}
                            <td style={S.td} onClick={(e) => e.stopPropagation()}>
                              {isSel ? (
                                <div style={S.discWrap}>
                                  <div style={S.toggleGroup}>
                                    <button
                                      style={{
                                        ...S.toggleBtn,
                                        ...(discountType === "percentage" ? S.toggleOn : {}),
                                      }}
                                      onClick={() => {
                                        setDiscountType("percentage");
                                        setDiscountValue("");
                                      }}
                                    >
                                      %
                                    </button>
                                    <button
                                      style={{
                                        ...S.toggleBtn,
                                        ...(discountType === "amount" ? S.toggleOn : {}),
                                      }}
                                      onClick={() => {
                                        setDiscountType("amount");
                                        setDiscountValue("");
                                      }}
                                    >
                                      ₹
                                    </button>
                                  </div>
                                  <input
                                    style={S.discInput}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={discountType === "percentage" ? "0–100" : "0.00"}
                                    value={discountValue}
                                    onChange={(e) => handleDiscountInput(e.target.value, item)}
                                  />
                                  {rowDiscountEntry && (
                                    <span style={S.discBadge}>
                                      −{fmt(rowDiscountEntry.finalValue)}
                                    </span>
                                  )}
                                </div>
                              ) : rowDiscountEntry ? (
                                // Show previously entered discount for non-selected rows
                                <span style={S.discBadge}>
                                  −{fmt(rowDiscountEntry.finalValue)}
                                </span>
                              ) : (
                                <span style={{ color: "#c5d5e8", fontSize: 12 }}>—</span>
                              )}
                            </td>
                          </>
                        )}

                        <td
                          style={{
                            ...S.td,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            color: isSel ? "#1a4fa0" : rowDiscount > 0 ? "#1a4fa0" : "inherit",
                            fontWeight: isSel || rowDiscount > 0 ? 700 : 400,
                          }}
                        >
                          {fmt(rowNet)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={tfootColSpan} style={S.tfoot}>
                    {saleData.length} items
                  </td>
                  <td style={{ ...S.tfoot, textAlign: "right" }}>
                    {fmt(totalRaw)}
                  </td>
                  {hasDiscountHead && (
                    <>
                      <td style={S.tfoot} />
                      <td style={{ ...S.tfoot, color: "#c0280a" }}>
                        {totalDiscount > 0 ? `−${fmt(totalDiscount)}` : "—"}
                      </td>
                    </>
                  )}
                  <td style={{ ...S.tfoot, textAlign: "right", color: "#1a4fa0" }}>
                    {fmt(totalNet)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Overage alert ── */}
        {selectedItem && balance < 0 && (
          <div style={S.alert}>
            ⚠ Net payable exceeds applicable amount. Please adjust the discount.
          </div>
        )}

        {/* ── Summary bar ── */}
        {/* <div style={S.summary}>
          <SumTile label="Selected" value={selectedItem ? selectedItem.salesNumber : "—"} />
          <SumTile
            label="Item Amount"
            value={selectedItem ? fmt(selectedItem.subTotal) : "—"}
          />
          <SumTile
            label="Discount"
            value={selectedDiscount > 0 ? `−${fmt(selectedDiscount)}` : "—"}
            valueColor="#c0280a"
          />
          <SumTile
            label="Net Payable"
            value={selectedItem ? fmt(netPayable) : "—"}
            valueColor="#1a4fa0"
          />
          <SumTile
            label="Balance"
            value={selectedItem ? fmt(balance) : fmt(applicableAmount)}
            valueColor={
              balance < 0 ? "#c0280a" : balance === 0 ? "#1a8a4a" : "#0d1b2e"
            }
            last
          />
        </div> */}

        {/* ── Footer ── */}
        <div style={S.footer}>
          <button style={S.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{ ...S.btnPay, ...(!canConfirm ? S.btnPayDisabled : {}) }}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            ✓ Confirm Payment
          </button>
        </div>
      </div>

      <style>{`
        @keyframes _pa_spin  { to { transform: rotate(360deg); } }
        @keyframes _pa_pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function InfoChip({ label, value, valueColor, last }) {
  return (
    <div style={{ ...S.infoChip, ...(last ? S.infoChipLast : {}) }}>
      <span style={S.icLabel}>{label}</span>
      <span style={{ ...S.icValue, ...(valueColor ? { color: valueColor } : {}) }}>
        {value}
      </span>
    </div>
  );
}

function SumTile({ label, value, valueColor, last }) {
  return (
    <div style={{ ...S.sumTile, ...(last ? S.sumTileLast : {}) }}>
      <span style={S.sumLabel}>{label}</span>
      <span style={{ ...S.sumValue, ...(valueColor ? { color: valueColor } : {}) }}>
        {value}
      </span>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(10,18,35,0.72)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 10,
    width: "100%",
    maxWidth: 720,
    overflow: "hidden",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  head: {
    background: "#0d1b2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 18px",
  },
  headLeft: { display: "flex", alignItems: "center", gap: 10 },
  headIcon: {
    background: "#1a6fc4",
    borderRadius: 6,
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headTitle: { color: "#fff", fontSize: 14, fontWeight: 600 },
  headSub: { color: "#7a99bb", fontSize: 11, marginTop: 1 },
  closeBtn: {
    background: "rgba(255,255,255,.1)",
    border: "none",
    borderRadius: 5,
    width: 26,
    height: 26,
    cursor: "pointer",
    color: "#aac4e0",
    fontSize: 14,
  },
  infoBar: {
    background: "#f0f6ff",
    borderBottom: "1px solid #dce8f5",
    display: "flex",
  },
  infoChip: {
    display: "flex",
    flexDirection: "column",
    padding: "9px 16px",
    borderRight: "1px solid #dce8f5",
  },
  infoChipLast: { borderRight: "none", marginLeft: "auto", alignItems: "flex-end" },
  icLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#5a7a9a",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  icValue: { fontSize: 13, fontWeight: 700, color: "#0d1b2e", marginTop: 2 },
  loaderWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 20px",
    gap: 12,
    background: "#fff",
  },
  spinnerRing: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "3px solid #dce8f5",
    borderTop: "3px solid #1a6fc4",
    animation: "_pa_spin 0.75s linear infinite",
  },
  loaderText: { fontSize: 12, color: "#5a7a9a", fontWeight: 600, letterSpacing: "0.04em" },
  skeletonTable: { width: "100%", display: "flex", flexDirection: "column", gap: 1, marginTop: 8 },
  skeletonRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    borderBottom: "1px solid #eef2f7",
  },
  skeletonCell: {
    height: 12,
    borderRadius: 4,
    background: "#e8f0fb",
    animation: "_pa_pulse 1.4s ease-in-out infinite",
  },
  emptyCell: {
    padding: "28px 16px",
    textAlign: "center",
    fontSize: 12,
    color: "#8aa4c0",
    fontStyle: "italic",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  theadRow: { background: "#f5f8fc", borderBottom: "1.5px solid #dce8f5" },
  th: {
    padding: "8px 10px",
    textAlign: "left",
    fontSize: 10,
    fontWeight: 700,
    color: "#5a7a9a",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #eef2f7", cursor: "pointer" },
  trSel: { background: "#edf5ff", boxShadow: "inset 3px 0 0 #1a6fc4" },
  td: { padding: "8px 10px", color: "#1a2740", verticalAlign: "middle" },
  radio: {
    width: 15,
    height: 15,
    borderRadius: "50%",
    border: "1.5px solid #b0c4da",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSel: { borderColor: "#1a6fc4" },
  radioDot: { width: 7, height: 7, borderRadius: "50%", background: "#1a6fc4" },
  sBadge: {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    background: "#f0e8fb",
    color: "#5a1aa0",
  },
  discWrap: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" },
  toggleGroup: {
    display: "flex",
    border: "1px solid #c5d5e8",
    borderRadius: 5,
    overflow: "hidden",
  },
  toggleBtn: {
    padding: "2px 8px",
    border: "none",
    background: "#f5f8fc",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    color: "#4a6a8a",
    fontFamily: "inherit",
  },
  toggleOn: { background: "#1a6fc4", color: "#fff" },
  discInput: {
    width: 66,
    padding: "3px 6px",
    border: "1px solid #c5d5e8",
    borderRadius: 5,
    fontSize: 11,
    fontFamily: "inherit",
    color: "#1a2740",
    outline: "none",
  },
  discBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#c0280a",
    background: "#fff0ed",
    padding: "1px 5px",
    borderRadius: 4,
  },
  tfoot: {
    padding: "7px 10px",
    fontSize: 11,
    fontWeight: 700,
    color: "#5a7a9a",
    background: "#f5f8fc",
    borderTop: "1.5px solid #dce8f5",
  },
  alert: {
    background: "#fff0ed",
    borderTop: "1px solid #f5c0b0",
    padding: "6px 16px",
    fontSize: 11,
    fontWeight: 600,
    color: "#c0280a",
  },
  summary: {
    background: "#f0f6ff",
    borderTop: "1px solid #dce8f5",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  },
  sumTile: {
    display: "flex",
    flexDirection: "column",
    padding: "9px 14px",
    borderRight: "1px solid #dce8f5",
  },
  sumTileLast: { borderRight: "none", marginLeft: "auto", alignItems: "flex-end" },
  sumLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#5a7a9a",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
  },
  sumValue: { fontSize: 12, fontWeight: 700, color: "#0d1b2e", marginTop: 2 },
  footer: {
    background: "#fff",
    borderTop: "1px solid #eef2f7",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
  },
  btnCancel: {
    padding: "6px 16px",
    border: "1px solid #c5d5e8",
    borderRadius: 5,
    background: "#fff",
    color: "#4a6a8a",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPay: {
    padding: "6px 18px",
    border: "none",
    borderRadius: 5,
    background: "#1a6fc4",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnPayDisabled: { background: "#a0bcd8", cursor: "not-allowed" },
};