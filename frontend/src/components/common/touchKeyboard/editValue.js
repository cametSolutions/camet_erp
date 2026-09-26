// Pure editing rules shared by the touch input adapter and its regression tests.
export function editValue(value, key, start, end, rules = {}) {
  const text = String(value ?? "");
  const from = start ?? text.length;
  const to = end ?? from;
  let next;
  let caret;
  if (key === "Clear") {
    next = "";
    caret = 0;
  } else if (key === "Backspace") {
    const cut = from === to ? Math.max(0, from - 1) : from;
    next = text.slice(0, cut) + text.slice(to);
    caret = cut;
  } else {
    next = text.slice(0, from) + key + text.slice(to);
    caret = from + key.length;
  }
  if (rules.maxLength >= 0 && next.length > rules.maxLength) return null;
  if (rules.numeric) {
    const pattern = rules.allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (!pattern.test(next)) return null;
    if (next === ".") next = "0.";
    // Lower bounds are committed on blur, allowing intermediate 0 in 0.5.
    if (next !== "" && rules.max !== undefined && Number(next) > Number(rules.max)) return null;
  }
  return { value: next, caret: next === "0." ? 2 : caret };
}
