/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import { Plus } from "lucide-react";
import api from "../../../api/api";
import { addItem, resetPaymentSplit } from "../../../../slices/voucherSlices/commonVoucherSlice";
import { addDesktopStockRow, priceLevelRate } from "./desktopSaleItemState";

export default function DesktopProductEntry({ locked }) {
  const dispatch = useDispatch();
  const searchRef = useRef(null);
  const company = useSelector(state => state.secSelectedOrganization.secSelectedOrg);
  const { party, items, selectedPriceLevel, priceLevels } = useSelector(state => state.commonVoucherSlice);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState(null);
  const [stockIndex, setStockIndex] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [rate, setRate] = useState("");
  const [error, setError] = useState("");
  const focusNext = id => setTimeout(() => document.getElementById(id)?.focus(), 0);
  const disabled = locked || !party?._id || priceLevels === null;
  useEffect(() => {
    const timer = setTimeout(() => setSearch(input), 250);
    return () => clearTimeout(timer);
  }, [input]);
  useEffect(() => {
    setRate(product ? String(priceLevelRate(product, selectedPriceLevel)) : "");
  }, [product, selectedPriceLevel]);
  useEffect(() => {
    setProduct(null); setStockIndex(""); setError("");
  }, [company._id, party?._id]);
  const { data, isFetching, isError, fetchNextPage, hasNextPage, refetch } = useInfiniteQuery({
    queryKey: ["desktop-sale-products", company._id, search],
    initialPageParam: 1,
    queryFn: async ({ signal, pageParam }) => {
      const response = await api.get(`/api/sUsers/getProducts/${company._id}`, {
        params: { voucherType: "sales", page: pageParam, limit: 30, search }, withCredentials: true, signal,
      });
      return response.data;
    },
    getNextPageParam: (last, pages) => last.pagination?.hasMore ? pages.length + 1 : undefined,
    enabled: !!company._id && !disabled,
  });
  const options = data?.pages.flatMap(page => page.productData || []) || [];
  const stock = product?.GodownList?.[stockIndex];
  const valid = product && stock && Number(quantity) > 0 && rate !== "" && Number(rate) >= 0;
  const preview = valid ? addDesktopStockRow(product, null, Number(stockIndex), Number(quantity), Number(rate)).total : 0;
  const submit = event => {
    event.preventDefault();
    if (!valid || disabled) return;
    if (!Number.isFinite(Number(quantity)) || !Number.isFinite(Number(rate))) {
      setError("Enter a valid quantity and rate."); return;
    }
    const existing = items.find(item => item._id === product._id);
    dispatch(addItem({ payload: addDesktopStockRow(product, existing, Number(stockIndex), Number(quantity), Number(rate)), moveToTop: false }));
    dispatch(resetPaymentSplit());
    setProduct(null); setStockIndex(""); setQuantity("1"); setError("");
    searchRef.current?.focus();
  };
  return <form className="sales-product-entry" onSubmit={submit}>
    <div className="sales-product-fields">
      <div className="sales-product-search"><label htmlFor="desktop-sale-product">Code / Product</label>
        <Select ref={searchRef} inputId="desktop-sale-product" instanceId="desktop-sale-product" value={product}
          options={input === search ? options : []} filterOption={null} isClearable isDisabled={disabled}
          getOptionLabel={item => `${item.product_code || ""} ${item.product_name}`.trim()}
          getOptionValue={item => item._id} placeholder="Search code or name…"
          onInputChange={setInput} isLoading={isFetching || input !== search}
          onChange={value => { setProduct(value); setStockIndex(value?.GodownList?.length === 1 ? "0" : ""); setError(""); focusNext("desktop-stock-row"); }}
          onMenuScrollToBottom={() => { if (hasNextPage && !isFetching) fetchNextPage(); }}
          noOptionsMessage={() => isError ? "Unable to load products" : "No products found"}
          menuPortalTarget={document.body} menuPosition="fixed" maxMenuHeight={230}
          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minHeight: 30, fontSize: 12 }), valueContainer: base => ({ ...base, padding: "0 6px" }), indicatorsContainer: base => ({ ...base, height: 28 }), option: base => ({ ...base, fontSize: 12, padding: "7px 10px" }) }}
        />
      </div>
      <div><label htmlFor="desktop-stock-row">Godown / Batch</label><select id="desktop-stock-row" value={stockIndex} disabled={disabled || !product} required onChange={event => setStockIndex(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); focusNext("desktop-product-qty"); } }}>
        <option value="">Select godown</option>
        {product?.GodownList?.map((row, index) => <option key={index} value={index}>{[row.godown, row.batch].filter(Boolean).join(" / ") || "Default"} · Stock {row.balance_stock ?? 0}</option>)}
      </select></div>
      <div><label htmlFor="desktop-product-qty">Qty{product?.unit ? ` (${product.unit})` : ""}</label><input id="desktop-product-qty" type="number" min="0.001" step="0.001" required value={quantity} disabled={disabled || !product} onChange={event => setQuantity(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); focusNext("desktop-product-rate"); } }} /></div>
      <div><label htmlFor="desktop-product-rate">Rate</label><input id="desktop-product-rate" type="number" min="0" step="any" required value={rate} disabled={disabled || !product} onChange={event => setRate(event.target.value)} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} /></div>
      <div><label htmlFor="desktop-product-amount">Amount</label><output id="desktop-product-amount">{preview.toFixed(2)}</output></div>
      <button type="submit" className="sales-product-add" disabled={disabled || !valid} aria-label="Add product to sale"><Plus size={18} />Add</button>
    </div>
    {(error || stock || isError) && <div className="sales-product-hint" aria-live="polite">{error || (stock ? `Available stock: ${stock.balance_stock ?? 0} ${product.unit || ""}` : "")}
      {isError && <button type="button" onClick={() => refetch()}>Retry products</button>}
    </div>}
  </form>;
}
