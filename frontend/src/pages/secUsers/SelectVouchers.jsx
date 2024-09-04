import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import VoucherSection from "../../components/secUsers/vouchers/VoucherSection";

function SelectVouchers() {
  return (
    <div>
      <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to={-1}>
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
