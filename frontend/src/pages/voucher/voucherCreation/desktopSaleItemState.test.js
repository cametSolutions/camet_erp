/* eslint-env node */
import test from "node:test";
import assert from "node:assert/strict";
import { addDesktopStockRow, applyDesktopPriceLevel, recalculateDesktopItem } from "./desktopSaleItemState.js";

const product = {
  _id: "tomato", product_name: "Tomato", hasGodownOrBatch: true,
  igst: 5, cgst: 2.5, sgst: 2.5, cess: 0, addl_cess: 0,
  Priceleveles: [{ _id: "retail", pricerate: 40 }, { _id: "wholesale", pricerate: 30 }],
  GodownList: [
    { godown_id: "shop", godown: "Shop", balance_stock: 20 },
    { godown_id: "warehouse", godown: "Warehouse", balance_stock: 100 },
  ],
};

test("adding from two godowns keeps stock identities and fractional quantities separate", () => {
  const first = addDesktopStockRow(product, null, 0, 1.5, 40);
  const both = addDesktopStockRow(product, first, 1, 2, 40);
  assert.deepEqual(both.GodownList.map(row => row.count), [1.5, 2]);
  assert.deepEqual(both.GodownList.map(row => row.godown_id), ["shop", "warehouse"]);
  assert.equal(both.total, 147);
  assert.equal(both.totalIgstAmt, 7);
  assert.equal(first.GodownList[1].added, false); // No mutation of the earlier bill.
  assert.equal(product.GodownList[0].count, undefined);
});

test("re-adding a removed godown matches identity instead of another godown's array index", () => {
  const warehouse = addDesktopStockRow(product, null, 1, 2, 40);
  const remaining = { ...warehouse, GodownList: [warehouse.GodownList[1]] };
  const result = addDesktopStockRow(product, remaining, 0, 1, 30);
  assert.deepEqual(result.GodownList.map(row => [row.godown_id, row.count]), [["warehouse", 2], ["shop", 1]]);
  assert.equal(result.total, 115.5);
});

test("changing price level recalculates taxes and keeps quantities and discounts", () => {
  const first = addDesktopStockRow(product, null, 0, 2, 40);
  first.GodownList[0].discountType = "percentage";
  first.GodownList[0].discountPercentage = 10;
  const result = applyDesktopPriceLevel(first, { _id: "wholesale" });
  assert.equal(result.GodownList[0].count, 2);
  assert.equal(result.GodownList[0].selectedPriceRate, 30);
  assert.equal(result.GodownList[0].discountAmount, 6);
  assert.equal(result.total, 56.7);
  assert.equal(result.totalIgstAmt, 2.7);
});

test("inclusive rates, cess and zero-rate rows use the ERP calculation independently", () => {
  const inclusive = { ...product, isTaxInclusive: true, igst: 5, cess: 1, addl_cess: 2 };
  const first = addDesktopStockRow(inclusive, null, 0, 2, 42);
  assert.equal(first.total, 88.8);
  assert.equal(first.totalCessAmt, .8);
  assert.equal(first.totalAddlCessAmt, 4);
  const free = addDesktopStockRow(product, null, 0, 1, 40);
  const result = addDesktopStockRow(product, free, 1, 1, 0);
  assert.equal(result.GodownList[1].individualTotal, 0);
  assert.equal(result.total, 42);
});

test("inactive godown rows do not contribute stale discounts or totals", () => {
  const first = addDesktopStockRow(product, null, 0, 1, 40);
  first.GodownList[1] = { ...first.GodownList[1], count: 8, discountAmount: 50, discountType: "amount" };
  const result = recalculateDesktopItem(first);
  assert.equal(result.total, 42);
  assert.equal(result.GodownList[1].count, 0);
});
