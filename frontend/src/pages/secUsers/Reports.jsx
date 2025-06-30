import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from "react-router-dom";
import VoucherSection from "../../components/secUsers/vouchers/VoucherSection";
import RemoveReduxData from "../../components/secUsers/RemoveReduxData";
function Reports() {

  return (
    <div>
      <RemoveReduxData/>
      <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
        <Link to="/sUsers/dashboard">
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
        </Link>
        <p className="text-white text-lg   font-bold ">Reports</p>
      </div>

      <section className="p-6 ">
        <VoucherSection title="Popular" tab="popular" />
   
      </section>
    </div>
  );
}

export default Reports;
