import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import React, { useMemo } from "react";
import { BarLoader } from "react-spinners";

import PartyTile from "../../../components/common/Reports/PartyTile";
// import SelectDate from    ""
import TitleDiv from "../../../components/common/TitleDiv";
import ReportTable from "../../../components/common/Reports/ReportTable";
import useFetch from "../../../customHook/useFetch";
import SelectDate from "../../../components/Filters/SelectDate";

function PartyStatement() {
  const location = useLocation();
  const { start, end } = useSelector((state) => state.date);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // Extract party_id once
  const party_id = location?.state?._id;
  const partyName = location?.state?.partyName;

  // Memoize API URLs
  const transactionsUrl = useMemo(
    () =>
      `/api/sUsers/transactions/${cmp_id}?party_id=${party_id}&startOfDayParam=${start}&endOfDayParam=${end}&ignore=saleorder`,
    [cmp_id, party_id, start, end]
  );

  const balanceUrl = useMemo(
    () =>
      `/api/sUsers/getOpeningBalances/${cmp_id}?party_id=${party_id}&startOfDayParam=${start}`,
    [cmp_id, party_id, start]
  );

  // Fetch data using custom hook
  const { data: transactionData, loading: transactionLoading } =
    useFetch(transactionsUrl);

  const { data: balanceData, loading: balanceLoading } = useFetch(balanceUrl);

  // Memoize the combined data
  const reports = useMemo(
    () => transactionData?.data?.combined || [],
    [transactionData]
  );

  // Memoize the opening balances
  const openingBalances = useMemo(
    () => ({
      debitBalance: balanceData?.data?.totalDebitOpening || 0,
      creditBalance: balanceData?.data?.totalCreditOpening || 0,
    }),
    [balanceData]
  );

  // console.log("balanceData",balanceData);
  // console.log("openingBalances",openingBalances);

  // Loading state
  const isLoading = transactionLoading || balanceLoading;

  return (
    <div className="flex flex-1 flex-col  ">
      <div className="sticky top-0 z-50 ">
        <TitleDiv title="Party Statement  " />

        <section className="shadow-lg border-b ">
          <SelectDate />
        </section>

        <section>
          <PartyTile partyName={partyName} />
        </section>

        {isLoading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}
        <section className="border-b bg-slate-300">
          <div className="w-full overflow-x-auto ">
            <table className="w-full">
              <thead>
                <tr className=" border-y">
                  <th className="w-[45%] py-3.5 px-3 text-left text-xs font-bold text-gray-600">
                    Transactions
                  </th>
                  <th className="w-[18%] py-3.5 px-3 text-right text-xs font-bold text-gray-600">
                    Debit
                  </th>
                  <th className="w-[18%] py-3.5 px-3 text-right text-xs font-bold text-gray-600">
                    Credit
                  </th>
                  <th className="w-[19%] py-3.5 px-3 text-right text-xs font-bold text-gray-600">
                    Balance
                  </th>
                </tr>
              </thead>
            </table>
          </div>
        </section>
      </div>

      <section className="z-10">
        <ReportTable
          data={reports}
          loading={isLoading}
          openingBalances={openingBalances}
        />
      </section>
    </div>
  );
}

// Memoize the entire component
export default React.memo(PartyStatement);
