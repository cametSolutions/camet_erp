import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import VoucherSection from "../../components/secUsers/vouchers/VoucherSection";

import { removeAll } from "../../../slices/invoiceSecondary";
import { removeAllSales } from "../../../slices/salesSecondary";
import { removeAll as removeAllStock } from "../../../slices/stockTransferSecondary";
import { removeAll as removeAllPurchase } from "../../../slices/purchase";
import { removeAll as removeAllCredit } from "../../../slices/creditNote";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

function SelectVouchers() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(removeAll());
    dispatch(removeAllSales());
    dispatch(removeAllStock());
    dispatch(removeAllPurchase());
    dispatch(removeAllCredit());
  }, []);

  return (
    <div>
      <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to="/sUsers/dashboard">
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
        </Link>
        <p className="text-white text-lg   font-bold ">Vouchers</p>
      </div>

      <section className="p-6 ">
        <VoucherSection title="Sales Transactions" tab="sales" />
        <VoucherSection title="Purchase Transactions" tab="purchase" />
        <VoucherSection title="Other Transactions" tab="others" />
      </section>
    </div>
  );
}

export default SelectVouchers;
