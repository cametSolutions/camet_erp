import { useMemo, useState } from "react";
import TitleDiv from "../../../../components/common/TitleDiv";
import FindUserAndCompany from "../../../../components/Filters/FindUserandCompany";
import PartyFilter from "../../../../components/Filters/party/PartyFilter";
import SelectDate from "../../../../components/Filters/SelectDate";
import StatusFilter from "../../../../components/Filters/status/StatusFilter";
import { useSelector } from "react-redux";
import useFetch from "../../../../customHook/useFetch";
import DashboardTransaction from "../../../../components/common/DashboardTransaction";
import { BarLoader } from "react-spinners";
import { useLocation } from "react-router-dom";

function SalesSummary() {
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);
  const location = useLocation();

  const { start, end } = useSelector((state) => state.date);
  const { _id: partyID } = useSelector(
    (state) => state.partyFilter.selectedParty
  );


  const transactionsUrl = useMemo(() => {
    if (userAndCompanyData && start && end) {
      return `/api/sUsers/transactions/${
        userAndCompanyData?.org?._id
      }?party_id=${
        partyID ?? ""
      }&startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale`;
    }
    return null; // Or return an empty string if preferred
  }, [userAndCompanyData, start, end, partyID]);

  const {
    data: transactionData,
    loading: transactionLoading,
    error: transactionError,
  } = useFetch(transactionsUrl);

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };
  return (
    <div>
      <div className="sticky top-0 z-50">
        <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />

        <TitleDiv title="Sales Summary" from={"/sUsers/reports"}  />

        <section className="shadow-lg border-b">
          <SelectDate />
        </section>
        <section className="shadow-lg p-3 flex items-center gap-6 bg-white  border-b">
          <PartyFilter />
          <StatusFilter />
        </section>

        {transactionLoading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}

        {!transactionLoading && !transactionError && (
          <section>
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-100">
                  <th className="py-2 px-6 text-left text-gray-400 text-sm">
                    Invoice
                  </th>
                  <th className="py-2 px-6 text-right text-gray-400 text-sm">
                    Amount
                  </th>
                </tr>
              </thead>
            </table>
          </section>
        )}
      </div>

      {
        !transactionLoading && transactionError && (
          <section>
            <p className="text-gray-500 text-center font-bold  mt-20">Oops!.. No data found</p>
          </section>
        )
      }


      <section>
        <DashboardTransaction
          filteredData={transactionData?.data?.combined}
          userType={userAndCompanyData?.userType}
          from="/sUsers/reports/salesSummary"
        />
      </section>
    </div>
  );
}

export default SalesSummary;
