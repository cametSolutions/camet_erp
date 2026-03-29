export const applyBatchEdit = ({
  kotDataForEdit,
  batchNo,
  editedBatchItems,
  updatedItems,
}) => {
  console.log("applyBatchEdit args:", {
    kotDataForEdit,
    batchNo,
    editedBatchItems,
    updatedItems,
  });

  let newItems = [...(updatedItems || [])];

  // 1) remove OLD quantities of *all* batches with this batchNo
  const oldBatches = (kotDataForEdit.kitchenBatches || []).filter(
    (b) => b.batchNo === batchNo
  );

  if (oldBatches.length > 0) {
    const removeQtyById = oldBatches.reduce((acc, batch) => {
      (batch.items || []).forEach((it) => {
        const id = it.itemId?.toString() || it._id?.toString();
        if (!id) return;
        acc[id] = (acc[id] || 0) + (it.quantity || 0);
      });
      return acc;
    }, {});

    newItems = newItems
      .map((item) => {
        const id = item._id?.toString();
        const removeQty = removeQtyById[id] || 0;
        if (!removeQty) return item;

        const newQty = (item.quantity || 0) - removeQty;
        if (newQty <= 0) return null;

        const unitPrice =
          item.quantity ? (item.total || 0) / item.quantity : item.price || 0;

        return {
          ...item,
          quantity: newQty,
          totalCount: newQty,
          total: unitPrice * newQty,
        };
      })
      .filter(Boolean);
  }

  // 2) add the NEW edited batch items (full items with _id)
  if (Array.isArray(editedBatchItems)) {
    editedBatchItems.forEach((newItem) => {
      const id = newItem._id?.toString() || newItem.itemId?.toString();
      if (!id) return;

      const existingIndex = newItems.findIndex(
        (i) => i._id?.toString() === id
      );

      const qty = newItem.quantity || 0;
      const price = newItem.price || 0;
      const itemTotal = newItem.total ?? price * qty;

      if (existingIndex !== -1) {
        const existing = newItems[existingIndex];
        const newQty = (existing.quantity || 0) + qty;

        newItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalCount: newQty,
          total: (existing.total || 0) + itemTotal,
          price: price || existing.price,
        };
      } else {
        newItems.push({
          ...newItem,
          _id: id,
          quantity: qty,
          totalCount: qty,
          price,
          total: itemTotal,
        });
      }
    });
  }

  // 3) rebuild kitchenBatches and NORMALIZE items to { itemId, quantity, product_name }
  const rawBatches = (kotDataForEdit.kitchenBatches || [])
    .filter((b) => b.batchNo !== batchNo)
    .concat([
      {
        ...(kotDataForEdit.kitchenBatches?.find((b) => b.batchNo === batchNo) || {
          batchNo,
          printedAt: new Date().toISOString(),
          status: "pending",
        }),
        items: editedBatchItems,
      },
    ]);

  const updatedBatches = rawBatches.map((batch) => ({
    ...batch,
    items: (batch.items || []).map((it) => ({
      itemId: (it.itemId || it._id)?.toString(),
      quantity: it.quantity || 0,
      product_name: it.product_name,
    })),
  }));

  return { updatedItems: newItems, updatedBatches };
};