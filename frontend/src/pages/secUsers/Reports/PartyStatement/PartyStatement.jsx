import { useSelector } from "react-redux";
import PartyTile from "../../../../components/common/Reports/PartyTile";
import SelectDate from "../../../../components/common/SelectDate";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useLocation } from "react-router-dom";
import useFetch from "../../../../customHook/useFetch";
import { useEffect, useState } from "react";
import ReportTable from "../../../../components/common/Reports/ReportTable";
import BarLoader from "react-spinners/BarLoader";

function PartyStatement() {
  const [reports, setReports] = useState([]);

  const { start, end, title } = useSelector((state) => state.date);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const location = useLocation();

  const party_id = location?.state?._id;

  const { data, loading, error } = useFetch(
    `/api/sUsers/transactions/${cmp_id}?party_id=${party_id}&startOfDayParam=${start}&endOfDayParam=${end}`
  );

  console.log("reports", reports);

  useEffect(() => {
    if (data) {
      setReports(data?.data?.combined);
    }
  }, [data]);

  console.log(location);
  return (
    <div className="flex flex-1 flex-col">
      <TitleDiv title="Party Statement  " />

      <section className="shadow-lg ">
        <SelectDate />
      </section>

      <section>
        <PartyTile partyName={location?.state?.partyName} />
      </section>

      {loading && (
        <section className="w-full">
          <BarLoader color="#9900ff" width="100%" />
        </section>
      )}

      <section>
        <ReportTable data={reports} loading={loading} />
      </section>
    </div>
  );
}

export default PartyStatement;
