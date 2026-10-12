// Stock updates aggregate product variants independently of their prices and taxes.
export function creditNoteStockItems(items) {
  const products = new Map();
  for (const item of items || []) {
    const id = String(item._id);
    if (!products.has(id)) products.set(id, { ...item, totalCount: 0, totalActualCount: 0, GodownList: [] });
    const product = products.get(id);
    product.totalCount += Number(item.totalCount || 0);
    product.totalActualCount += Number(item.totalActualCount ?? item.totalCount ?? 0);
    for (const row of item.GodownList || []) {
      if (row.added === false) continue;
      const key = stock => JSON.stringify([
        item.gdnEnabled ? String(stock.godownMongoDbId || stock.godown_id || '') : '',
        item.batchEnabled ? stock.batch || '' : '',
      ]);
      const existing = product.GodownList.find(stock => key(stock) === key(row));
      if (existing) {
        existing.count += Number(row.count || 0);
        existing.actualCount += Number(row.actualCount ?? row.count ?? 0);
      } else product.GodownList.push({ ...row, count: Number(row.count || 0), actualCount: Number(row.actualCount ?? row.count ?? 0) });
    }
  }
  return [...products.values()];
}
