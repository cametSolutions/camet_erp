import React, { useState } from 'react'

function ItemSelector({ items = [], onChange, onClose }) {
  const [selected, setSelected] = useState({})

  const buildOutput = (sel) =>
    items
      .filter((item) => sel[item.id] !== undefined)
      .map((item) => ({ ...item, selectedQty: sel[item.id] }))

  const toggle = (item) => {
    setSelected((prev) => {
      const next = { ...prev }
      if (next[item.id] !== undefined) {
        delete next[item.id]
      } else {
        next[item.id] = item.quantity
      }
      onChange?.(buildOutput(next))
      return next
    })
  }

  const setQty = (id, qty) => {
    setSelected((prev) => {
      const next = { ...prev, [id]: qty }
      onChange?.(buildOutput(next))
      return next
    })
  }

  const selectedCount = Object.keys(selected).length
  const output = buildOutput(selected)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

        .is-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
          animation: overlayIn .2s ease;
        }
        @media (min-width: 480px) {
          .is-overlay { align-items: center; padding: 20px; }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .is-modal {
          font-family: 'Sora', sans-serif;
          background: #fff;
          border-radius: 22px 22px 0 0;
          width: 100%;
          max-width: 440px;
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -4px 32px rgba(0,0,0,0.15);
          animation: modalUp .28s cubic-bezier(.22,1,.36,1);
        }
        @media (min-width: 480px) {
          .is-modal {
            border-radius: 22px;
            box-shadow: 0 8px 48px rgba(0,0,0,0.18);
            animation: modalScale .25s cubic-bezier(.22,1,.36,1);
          }
        }
        @keyframes modalUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes modalScale {
          from { transform: scale(.96) translateY(8px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);   opacity: 1; }
        }

        /* drag handle (mobile) */
        .is-handle {
          width: 36px; height: 4px;
          background: #e8e3db;
          border-radius: 4px;
          margin: 10px auto 0;
          flex-shrink: 0;
        }
        @media (min-width: 480px) { .is-handle { display: none; } }

        /* ── Header ── */
        .is-head {
          padding: 14px 18px 13px;
          border-bottom: 1px solid #f0ebe3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          background: #faf8f4;
        }
        .is-head-left {}
        .is-head-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a1714;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .is-head-sub {
          font-size: 11px;
          color: #9c948a;
          margin-top: 3px;
        }
        .is-head-right { display: flex; align-items: center; gap: 8px; }
        .is-count-pill {
          font-size: 11px;
          font-weight: 700;
          background: #e05c2a;
          color: #fff;
          padding: 4px 10px;
          border-radius: 20px;
        }
        .is-close-btn {
          width: 30px; height: 30px;
          border: 1.5px solid #e8e3db;
          border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: #9c948a;
          transition: all .15s;
          flex-shrink: 0;
        }
        .is-close-btn:hover { background: #f6f4f0; color: #1a1714; border-color: #ccc7be; }

        /* ── Scrollable list ── */
        .is-list {
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
          flex: 1;
        }
        .is-list::-webkit-scrollbar { width: 4px; }
        .is-list::-webkit-scrollbar-thumb { background: #e8e3db; border-radius: 4px; }

        /* ── Row ── */
        .is-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border: 1.5px solid #e8e3db;
          border-radius: 12px;
          cursor: pointer;
          transition: all .15s;
          background: #fff;
          user-select: none;
        }
        .is-row:hover { background: #fdfcfa; border-color: #ccc7be; }
        .is-row.sel   { border-color: #e05c2a; background: #fff3ee; }

        .is-chk {
          width: 20px; height: 20px;
          border: 2px solid #e8e3db;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all .15s;
          background: #fff;
        }
        .is-row.sel .is-chk { background: #e05c2a; border-color: #e05c2a; }
        .is-chk-mark { opacity: 0; transform: scale(.5); transition: all .15s; }
        .is-row.sel .is-chk-mark { opacity: 1; transform: scale(1); }

        .is-name {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: #1a1714;
          line-height: 1.3;
        }
        .is-row.sel .is-name { color: #e05c2a; }

        .is-max {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #9c948a;
          background: #f6f4f0;
          border: 1px solid #e8e3db;
          border-radius: 5px;
          padding: 2px 6px;
          flex-shrink: 0;
        }
        .is-row.sel .is-max {
          background: rgba(224,92,42,.1);
          border-color: rgba(224,92,42,.3);
          color: #e05c2a;
        }

        .is-qty {
          display: flex;
          align-items: center;
          border: 1.5px solid #e8e3db;
          border-radius: 9px;
          overflow: hidden;
          flex-shrink: 0;
          transition: border-color .15s;
          background: #fff;
        }
        .is-row.sel .is-qty { border-color: #e05c2a; }

        .is-qty-btn {
          width: 30px; height: 30px;
          border: none;
          background: transparent;
          font-size: 17px;
          color: #9c948a;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .12s;
          line-height: 1;
          padding-bottom: 1px;
        }
        .is-qty-btn:hover:not(:disabled) { background: #f6f4f0; color: #1a1714; }
        .is-qty-btn:disabled { opacity: .25; cursor: not-allowed; }
        .is-row.sel .is-qty-btn { color: #e05c2a; }
        .is-row.sel .is-qty-btn:hover:not(:disabled) { background: #fff3ee; }

        .is-qty-val {
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #1a1714;
          min-width: 22px;
          text-align: center;
        }
        .is-row.sel .is-qty-val { color: #e05c2a; }

        /* ── Footer ── */
        .is-foot {
          border-top: 1px solid #f0ebe3;
          background: #faf8f4;
          padding: 12px 14px;
          flex-shrink: 0;
        }
        .is-foot-empty { font-size: 12px; color: #9c948a; text-align: center; padding: 2px 0; }
        .is-foot-title {
          font-size: 10px; font-weight: 700;
          letter-spacing: .7px; text-transform: uppercase;
          color: #9c948a; margin-bottom: 6px;
        }
        .is-foot-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 2px 0;
        }
        .is-foot-name {
          font-size: 12px; font-weight: 500; color: #4a4540;
          flex: 1; white-space: nowrap; overflow: hidden;
          text-overflow: ellipsis; margin-right: 8px;
        }
        .is-foot-qty {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px; font-weight: 600; color: #e05c2a;
        }

        /* ── Confirm button ── */
        .is-confirm {
          margin: 10px 14px 14px;
          padding: 13px;
          background: #1a1714;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: 'Sora', sans-serif;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          transition: all .15s;
          flex-shrink: 0;
        }
        .is-confirm:hover { background: #2d2926; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.2); }
        .is-confirm:active { transform: none; box-shadow: none; }
        .is-confirm:disabled { opacity: .4; cursor: not-allowed; transform: none; box-shadow: none; }

        .is-empty {
          padding: 40px 16px;
          text-align: center;
          color: #9c948a;
          font-size: 13px;
        }
      `}</style>

      {/* Overlay */}
      <div className="is-overlay" onClick={onClose}>
        <div className="is-modal" onClick={(e) => e.stopPropagation()}>

          {/* Drag handle */}
          <div className="is-handle" />

          {/* Header */}
          <div className="is-head">
            <div className="is-head-left">
              <div className="is-head-title">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
                Select Items
              </div>
              <div className="is-head-sub">Tap to select · adjust quantity</div>
            </div>
            <div className="is-head-right">
              {selectedCount > 0 && (
                <div className="is-count-pill">{selectedCount} selected</div>
              )}
              <button className="is-close-btn" onClick={onClose}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          {items.length === 0 ? (
            <div className="is-empty">No items available</div>
          ) : (
            <div className="is-list">
              {items.map((item) => {
                const isSel = selected[item.id] !== undefined
                const qty   = isSel ? selected[item.id] : item.quantity

                return (
                  <div
                    key={item.id}
                    className={`is-row ${isSel ? 'sel' : ''}`}
                    onClick={() => toggle(item)}
                  >
                    <div className="is-chk">
                      <span className="is-chk-mark">
                        <svg width="10" height="10" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      </span>
                    </div>

                    <span className="is-name">{item.product_name}</span>
                    <span className="is-max">max {item.quantity}</span>

                    <div
                      className="is-qty"
                      style={{ opacity: isSel ? 1 : 0.3, pointerEvents: isSel ? 'auto' : 'none' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="is-qty-btn"
                        disabled={qty <= 1}
                        onClick={() => setQty(item.id, qty - 1)}
                      >−</button>
                      <span className="is-qty-val">{qty}</span>
                      <button
                        className="is-qty-btn"
                        disabled={qty >= item.quantity}
                        onClick={() => setQty(item.id, qty + 1)}
                      >+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer summary */}
          <div className="is-foot">
            {selectedCount === 0 ? (
              <div className="is-foot-empty">No items selected</div>
            ) : (
              <>
                <div className="is-foot-title">Selected ({selectedCount})</div>
                {output.map((item) => (
                  <div className="is-foot-row" key={item.id}>
                    <span className="is-foot-name">{item.product_name}</span>
                    <span className="is-foot-qty">×{item.selectedQty}</span>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Confirm CTA */}
          <button
            className="is-confirm"
            disabled={selectedCount === 0}
            onClick={() => {
              onChange?.(output)
              onClose?.()
            }}
          >
            Confirm Selection
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

        </div>
      </div>
    </>
  )
}

export default ItemSelector