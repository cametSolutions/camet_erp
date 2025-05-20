import { removeAll } from "../../../slices/invoiceSecondary";
import { removeAllSales } from "../../../slices/salesSecondary";
import { removeAllSales as removeAllForCommonVoucher } from "../../../slices/voucherSlices/commonVoucherSlice";
import { removeAll as removeAllStock } from "../../../slices/stockTransferSecondary";
import { removeAll as removeAllPurchase } from "../../../slices/purchase";
import { removeAll as removeAllCredit } from "../../../slices/creditNote";
import { removeAll as removeAllDebit } from "../../../slices/debitNote";
import { removeAll as removeAllPayment } from "../../../slices/payment";
import { removeAll as removeAllReceipt } from "../../../slices/receipt";
import { removeAll as removeAllDate } from "../../../slices/filterSlices/date";
import { removeAll as removeAllUser } from "../../../slices/filterSlices/userFilter";
import { removeAll as removeAllVoucherType } from "../../../slices/filterSlices/voucherType";
import { removeAll as removeAllParty } from "../../../slices/filterSlices/partyFIlter";
import { removeAll as removeAllStatus } from "../../../slices/filterSlices/statusFilter";
import { removeAll as removeAllParties } from "../../../slices/partySlice";
import { removeAll as removeAllBarcode } from "../../../slices/barcodeSlice";
import { removeAll as removeAllTally } from "../../../slices/tallyDataSlice";
import { removeAll as removeAllPaymentSplitting } from "../../../slices/filterSlices/paymentSplitting/paymentSplitting";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

function RemoveReduxData() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Dispatch all the remove actions when the component mounts
    dispatch(removeAll());
    dispatch(removeAllSales());
    dispatch(removeAllStock());
    dispatch(removeAllPurchase());
    dispatch(removeAllCredit());
    dispatch(removeAllDebit());
    dispatch(removeAllPayment());
    dispatch(removeAllReceipt());
    dispatch(removeAllDate());
    dispatch(removeAllVoucherType());
    dispatch(removeAllParty());
    dispatch(removeAllStatus());
    dispatch(removeAllParties());
    dispatch(removeAllPaymentSplitting());
    dispatch(removeAllBarcode());
    dispatch(removeAllTally());
    dispatch(removeAllUser());
    dispatch(removeAllForCommonVoucher());

    localStorage.removeItem("voucherType");
  }, [dispatch]); // Adding dispatch to the dependency array

  return (
    <div>
      
    </div>
  );
}

export default RemoveReduxData;
