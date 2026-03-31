import React, { useEffect, useState } from "react";

const ItemSelector = ({ items = [], kotData = [], onChange, onClose }) => {
  const [selected, setSelected] = useState([]);
  const [allItems, setAllItems] = useState([]);

  useEffect(() => {
    if (!kotData?.length || !items?.length) {
      setAllItems([]);
      return;
    }

    const matchedKots = kotData.filter((kot) =>
      items.some((i) => i.id === kot._id?.toString())
    );

    const mergedItems = matchedKots.flatMap((kot) =>
      (kot.items || []).map((item) => ({
        ...item,
        kotId: kot._id,
        kotVoucherNumber: kot.voucherNumber,
        tableNumber: kot.tableNumber,
        customer: kot.customer,
        type: kot.type,
        serviceType: kot.serviceType,
        status: kot.status,
        createdAt: kot.createdAt,
        paymentMethod: kot.paymentMethod,
      }))
    );

    setAllItems(mergedItems);
  }, [kotData, items]);

  const round2 = (num) => Number((num || 0).toFixed(2));

  const getItemId = (item) => item?._id || item?.id || item?.itemId;

  const isSameItem = (a, b) =>
    String(a.kotId) === String(b.kotId) &&
    String(a.itemId) === String(b.itemId);

  const recalculateSelectedItem = (item, count) => {
    const godown = item?.GodownList?.[0] || {};

    const maxQty =
      item?.actualCount ||
      item?.quantity ||
      godown?.actualCount ||
      godown?.count ||
      count;

    const safeQty = Math.max(1, Math.min(count, maxQty));

    const selectedPriceRate = Number(
      godown.selectedPriceRate ?? item.price ?? 0
    );

    const discountPercentage = Number(godown.discountPercentage ?? 0);
    const fixedDiscountAmount = Number(godown.discountAmount ?? 0);
    const discountType = godown.discountType || "none";

    const cgstValue = Number(item.cgst ?? godown.cgstValue ?? 0);
    const sgstValue = Number(item.sgst ?? godown.sgstValue ?? 0);
    const igstValue = Number(item.igst ?? godown.igstValue ?? 0);
    const cessValue = Number(godown.cessValue ?? 0);
    const addlCessValue = Number(godown.addlCessValue ?? 0);

    const isTaxIncluded = item.taxInclusive ?? godown.isTaxIncluded ?? true;

    let unitDiscount = 0;

    if (discountType === "percentage") {
      unitDiscount = (selectedPriceRate * discountPercentage) / 100;
    } else if (discountType === "amount") {
      unitDiscount = fixedDiscountAmount;
    }

    const discountedUnitPrice = Math.max(selectedPriceRate - unitDiscount, 0);

    const totalTaxRate =
      cgstValue + sgstValue + igstValue + cessValue + addlCessValue;

    let basePricePerUnit = discountedUnitPrice;
    let taxableAmount = 0;

    if (isTaxIncluded) {
      basePricePerUnit =
        totalTaxRate > 0
          ? discountedUnitPrice / (1 + totalTaxRate / 100)
          : discountedUnitPrice;
      taxableAmount = basePricePerUnit * safeQty;
    } else {
      basePricePerUnit = discountedUnitPrice;
      taxableAmount = discountedUnitPrice * safeQty;
    }

    const cgstAmount = (taxableAmount * cgstValue) / 100;
    const sgstAmount = (taxableAmount * sgstValue) / 100;
    const igstAmount = (taxableAmount * igstValue) / 100;
    const cessAmount = (taxableAmount * cessValue) / 100;
    const additionalCessAmount = (taxableAmount * addlCessValue) / 100;

    const total = isTaxIncluded
      ? discountedUnitPrice * safeQty
      : taxableAmount +
        cgstAmount +
        sgstAmount +
        igstAmount +
        cessAmount +
        additionalCessAmount;

    return {
      kotId: item.kotId,
      kotVoucherNumber: item.kotVoucherNumber || "",
      tableNumber: item.tableNumber || "",
      customer: item.customer || { name: "", tableNumber: item.tableNumber || "" },
      type: item.type || "dine-in",
      serviceType: item.serviceType || "Restaurant",
      status: item.status || "pending",
      createdAt: item.createdAt || new Date().toISOString(),
      paymentMethod: item.paymentMethod ?? null,

      itemId: getItemId(item),
      productName: item.product_name,
      actualCount: maxQty,
      selectedCount: safeQty,

      price: round2(selectedPriceRate),
      basePrice: round2(basePricePerUnit),
      discountPercentage: round2(discountPercentage),
      discountAmount: round2(unitDiscount),
      discountType,

      taxableAmount: round2(taxableAmount),

      cgstValue: round2(cgstValue),
      sgstValue: round2(sgstValue),
      igstValue: round2(igstValue),
      cessValue: round2(cessValue),
      addlCessValue: round2(addlCessValue),

      cgstAmount: round2(cgstAmount),
      sgstAmount: round2(sgstAmount),
      igstAmount: round2(igstAmount),
      cessAmount: round2(cessAmount),
      additionalCessAmount: round2(additionalCessAmount),

      total: round2(total),
      isTaxIncluded,
    };
  };

  const buildKotWithSelectedItemsOnly = (kot, selectedItems) => {
    const selectedMap = new Map(
      selectedItems.map((sel) => [`${sel.kotId}_${sel.itemId}`, sel])
    );

    const updatedItems = (kot.items || [])
      .filter((item) => {
        const key = `${kot._id}_${item._id}`;
        return selectedMap.has(key);
      })
      .map((item) => {
        const key = `${kot._id}_${item._id}`;
        const sel = selectedMap.get(key);

        return {
          ...item,
          quantity: sel.selectedCount,
          totalCount: sel.selectedCount,
          totalActualCount: sel.selectedCount,
          total: round2(sel.total),
          totalCgstAmt: round2(sel.cgstAmount),
          totalSgstAmt: round2(sel.sgstAmount),
          totalIgstAmt: round2(sel.igstAmount),
          totalCessAmt: round2(sel.cessAmount),
          totalAddlCessAmt: round2(sel.additionalCessAmount),
          price: round2(sel.price),
          GodownList: (item.GodownList || []).map((gdn, index) =>
            index === 0
              ? {
                  ...gdn,
                  count: sel.selectedCount,
                  actualCount: sel.selectedCount,
                  basePrice: round2(sel.basePrice),
                  taxableAmount: round2(sel.taxableAmount),
                  cgstAmount: round2(sel.cgstAmount),
                  sgstAmount: round2(sel.sgstAmount),
                  igstAmount: round2(sel.igstAmount),
                  cessAmount: round2(sel.cessAmount),
                  additionalCessAmount: round2(sel.additionalCessAmount),
                  individualTotal: round2(sel.total),
                }
              : gdn
          ),
        };
      });

    const total = round2(
      updatedItems.reduce((sum, item) => sum + (item.total || 0), 0)
    );
    const totalCgstAmt = round2(
      updatedItems.reduce((sum, item) => sum + (item.totalCgstAmt || 0), 0)
    );
    const totalSgstAmt = round2(
      updatedItems.reduce((sum, item) => sum + (item.totalSgstAmt || 0), 0)
    );
    const totalIgstAmt = round2(
      updatedItems.reduce((sum, item) => sum + (item.totalIgstAmt || 0), 0)
    );
    const totalCessAmt = round2(
      updatedItems.reduce((sum, item) => sum + (item.totalCessAmt || 0), 0)
    );
    const totalAddlCessAmt = round2(
      updatedItems.reduce((sum, item) => sum + (item.totalAddlCessAmt || 0), 0)
    );

    return {
      ...kot,
      items: updatedItems,
      total,
      totalCgstAmt,
      totalSgstAmt,
      totalIgstAmt,
      totalCessAmt,
      totalAddlCessAmt,
    };
  };

  const buildSelectedOnlyKots = (allKotData, selectedItems) => {
    return allKotData
      .map((kot) => buildKotWithSelectedItemsOnly(kot, selectedItems))
      .filter((kot) => kot.items && kot.items.length > 0);
  };

  const getSelectedItem = (item) => {
    const itemId = getItemId(item);
    return selected.find(
      (sel) =>
        String(sel.kotId) === String(item.kotId) &&
        String(sel.itemId) === String(itemId)
    );
  };

  const toggle = (item) => {
    const newItem = recalculateSelectedItem(item, item.quantity);
    setSelected((prev) => {
      const exists = prev.some((sel) => isSameItem(sel, newItem));
      return exists
        ? prev.filter((sel) => !isSameItem(sel, newItem))
        : [...prev, newItem];
    });
  };

  const setQty = (item, qty) => {
    const updatedItem = recalculateSelectedItem(item, qty);
    setSelected((prev) => {
      const exists = prev.some((sel) => isSameItem(sel, updatedItem));
      return !exists
        ? [...prev, updatedItem]
        : prev.map((sel) =>
            isSameItem(sel, updatedItem) ? updatedItem : sel
          );
    });
  };

  const handleConfirm = () => {
    const updatedKots = buildSelectedOnlyKots(kotData, selected);
    onChange?.(updatedKots);
    onClose();
  };

  const selectedItemsCount = selected.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-t-3xl bg-slate-50 shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-slate-300 sm:hidden" />

        <div className="shrink-0 border-b border-slate-700 bg-[#0f2a44] px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-bold text-white">Select Items</div>
              <div className="mt-1 text-[11px] text-slate-300">
                Only selected items will be added to KOT
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedItemsCount > 0 && (
                <div className="rounded-full bg-green-500 px-3 py-1 text-[11px] font-bold text-white">
                  {selectedItemsCount} selected
                </div>
              )}

              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-500 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={onClose}
                type="button"
              >
                X
              </button>
            </div>
          </div>
        </div>

        {allItems.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No items available
          </div>
        ) : (
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {allItems.map((item, index) => {
              const selectedItem = getSelectedItem(item);
              const isSel = Boolean(selectedItem);
              const qty = selectedItem
                ? selectedItem.selectedCount
                : item.quantity;

               if (qty <= 0) return;

              return (
                <div
                  key={`${item.kotId}_${getItemId(item)}_${index}`}
                  onClick={() => toggle(item)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    isSel
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-100"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                      isSel
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    <span
                      className={`text-white transition ${
                        isSel ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold leading-snug ${
                        isSel ? "text-blue-700" : "text-slate-800"
                      }`}
                    >
                      {item.product_name}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      KOT: {item.kotVoucherNumber || item.kotId}
                    </div>
                  </div>

                  <span className="shrink-0 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] text-slate-500">
                    max {item.quantity}
                  </span>

                  <div
                    className={`flex shrink-0 items-center overflow-hidden rounded-lg border bg-white ${
                      isSel
                        ? "pointer-events-auto border-blue-600 opacity-100"
                        : "pointer-events-none border-slate-300 opacity-30"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                      disabled={qty <= 1}
                      onClick={() => setQty(item, qty - 1)}
                    >
                      -
                    </button>

                    <span className="min-w-[24px] text-center text-sm font-semibold text-slate-800">
                      {qty}
                    </span>

                    <button
                      type="button"
                      className="flex h-8 w-8 items-center justify-center text-lg text-slate-500 hover:bg-slate-100 disabled:opacity-25"
                      disabled={qty >= item.quantity}
                      onClick={() => setQty(item, qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="shrink-0 border-t border-slate-200 bg-slate-100 px-4 py-3">
          {selectedItemsCount === 0 ? (
            <div className="text-center text-sm text-slate-500">
              No items selected
            </div>
          ) : (
            <div className="max-h-32 space-y-2 overflow-y-auto pr-1">
              {selected.map((item, index) => (
                <div
                  className="rounded-lg bg-white px-3 py-2"
                  key={`${item.kotId}_${item.itemId}_${index}`}
                >
                  <div className="text-sm font-semibold text-slate-700">
                    {item.productName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Qty: {item.selectedCount}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Taxable: {item.taxableAmount}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    CGST: {item.cgstAmount} | SGST: {item.sgstAmount} | IGST: {item.igstAmount}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-700">
                    Total: {item.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={selectedItemsCount === 0}
          onClick={handleConfirm}
          className="mx-4 my-4 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default ItemSelector;