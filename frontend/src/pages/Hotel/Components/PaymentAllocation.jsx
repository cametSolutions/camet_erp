import { useState, useEffect, useMemo, useCallback } from "react";
import api from "@/api/api";
import { useSelector } from "react-redux";

// Round all monetary values to nearest whole rupee (4.2 → 4, 4.8 → 5)
const round = (n) => Math.round(Number(n) || 0);

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(round(n ?? 0));

// ─────────────────────────────────────────────────────────────────────────────
// Shape of a discount entry stored in restaurantSaleWiseTaggedOtherCharges:
//   { _id, option, action, taxPercentage, taxAmt, hsn,
//     saleId, saleNumber,
//     discountType,   ← "percentage" | "amount"  (NEW – persisted per row)
//     rawInput,       ← exactly what the user typed  (NEW – replaces ambiguous "value")
//     flatDiscount,   ← computed flat INR discount before tax
//     finalValue }    ← flatDiscount + tax  (what gets subtracted from subTotal)
// ─────────────────────────────────────────────────────────────────────────────

export default function PaymentAllocation({
  isOpen = true,
  onClose = () => {},
  onConfirm = () => {},
  selectedCheckIns = [],
  cmp_id,
  advanceAmount, // budget for advance allocation (from parent)
  otherCharges,
  restaurantSideDiscountAdjustmentArray,
}) {
  const [selectedId, setSelectedId] = useState(null);
  // Per-row discount type is now stored in the entry itself (see discountEntries).
  // This state is ONLY used while a row is actively selected / being edited.
  const [activeDiscountType, setActiveDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState("");

  const [saleData, setSaleData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOtherCharge, setSelectedOtherCharge] = useState({});

  // FIX #5: discount entries keyed by saleId for O(1) lookup & per-row type
  // Shape: { [saleId]: { discountType, rawInput, flatDiscount, finalValue, ...meta } }
  const [discountEntries, setDiscountEntries] = useState({});

  // advance: { [saleId]: number }
  const [advanceMap, setAdvanceMap] = useState({});
  const [applyAllAdvance, setApplyAllAdvance] = useState(false);

  console.log(restaurantSideDiscountAdjustmentArray);

  // ── Seed discount head ───────────────────────────────────────────────────
  useEffect(() => {
    if (otherCharges?.length > 0) {
      const discountHead = otherCharges.find(
        (item) => item?.name?.toUpperCase().trim() === "DISCOUNT",
      );
      if (discountHead) setSelectedOtherCharge(discountHead);
    }
  }, [otherCharges]);

useEffect(() => {
  if (restaurantSideDiscountAdjustmentArray?.length > 0) {
    const initialDiscountEntries = {};
    const initialAdvanceMap = {};

    restaurantSideDiscountAdjustmentArray?.forEach((item) => {
      initialDiscountEntries[item.saleId] = {
        _id: item._id,
        option: item.option,
        action: item.action,
        taxPercentage: item.taxPercentage,
        taxAmt: item.taxAmt,
        hsn: item.hsn,

        saleId: item.saleId,
        saleNumber: item.saleNumber,

        discountType: item.discountType,
        rawInput: item.value,

        flatDiscount: Number(item.discountAmount || 0),

        finalValue: Number(item.finalValue || 0),
      };

      initialAdvanceMap[item.saleId] = Number(
        item.advanceAmount || 0
      );
    });

    setDiscountEntries(initialDiscountEntries);
    setAdvanceMap(initialAdvanceMap);
  }
}, [restaurantSideDiscountAdjustmentArray]);

  // ── Fetch sales ──────────────────────────────────────────────────────────
  const handleFetch = useCallback(async () => {
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
  }, [selectedCheckIns, cmp_id]);

  useEffect(() => {
    if (selectedCheckIns?.length > 0) handleFetch();
  }, [handleFetch]);

  const getSaleId = (sale) => sale?._id ?? sale?.id ?? null;

  const selectedItem = useMemo(
    () => saleData.find((i) => getSaleId(i) === selectedId) ?? null,
    [saleData, selectedId],
  );

  // ── Discount helpers ─────────────────────────────────────────────────────
  // Returns the final deduction amount (flatDiscount + tax) for a sale
  const getDiscountForSale = useCallback(
    (sale) => Number(discountEntries[getSaleId(sale)]?.finalValue || 0),
    [discountEntries],
  );

  // ── Advance helpers ──────────────────────────────────────────────────────
  const getAdvanceForSale = useCallback(
    (sale) => Number(advanceMap[getSaleId(sale)] || 0),
    [advanceMap],
  );

  const totalAdvanceUsed = Object.values(advanceMap).reduce(
    (a, v) => a + Number(v || 0),
    0,
  );
  const remainingAdvance = round(advanceAmount - totalAdvanceUsed);

  // ── Net per row ──────────────────────────────────────────────────────────
  const getRawNetForSale = (sale) =>
    round(sale.subTotal - getDiscountForSale(sale) - getAdvanceForSale(sale));

  const getNetForSale = (sale) => Math.max(getRawNetForSale(sale), 0);

  // ── Footer totals ────────────────────────────────────────────────────────
  const totalRaw = saleData.reduce((s, i) => s + round(i.subTotal ?? 0), 0);
  const totalDiscount = Object.values(discountEntries).reduce(
    (acc, e) => acc + round(e?.finalValue || 0),
    0,
  );
  const totalAdvance = totalAdvanceUsed;
  const totalNet = round(totalRaw - totalDiscount - totalAdvance);

  const netPayable = selectedItem ? getNetForSale(selectedItem) : 0;
  const hasAnyNegativeNet = saleData.some((s) => getRawNetForSale(s) < 0);

  const canConfirm =
    !!selectedItem &&
    netPayable >= 0 &&
    totalAdvanceUsed <= advanceAmount &&
    !hasAnyNegativeNet;

  const hasDiscountHead = Object.keys(selectedOtherCharge || {}).length > 0;
  const tfootColSpan = 2; // radio + saleNo

  // ── Build a discount entry object ────────────────────────────────────────
  // Discount always applies against sale.subTotal (the row amount):
  //   percentage → clamp input to 0–100, compute (subTotal * pct / 100)
  //   amount     → clamp input to 0–subTotal directly
  const buildDiscountEntry = useCallback(
    (sale, rawInput, discType) => {
      const inputAmount = Number(rawInput) || 0;
      const rowAmount = round(sale.subTotal); // the row's own amount

      let flatDiscount;
      if (discType === "percentage") {
        // Clamp percentage to 0–100
        const pct = Math.min(Math.max(inputAmount, 0), 100);
        flatDiscount = round((rowAmount * pct) / 100);
      } else {
        // Clamp flat amount to 0–rowAmount
        flatDiscount = round(Math.min(Math.max(inputAmount, 0), rowAmount));
      }

      const taxPct = Number(selectedOtherCharge?.taxPercentage || 0);
      const taxAmt = round((flatDiscount * taxPct) / 100);
      const finalValue = round(flatDiscount + taxAmt);

      return {
        _id: selectedOtherCharge?._id,
        option: selectedOtherCharge?.name,
        action: "sub",
        taxPercentage: taxPct,
        taxAmt,
        hsn: selectedOtherCharge?.hsn,
        saleId: getSaleId(sale),
        saleNumber: sale?.salesNumber,
        discountType: discType,
        rawInput,
        flatDiscount,
        finalValue,
      };
    },
    [selectedOtherCharge],
  );

  // FIX #4: re-clamp advance for a sale given its new discount
  const reclampAdvance = useCallback(
    (saleId, sale, newFinalDiscount) => {
      setAdvanceMap((prev) => {
        const current = Number(prev[saleId] || 0);
        const maxForRow = round(sale.subTotal - newFinalDiscount);
        const otherUsed = Object.entries(prev)
          .filter(([k]) => k !== saleId)
          .reduce((a, [, v]) => a + Number(v || 0), 0);
        const budgetLeft = round(advanceAmount - otherUsed);
        const clamped = round(
          Math.min(current, Math.max(maxForRow, 0), Math.max(budgetLeft, 0)),
        );
        if (clamped === current) return prev; // no change → skip re-render
        return { ...prev, [saleId]: clamped };
      });
    },
    [advanceAmount],
  );

  // ── Per-row discount input ───────────────────────────────────────────────
  const handleDiscountInput = (rawInput, sale) => {
    const entry = buildDiscountEntry(sale, rawInput, activeDiscountType);
    setDiscountEntries((prev) => ({ ...prev, [getSaleId(sale)]: entry }));
    setDiscountValue(rawInput);
    // FIX #4: immediately re-clamp advance if it now exceeds (subTotal - newDiscount)
    reclampAdvance(getSaleId(sale), sale, entry.finalValue);
  };

  // ── Row click: select / deselect ─────────────────────────────────────────
  const handleRowClick = (id) => {
    setSelectedId((prev) => {
      if (prev === id) {
        setDiscountValue("");
        return null;
      }
      // FIX #5: restore this row's persisted discount type + raw input
      const existing = discountEntries[id];
      if (existing) {
        setActiveDiscountType(existing.discountType ?? "percentage");
        setDiscountValue(String(existing.rawInput ?? ""));
      } else {
        setActiveDiscountType("percentage");
        setDiscountValue("");
      }
      return id;
    });
  };

  // ── Apply-all advance ────────────────────────────────────────────────────
  // FIX #2: read discount from the current discountEntries state directly
  const handleApplyAllAdvance = (checked) => {
    setApplyAllAdvance(checked);
    if (!checked) {
      setAdvanceMap({});
      return;
    }
    let budget = advanceAmount;
    const newMap = {};
    for (const sale of saleData) {
      const saleId = getSaleId(sale);
      if (budget <= 0) {
        newMap[saleId] = 0;
        continue;
      }
      // FIX #2: read from discountEntries directly (not via stale closure callback)
      const discFinal = Number(discountEntries[saleId]?.finalValue || 0);
      const needed = round(sale.subTotal - discFinal);
      const alloc = round(Math.min(Math.max(needed, 0), budget));
      newMap[saleId] = alloc;
      budget = round(budget - alloc);
    }
    setAdvanceMap(newMap);
  };

  // ── Per-row advance input ────────────────────────────────────────────────
  const handleAdvanceInput = (rawValue, sale) => {
    const saleId = getSaleId(sale);
    const input = Number(rawValue) || 0;
    const discFinal = Number(discountEntries[saleId]?.finalValue || 0);
    const maxForRow = round(sale.subTotal - discFinal);

    const otherUsed = Object.entries(advanceMap)
      .filter(([k]) => k !== saleId)
      .reduce((a, [, v]) => a + Number(v || 0), 0);
    const budgetForRow = round(advanceAmount - otherUsed);

    const clamped = round(
      Math.min(input, Math.max(maxForRow, 0), Math.max(budgetForRow, 0)),
    );
    setAdvanceMap((prev) => ({ ...prev, [saleId]: clamped }));
    if (clamped !== input) setApplyAllAdvance(false);
  };

  // ── Confirm ──────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!canConfirm) return;

    // Build one clean row per sale with exactly the fields the parent needs
    const rows = saleData.map((sale) => {
      const saleId = getSaleId(sale);
      const discEntry = discountEntries[saleId];
      
  if (!discEntry && advanceMap[saleId] <= 0) return;

      return {
        // Sale identifiers
        saleId,
        saleNumber: sale.salesNumber,
        // Discount
        discountAmount: discEntry ? round(discEntry.flatDiscount) : 0,
        discountType: discEntry ? discEntry.discountType : null, // "percentage" | "amount" | null
        _id: discEntry ? discEntry._id : null,
        option: discEntry ? discEntry.option : null,
        value: discEntry ? discEntry.rawInput : null,
        action: "sub",
        taxPercentage: discEntry ? discEntry.taxPercentage : null,
        taxAmt: discEntry ? discEntry.taxAmt : null,
        hsn: discEntry ? discEntry.hsn : null,
        finalValue: discEntry ? round(discEntry.flatDiscount) : 0,
        // Advance
        advanceAmount: round(advanceMap[saleId] || 0),
        // Derived net (for parent convenience)
        netPayable: getNetForSale(sale),
      };
    }).filter(Boolean);

    

    onConfirm(rows);
  };

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
            <InfoChip
              key={idx}
              label="Check-In No"
              value={item.voucherNumber}
            />
          ))}
          {selectedCheckIns.map((item, idx) => (
            <InfoChip
              key={`g-${idx}`}
              label="Guest Name"
              value={item.guestId?.partyName}
            />
          ))}
          <InfoChip
            label="Advance Budget"
            value={fmt(advanceAmount)}
            valueColor="#1a8a4a"
          />
          <InfoChip
            label="Remaining"
            value={fmt(remainingAdvance)}
            valueColor={
              remainingAdvance < 0
                ? "#c0280a"
                : remainingAdvance === 0
                  ? "#1a8a4a"
                  : "#1a4fa0"
            }
            last
          />
        </div>

        {/* ── Table ── */}
        <div
          style={{
            overflowX: "auto",
            position: "relative",
            flex: 1,
            overflowY: "auto",
          }}
        >
          {loading ? (
            <div style={S.loaderWrap}>
              <div style={S.spinnerRing} />
              <span style={S.loaderText}>Loading sales data…</span>
              <div style={S.skeletonTable}>
                {[1, 2, 3].map((n) => (
                  <div key={n} style={S.skeletonRow}>
                    <div
                      style={{
                        ...S.skeletonCell,
                        width: 20,
                        borderRadius: "50%",
                      }}
                    />
                    <div style={{ ...S.skeletonCell, width: 90 }} />
                    <div
                      style={{
                        ...S.skeletonCell,
                        width: 70,
                        marginLeft: "auto",
                      }}
                    />
                    <div style={{ ...S.skeletonCell, width: 110 }} />
                    <div
                      style={{
                        ...S.skeletonCell,
                        width: 70,
                        marginLeft: "auto",
                      }}
                    />
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
                  <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                  {hasDiscountHead && (
                    <>
                      <th style={S.th}>Disc. Head</th>
                      <th style={S.th}>Discount</th>
                    </>
                  )}
                  <th style={{ ...S.th, minWidth: 140 }}>
                    <div style={S.advHeadWrap}>
                      <span>Advance</span>
                      <label
                        style={S.advAllLabel}
                        title="Fill all rows with advance"
                      >
                        <div
                          style={{
                            ...S.checkbox,
                            ...(applyAllAdvance ? S.checkboxOn : {}),
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyAllAdvance(!applyAllAdvance);
                          }}
                        >
                          {applyAllAdvance && (
                            <svg
                              width="9"
                              height="9"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="#fff"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="2,6 5,9 10,3" />
                            </svg>
                          )}
                        </div>
                        <span style={S.advAllText}>All</span>
                      </label>
                    </div>
                  </th>
                  <th style={{ ...S.th, textAlign: "right" }}>Net Payable</th>
                </tr>
              </thead>

              <tbody>
                {saleData.length === 0 ? (
                  <tr>
                    <td colSpan={hasDiscountHead ? 7 : 5} style={S.emptyCell}>
                      No sales records found for the selected check-ins.
                    </td>
                  </tr>
                ) : (
                  saleData.map((item) => {
                    const saleId = getSaleId(item);
                    const isSel = saleId === selectedId;
                    const rowDiscEntry = discountEntries[saleId];
                    const rowDiscount = Number(rowDiscEntry?.finalValue || 0);
                    const rowAdvance = getAdvanceForSale(item);
                    const rowNet = getNetForSale(item);

                    const maxForRow = round(item.subTotal - rowDiscount);
                    const otherUsed = Object.entries(advanceMap)
                      .filter(([k]) => k !== saleId)
                      .reduce((a, [, v]) => a + Number(v || 0), 0);
                    const budgetLeft = round(advanceAmount - otherUsed);
                    const rowCap = round(
                      Math.min(maxForRow, Math.max(budgetLeft, 0)),
                    );

                    return (
                      <tr
                        key={saleId}
                        style={{ ...S.tr, ...(isSel ? S.trSel : {}) }}
                        onClick={() => handleRowClick(saleId)}
                      >
                        {/* Radio */}
                        <td style={S.td}>
                          <div
                            style={{ ...S.radio, ...(isSel ? S.radioSel : {}) }}
                          >
                            {isSel && <div style={S.radioDot} />}
                          </div>
                        </td>

                        {/* Sale No */}
                        <td style={S.td}>
                          <span style={S.sBadge}>{item.salesNumber}</span>
                        </td>

                        {/* Amount */}
                        <td
                          style={{
                            ...S.td,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {fmt(item.subTotal)}
                        </td>

                        {/* Discount cols */}
                        {hasDiscountHead && (
                          <>
                            <td
                              style={S.td}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isSel || rowDiscEntry ? (
                                <span
                                  style={{ fontSize: 11, color: "#5a1aa0" }}
                                >
                                  {selectedOtherCharge?.name}
                                </span>
                              ) : (
                                <span
                                  style={{ color: "#c5d5e8", fontSize: 12 }}
                                >
                                  —
                                </span>
                              )}
                            </td>
                            <td
                              style={S.td}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isSel ? (
                                <div style={S.discWrap}>
                                  <div style={S.toggleGroup}>
                                    <button
                                      style={{
                                        ...S.toggleBtn,
                                        ...(activeDiscountType === "percentage"
                                          ? S.toggleOn
                                          : {}),
                                      }}
                                      onClick={() => {
                                        setActiveDiscountType("percentage");
                                        setDiscountValue("");
                                        // Clear entry so stale % value doesn't linger
                                        setDiscountEntries((prev) => {
                                          const next = { ...prev };
                                          delete next[saleId];
                                          return next;
                                        });
                                      }}
                                    >
                                      %
                                    </button>
                                    <button
                                      style={{
                                        ...S.toggleBtn,
                                        ...(activeDiscountType === "amount"
                                          ? S.toggleOn
                                          : {}),
                                      }}
                                      onClick={() => {
                                        setActiveDiscountType("amount");
                                        setDiscountValue("");
                                        setDiscountEntries((prev) => {
                                          const next = { ...prev };
                                          delete next[saleId];
                                          return next;
                                        });
                                      }}
                                    >
                                      ₹
                                    </button>
                                  </div>
                                  <input
                                    style={{
                                      ...S.discInput,
                                      borderColor: rowDiscEntry
                                        ? "#7c3aed"
                                        : "#c5d5e8",
                                      background: rowDiscEntry
                                        ? "#f5f0ff"
                                        : "#fff",
                                    }}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={
                                      activeDiscountType === "percentage"
                                        ? "0–100"
                                        : "0.00"
                                    }
                                    value={discountValue}
                                    onChange={(e) =>
                                      handleDiscountInput(e.target.value, item)
                                    }
                                  />
                                  {/* Max hint: shows cap based on type */}
                                  <span style={S.discCapHint}>
                                    max{" "}
                                    {activeDiscountType === "percentage"
                                      ? "100%"
                                      : fmt(round(item.subTotal))}
                                  </span>
                                  {rowDiscEntry && (
                                    <span style={S.discBadge}>
                                      −{fmt(rowDiscEntry.finalValue)}
                                    </span>
                                  )}
                                </div>
                              ) : rowDiscEntry ? (
                                <span style={S.discBadge}>
                                  −{fmt(rowDiscEntry.finalValue)}
                                </span>
                              ) : (
                                <span
                                  style={{ color: "#c5d5e8", fontSize: 12 }}
                                >
                                  —
                                </span>
                              )}
                            </td>
                          </>
                        )}

                        {/* Advance input */}
                        <td style={S.td} onClick={(e) => e.stopPropagation()}>
                          <div style={S.advCellWrap}>
                            <input
                              style={{
                                ...S.advInput,
                                borderColor:
                                  rowAdvance > 0 ? "#1a6fc4" : "#c5d5e8",
                                background: rowAdvance > 0 ? "#edf5ff" : "#fff",
                              }}
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={advanceMap[saleId] ?? ""}
                              onChange={(e) => {
                                setApplyAllAdvance(false);
                                handleAdvanceInput(e.target.value, item);
                              }}
                            />
                            {rowCap > 0 && rowAdvance < rowCap && (
                              <span style={S.advCapHint}>
                                max {fmt(rowCap)}
                              </span>
                            )}
                            {rowAdvance > 0 && (
                              <span style={S.advBadge}>−{fmt(rowAdvance)}</span>
                            )}
                          </div>
                        </td>

                        {/* Net Payable */}
                        <td
                          style={{
                            ...S.td,
                            textAlign: "right",
                            fontVariantNumeric: "tabular-nums",
                            color:
                              rowAdvance > 0 || rowDiscount > 0
                                ? "#1a4fa0"
                                : "inherit",
                            fontWeight:
                              rowAdvance > 0 || rowDiscount > 0 ? 700 : 400,
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
                  <td style={{ ...S.tfoot, color: "#1a6fc4" }}>
                    {totalAdvance > 0 ? `−${fmt(totalAdvance)}` : "—"}
                  </td>
                  <td
                    style={{ ...S.tfoot, textAlign: "right", color: "#1a4fa0" }}
                  >
                    {fmt(totalNet)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        {/* ── Alerts ── */}
        {totalAdvanceUsed > advanceAmount && (
          <div style={S.alert}>
            ⚠ Total advance {fmt(totalAdvanceUsed)} exceeds advance budget{" "}
            {fmt(advanceAmount)}.
          </div>
        )}
        {hasAnyNegativeNet && (
          <div style={S.alert}>
            ⚠ One or more rows have advance exceeding net payable. Please
            adjust.
          </div>
        )}

        {/* ── Footer ── */}
        <div style={S.footer}>
          <div style={S.footerLeft}>
            <span style={S.footerStat}>
              Advance used:&nbsp;
              <strong style={{ color: "#1a6fc4" }}>{fmt(totalAdvance)}</strong>
              &ensp;|&ensp; Remaining:&nbsp;
              <strong
                style={{ color: remainingAdvance < 0 ? "#c0280a" : "#1a8a4a" }}
              >
                {fmt(remainingAdvance)}
              </strong>
            </span>
          </div>
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
      <span
        style={{ ...S.icValue, ...(valueColor ? { color: valueColor } : {}) }}
      >
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
    maxWidth: 820,
    overflow: "hidden",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  head: {
    background: "#0d1b2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "13px 18px",
    flexShrink: 0,
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
    flexShrink: 0,
  },
  infoChip: {
    display: "flex",
    flexDirection: "column",
    padding: "9px 16px",
    borderRight: "1px solid #dce8f5",
  },
  infoChipLast: {
    borderRight: "none",
    marginLeft: "auto",
    alignItems: "flex-end",
  },
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
  loaderText: {
    fontSize: 12,
    color: "#5a7a9a",
    fontWeight: 600,
    letterSpacing: "0.04em",
  },
  skeletonTable: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    marginTop: 8,
  },
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
  advHeadWrap: { display: "flex", alignItems: "center", gap: 6 },
  advAllLabel: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    border: "1.5px solid #b0c4da",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    background: "#fff",
  },
  checkboxOn: { background: "#1a6fc4", borderColor: "#1a6fc4" },
  advAllText: {
    fontSize: 9,
    fontWeight: 700,
    color: "#1a6fc4",
    letterSpacing: "0.06em",
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
  discCapHint: {
    fontSize: 10,
    color: "#7a5a10",
    fontStyle: "italic",
    whiteSpace: "nowrap",
  },
  discBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#c0280a",
    background: "#fff0ed",
    padding: "1px 5px",
    borderRadius: 4,
  },
  advCellWrap: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  advInput: {
    width: 72,
    padding: "4px 7px",
    border: "1.5px solid #c5d5e8",
    borderRadius: 5,
    fontSize: 11,
    fontFamily: "inherit",
    color: "#1a2740",
    outline: "none",
    transition: "border-color 0.15s, background 0.15s",
  },
  advCapHint: {
    fontSize: 10,
    color: "#7a5a10",
    fontStyle: "italic",
    whiteSpace: "nowrap",
  },
  advBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a4fa0",
    background: "#ddeeff",
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
    flexShrink: 0,
  },
  footer: {
    background: "#fff",
    borderTop: "1px solid #eef2f7",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    flexShrink: 0,
  },
  footerLeft: { flex: 1 },
  footerStat: { fontSize: 11, color: "#5a7a9a" },
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
