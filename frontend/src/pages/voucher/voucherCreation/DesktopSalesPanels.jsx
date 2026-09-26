/* eslint-disable react/prop-types */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Search, Printer, Trash2, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import DesktopProductEntry from "./DesktopProductEntry";
import EditItemVoucher from "./EditItemVoucher";
import api from "../../../api/api";
import { removeItem, removeGodownOrBatch, resetPaymentSplit } from "../../../../slices/voucherSlices/commonVoucherSlice";

const money = (value) => Number(value || 0).toFixed(2);

export function DesktopSalesItems({ items, convertedFrom }) {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const locked = convertedFrom.length > 0;
  const rows = items.flatMap((item) => (item.GodownList || []).flatMap((batch, index) =>
    item.hasGodownOrBatch && !batch.added ? [] : [{ item, batch, index }]
  ));

  return (
    <section className="sales-items-panel">
      <DesktopProductEntry locked={locked} />
      <div className="sales-items-scroll">
        <table className="sales-desktop-table">
          <colgroup><col style={{ width: 32 }} /><col style={{ width: 68 }} /><col /><col style={{ width: 45 }} /><col style={{ width: 55 }} /><col style={{ width: 75 }} /><col style={{ width: 85 }} /><col style={{ width: 65 }} /></colgroup>
          <thead><tr>{["SL", "Code", "Item", "Unit", "Qty", "Rate", "Amount", "Action"].map(label => <th key={label}>{label}</th>)}</tr></thead>
          <tbody>{rows.map(({ item, batch, index }, row) => (
            <tr key={`${item._id}-${index}`}>
              <td>{row + 1}</td><td>{item.product_code || "—"}</td>
              <td><div className="sales-item-description" title={`${item.product_name} · ${[batch.batch, batch.godown].filter(Boolean).join(" · ")} · Tax ${item.igst || 0}%${batch.discountType === "amount" ? ` · Discount ₹${money(batch.discountAmount)}` : batch.discountPercentage ? ` · Discount ${batch.discountPercentage}%` : ""}`}><strong>{item.product_name}</strong><small>{[batch.batch, batch.godown].filter(Boolean).join(" · ")} · Tax {item.igst || 0}%{batch.discountType === "amount" ? ` · Discount ₹${money(batch.discountAmount)}` : batch.discountPercentage ? ` · Discount ${batch.discountPercentage}%` : ""}</small></div></td>
              <td>{item.unit}</td><td>{batch.count}</td><td>{money(batch.selectedPriceRate)}</td><td>{money(batch.individualTotal ?? item.total)}</td>
              <td><div className="sales-row-actions"><button type="button" aria-label={`Edit ${item.product_name} ${batch.godown || batch.batch || ""}`} disabled={locked} onClick={() => setEditing({ id: item._id, index, name: item.product_name, godown: batch.godown, batch: batch.batch })}><Pencil size={15} /></button>
                <button type="button" disabled={locked} aria-label={`Remove ${item.product_name}`} onClick={() => {
                  dispatch(item.hasGodownOrBatch ? removeGodownOrBatch({ id: item._id, idx: index }) : removeItem(item._id));
                  dispatch(resetPaymentSplit());
                }}><Trash2 size={15} /></button></div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <Dialog open={!!editing} onOpenChange={open => { if (!open) setEditing(null); }}>
        <DialogContent className="sales-edit-dialog max-w-3xl max-h-[90dvh] overflow-y-auto bg-white">
          <DialogTitle>Edit {editing?.name}</DialogTitle>
          <DialogDescription>{[editing?.godown, editing?.batch].filter(Boolean).join(" / ") || "Update product quantity, price and discount."}</DialogDescription>
          {editing && <EditItemVoucher key={`${editing.id}-${editing.index}`} itemId={editing.id} godownIndex={editing.index} onClose={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export function DesktopSalesTotals({ subtotal, charges, total, received, balance, onEditCharges, onOpenOptions, onApplyReceived }) {
  const company = useSelector(state => state.secSelectedOrganization.secSelectedOrg);
  const party = useSelector(state => state.commonVoucherSlice.party);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cashValue, setCashValue] = useState("");
  const [upiValue, setUpiValue] = useState("");
  const [chequeValue, setChequeValue] = useState("");
  const [cashSource, setCashSource] = useState("");
  const [upiSource, setUpiSource] = useState("");
  const [chequeSource, setChequeSource] = useState("");
  const [receiveError, setReceiveError] = useState("");
  const { data: sources = { cashs: [], banks: [] }, isLoading: sourcesLoading } = useQuery({
    queryKey: ["bankAndCashSources", company?._id],
    queryFn: async () => (await api.get(`/api/sUsers/getBankAndCashSources/${company._id}`, { withCredentials: true })).data.data,
    enabled: receiveOpen && !!company?._id,
    staleTime: 60_000,
  });
  const openReceive = () => {
    if (Number(total) <= 0) return;
    setCashValue(String(Number(received?.cash || 0).toFixed(2)));
    setUpiValue(String(Number(received?.upi || 0).toFixed(2)));
    setChequeValue(String(Number(received?.cheque || 0).toFixed(2)));
    setCashSource(received?.cashSource || "");
    setUpiSource(received?.upiSource || "");
    setChequeSource(received?.chequeSource || "");
    setReceiveError("");
    setReceiveOpen(true);
  };
  const applyReceived = event => {
    event.preventDefault();
    const cash = Number(cashValue);
    const upi = Number(upiValue);
    const cheque = Number(chequeValue);
    if (!Number.isFinite(cash) || !Number.isFinite(upi) || !Number.isFinite(cheque) || cash < 0 || upi < 0 || cheque < 0) {
      setReceiveError("Enter valid payment amounts.");
      return;
    }
    if ((cash > 0 && !cashSource) || (upi > 0 && !upiSource) || (cheque > 0 && !chequeSource)) {
      setReceiveError("Select a source for every payment amount entered.");
      return;
    }
    const amount = cash + upi + cheque;
    if (amount > Number(total || 0)) {
      setReceiveError("Received amount cannot be greater than the net amount.");
      return;
    }
    onApplyReceived({ cash, upi, cheque, cashSource, upiSource, chequeSource });
    setReceiveOpen(false);
  };
  const receivedTotal = Number(received?.cash || 0) + Number(received?.upi || 0) + Number(received?.cheque || 0);
  const enteredTotal = Number(cashValue || 0) + Number(upiValue || 0) + Number(chequeValue || 0);
  return <div className="sales-desktop-totals">
    <div className="sales-options-total"><span>Options</span><button type="button" onClick={onOpenOptions} aria-haspopup="dialog">More options</button></div>
    {[
    ["Subtotal", subtotal], ["Additional charges", charges], ["Net Amount", total], ["Received", received], ["Balance", balance],
    ].map(([label, value]) => <div key={label}><span>{label}</span>{label === "Additional charges" ? <button type="button" className="sales-charge-total" onClick={onEditCharges} aria-label="Edit additional charges" aria-haspopup="dialog"><span>₹</span>{money(value)}</button> : label === "Received" ? <button type="button" className="sales-received-total" disabled={Number(total) <= 0} onClick={openReceive} aria-haspopup="dialog"><span>₹</span>{money(receivedTotal)}</button> : <output><span>₹</span>{money(value)}</output>}</div>)}
    <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
      <DialogContent className="sales-receive-dialog">
        <DialogTitle>Receive payment</DialogTitle>
        <DialogDescription>Enter the amount received for this sale.</DialogDescription>
        <form onSubmit={applyReceived}>
          <div className="sales-receive-head"><span>Payment method</span><span>Source</span><span>Amount</span></div>
          <div className="sales-receive-method"><label htmlFor="desktop-cash-source">Cash</label><select id="desktop-cash-source" value={cashSource} onChange={event => setCashSource(event.target.value)}><option value="">Select cash</option>{sources.cashs?.map(source => <option key={source.cash_id || source._id} value={source.cash_id || source._id}>{source.cash_ledname}</option>)}</select><div><span>₹</span><input id="desktop-cash-amount" autoFocus type="number" min="0" max={total} step="0.01" value={cashValue} onChange={event => setCashValue(event.target.value)} /></div></div>
          <div className="sales-receive-method"><label htmlFor="desktop-upi-source">NEFT / UPI / Card / Bank</label><select id="desktop-upi-source" value={upiSource} onChange={event => setUpiSource(event.target.value)}><option value="">Select bank</option>{sources.banks?.map(source => <option key={source.bank_id || source._id} value={source.bank_id || source._id}>{source.bank_ledname}</option>)}</select><div><span>₹</span><input id="desktop-upi-amount" type="number" min="0" max={total} step="0.01" value={upiValue} onChange={event => setUpiValue(event.target.value)} /></div></div>
          <div className="sales-receive-method"><label htmlFor="desktop-cheque-source">Cheque</label><select id="desktop-cheque-source" value={chequeSource} onChange={event => setChequeSource(event.target.value)}><option value="">Select bank</option>{sources.banks?.map(source => <option key={source.bank_id || source._id} value={source.bank_id || source._id}>{source.bank_ledname}</option>)}</select><div><span>₹</span><input id="desktop-cheque-amount" type="number" min="0" max={total} step="0.01" value={chequeValue} onChange={event => setChequeValue(event.target.value)} /></div></div>
          <div className="sales-receive-method sales-receive-credit"><label>Credit</label><output>{party?.partyName || "No customer selected"}</output><output>₹ {money(Math.max(0, Number(total || 0) - enteredTotal))}</output></div>
          {sourcesLoading && <p>Loading payment sources…</p>}
          {receiveError && <p className="sales-receive-error">{receiveError}</p>}
          <p>Net amount: ₹ {money(total)} · Received: ₹ {money(enteredTotal)} · Balance: ₹ {money(Math.max(0, Number(total || 0) - enteredTotal))}</p>
          <footer><button type="button" onClick={() => setReceiveOpen(false)}>Cancel</button><button type="submit">Apply</button></footer>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}

export function DesktopRecentSales({ cmpId, isAdmin, onEdit }) {
  const [search, setSearch] = useState("");
  const { data = [], isLoading, error, refetch, isFetching, dataUpdatedAt } = useQuery({
    queryKey: ["todaysTransaction", cmpId, isAdmin],
    queryFn: async () => {
      const response = await api.get(`/api/sUsers/transactions/${cmpId}?todayOnly=true&isAdmin=${isAdmin}`, { withCredentials: true });
      return response.data.data.combined;
    },
    enabled: !!cmpId,
    refetchOnWindowFocus: false,
    staleTime: isAdmin ? 5 * 60 * 1000 : Infinity,
    refetchInterval: isAdmin ? 5 * 60 * 1000 : false,
    retry: 1,
  });
  const sales = data.filter(item => item.type === "Tax Invoice" &&
    [item.party_name, item.voucherNumber, item.type].some(value => String(value || "").toLowerCase().includes(search.toLowerCase())));
  return <aside className="sales-recent-panel">
    <header><h2>Recent Transactions</h2><span>{sales.length} records</span></header>
    <label className="sales-recent-search"><Search size={20} /><input aria-label="Search recent sales" placeholder="Search by party, document, or type..." value={search} onChange={event => setSearch(event.target.value)} /></label>
    <div className="sales-recent-scroll"><table className="sales-desktop-table"><thead><tr>{["BILL NO", "DATE", "PARTY", "NET", "PRINT"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
      {sales.map(sale => <tr key={sale._id} onDoubleClick={() => !sale.isCancelled && onEdit?.(sale)} className={!sale.isCancelled ? "sales-recent-editable" : undefined} title={!sale.isCancelled ? "Double-click to edit this sale" : "Cancelled sale"}><td><Link to={`/sUsers/salesDetails/${sale._id}`} state={{ from: "dashboard" }}>{sale.voucherNumber}</Link></td><td>{new Date(sale.date).toLocaleDateString("en-GB")}</td><td>{sale.party_name}{sale.isCancelled && <small>Cancelled</small>}</td><td>{money(sale.enteredAmount)}</td><td><Link aria-label={`Print sale ${sale.voucherNumber}`} to={`/sUsers/sharesales/${sale._id}`}><Printer size={17} /></Link></td></tr>)}
      {(isLoading || error || !sales.length) && <tr><td colSpan={5} className="sales-status">{isLoading ? "Loading transactions…" : error ? <><p>Unable to load transactions.</p><button type="button" disabled={isFetching} onClick={() => refetch()}>Retry</button></> : search ? "No matching transactions" : "No sales today"}</td></tr>}
    </tbody></table></div>
    <footer>{dataUpdatedAt ? `Last updated: ${new Date(dataUpdatedAt).toLocaleTimeString()}` : "Today's sales"}</footer>
  </aside>;
}
