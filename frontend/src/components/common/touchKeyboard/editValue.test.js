/* eslint-env node */
import test from "node:test";
import assert from "node:assert/strict";
import { editValue } from "./editValue.js";

test("inserts at caret and replaces selected text", () => {
  assert.deepEqual(editValue("rice", "Spicy ", 0, 0), { value: "Spicy rice", caret: 6 });
  assert.deepEqual(editValue("rice", "tea", 0, 4), { value: "tea", caret: 3 });
});
test("backspace removes selection or previous character and clear resets", () => {
  assert.equal(editValue("rice", "Backspace", 1, 3).value, "re");
  assert.equal(editValue("rice", "Backspace", 2, 2).value, "rce");
  assert.equal(editValue("rice", "Backspace", 0, 0).value, "rice");
  assert.equal(editValue("rice", "Clear").value, "");
});
test("integer/mobile fields reject decimals, signs and letters, and honor length", () => {
  const rules = { numeric: true, maxLength: 10 };
  for (const key of [".", "-", "a", " "]) assert.equal(editValue("12", key, null, null, rules), null);
  assert.equal(editValue("1234567890", "1", null, null, rules), null);
  assert.equal(editValue("012", "3", null, null, rules).value, "0123");
});
test("fractional quantities allow intermediate decimals and reject a second dot", () => {
  const rules = { numeric: true, allowDecimal: true };
  assert.equal(editValue("", ".", null, null, rules).value, "0.");
  assert.equal(editValue("0.", "5", null, null, rules).value, "0.5");
  assert.equal(editValue("1.0", "5", null, null, rules).value, "1.05");
  assert.equal(editValue("1.5", ".", null, null, rules), null);
});
test("numeric upper bounds apply, including replacing a selection", () => {
  const rules = { numeric: true, max: 100 };
  assert.equal(editValue("100", "1", null, null, rules), null);
  assert.equal(editValue("100", "5", 0, 3, rules).value, "5");
  assert.equal(editValue("100", "Clear", null, null, rules).value, "");
});
