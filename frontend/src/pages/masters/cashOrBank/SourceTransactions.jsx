import { useParams } from "react-router-dom";
import useFetch from "../../../customHook/useFetch";
import { useSelector } from "react-redux";
import TitleDiv from "../../../components/common/TitleDiv";
import SelectDate from "../../../components/Filters/SelectDate";
import DashboardTransaction from "../../../components/common/DashboardTransaction";
import { MdDoNotDisturbOnTotalSilence } from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FaDotCircle } from "react-icons/fa";

function SourceTransactions() {
  const [settlements, setSettlements] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const { start, end } = useSelector((state) => state.date);
  const { id, accGroup } = useParams();
  const location = useLocation();
  const { data, loading } = useFetch(
    `/api/sUsers/findSourceTransactions/${cmp_id}/${id}?startOfDayParam=${start}&endOfDayParam=${end}&accGroup=${accGroup}`
  );

  useEffect(() => {
    if (data?.data?.settlements) {
      setSettlements(data?.data?.settlements);
      setOpeningBalance(data?.data?.openingBalance);

      // setSettlements([])
    }
  }, [data]);

  return (
    <div>
      <div className="sticky top-0 z-50">
        <TitleDiv title="Transactions" loading={loading} />

        <section className="shadow-lg border-b  ">
          <SelectDate />
        </section>

        <section className="flex items-center  text-gray-500 bg-white font-bold text-xs gap-1  py-2 px-3 border-b ">
          <MdDoNotDisturbOnTotalSilence className="inline-block" />
          <p className="">
            Total : {data?.data?.total} ({data?.data?.settlements?.length}){" "}
          </p>
        </section>
        <section className="flex items-center  text-gray-500 bg-gray-100 font-bold text-xs gap-1  py-2 px-3  ">
          <FaDotCircle className="inline-block" size={10} />
          <p className="">Opening Balance: {openingBalance}</p>
        </section>

        <hr className="" />
      </div>

      {settlements?.length === 0 ? (
        <div className="flex justify-center items-center mt-10 ">
          <h1 className="text-sm font-bold text-gray-600">No Data Found</h1>
        </div>
      ) : (
        <>
          <section className="z-10">
            <DashboardTransaction
              filteredData={settlements}
              userType="secondary"
              from={location?.state?.from}
            />
          </section>
          <section className="flex items-center  text-gray-500 bg-slate-100 font-bold text-xs gap-1  py-2 px-3  border-t  mb-4">
            <FaDotCircle className="inline-block" size={10}  />
            <p className="">
              Closing Balance:{" "}
              {(data?.data?.total || 0) + (openingBalance || 0)}
            </p>
          </section>
        </>
      )}
    </div>
  );
}

export default SourceTransactions;
