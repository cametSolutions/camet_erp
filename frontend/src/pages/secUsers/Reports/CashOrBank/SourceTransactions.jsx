import { useParams } from "react-router-dom";
import useFetch from "../../../../customHook/useFetch";
import { useSelector } from "react-redux";
import TitleDiv from "../../../../components/common/TitleDiv";
import SelectDate from "../../../../components/Filters/SelectDate";
import DashboardTransaction from "../../../../components/common/DashboardTransaction";
import { MdDoNotDisturbOnTotalSilence } from "react-icons/md";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function SourceTransactions() {
  const [settlements, setSettlements] = useState([]);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const { start, end } = useSelector((state) => state.date);
  const { id, accGroup } = useParams();
  const location = useLocation();
  const { data, loading } = useFetch(
    `/api/sUsers/findSourceTransactions/${cmp_id}/${id}?startOfDayParam=${start}&endOfDayParam=${end}&accGroup=${accGroup}`
  );

  useEffect(()=>{
    if(data?.data?.settlements){
      setSettlements(data?.data?.settlements)
      // setSettlements([])
    }

  },[data])

  return (
    <div>
      <div className="sticky top-0 z-50">
        <TitleDiv title="Transactions" loading={loading} />

        <section className="shadow-lg border-b  ">
          <SelectDate />
        </section>

        <section className="flex items-center bg-white text-gray-500 font-bold text-xs gap-1  py-2 px-3  ">
          <MdDoNotDisturbOnTotalSilence className="inline-block" />
          <p className="">
            Total : {data?.data?.total} ({data?.data?.settlements?.length}){" "}
          </p>
        </section>
        <hr className="" />
      </div>

      { settlements?.length === 0 ? (
        <div className="flex justify-center items-center mt-10 ">
          <h1 className="text-sm font-bold text-gray-600">No Data Found</h1>
        </div>
      ) : (
        <section className="z-10">
          <DashboardTransaction
            filteredData={settlements}
            userType="secondary"
            from={location?.state?.from}
          />
        </section>
      )}
    </div>
  );
}

export default SourceTransactions;
