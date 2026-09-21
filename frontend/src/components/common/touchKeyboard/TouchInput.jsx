/* eslint-disable react/prop-types */
import { forwardRef, useContext, useEffect, useRef } from "react";
import { TouchKeyboardContext } from "./TouchKeyboardScope";
import { editValue } from "./editValue";

const TouchInput = forwardRef(function TouchInput({ as: Tag = "input", keyboardType, allowDecimal: decimalOverride, ...props }, forwardedRef) {
  const keyboard = useContext(TouchKeyboardContext);
  const element = useRef(null);
  const field = useRef({});
  // Only retain numeric editing syntax lost by existing parseFloat handlers
  // (e.g. the dot in "1." or zero in "1.05"). The form remains authoritative.
  const numericToken = useRef(null);
  const numeric = keyboardType === "number" || props.type === "number" || props.type === "tel";
  const allowDecimal = decimalOverride ?? (numeric && (props.inputMode === "decimal" || props.step === "any" || Number(props.step) % 1 > 0));
  const enabled = keyboard && !props.disabled && !props.readOnly && props.onChange &&
    (Tag === "textarea" || [undefined, "text", "search", "tel", "number", "email"].includes(props.type));

  field.current = {
    element: element.current, numeric, allowDecimal,
    press(key) {
      const input = element.current;
      if (!enabled || !input?.isConnected) return keyboard?.close(field);
      const value = String(props.value ?? "");
      const token = numericToken.current;
      const current = props.type === "number" && token !== null && Number(token) === Number(value) ? token : value;
      const edit = editValue(current, key, input.selectionStart, input.selectionEnd, {
        numeric, allowDecimal, maxLength: props.maxLength, max: props.max,
      });
      if (!edit) return;
      numericToken.current = props.type === "number" ? edit.value : null;
      // Every existing KOT handler consumes target.value; call that same handler.
      const target = { value: edit.value, name: props.name, id: props.id };
      props.onChange({ target, currentTarget: target, type: "change" });
      if (input.selectionStart !== null) {
        requestAnimationFrame(() => {
          if (input.isConnected) input.setSelectionRange(edit.caret, edit.caret);
        });
      }
    },
  };
  useEffect(() => () => keyboard?.close(field), [keyboard]);
  useEffect(() => { if (!enabled) keyboard?.close(field); }, [enabled, keyboard]);
  const open = () => { if (enabled) keyboard.open(field); };
  return <Tag {...props}
    ref={(node) => {
      element.current = node;
      field.current.element = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    }}
    data-kot-touch-input={enabled ? "true" : undefined}
    inputMode={enabled ? "none" : props.inputMode}
    onFocus={(event) => { props.onFocus?.(event); open(); }}
    onClick={(event) => { props.onClick?.(event); open(); }}
    onChange={(event) => { numericToken.current = null; props.onChange?.(event); }}
    onBlur={(event) => {
      numericToken.current = null;
      props.onBlur?.(event);
      if (!event.relatedTarget?.closest("[data-kot-touch-input], .kot-touch-keyboard")) keyboard?.close(field);
    }}
    onKeyDown={(event) => {
      props.onKeyDown?.(event);
      if (enabled && !event.defaultPrevented && (event.key === "Escape" || (event.key === "Enter" && Tag !== "textarea"))) {
        keyboard?.close(field);
      }
    }} />;
});
export default TouchInput;
