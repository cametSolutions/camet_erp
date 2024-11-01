import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import React, { useMemo } from "react";
import { BarLoader } from "react-spinners";

import PartyTile from "../../../../components/common/Reports/PartyTile";
import SelectDate from "../../../../components/common/SelectDate";
import TitleDiv from "../../../../components/common/TitleDiv";
import ReportTable from "../../../../components/common/Reports/ReportTable";
import useFetch from "../../../../customHook/useFetch";

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
      `/api/sUsers/transactions/${cmp_id}?party_id=${party_id}&startOfDayParam=${start}&endOfDayParam=${end}`,
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
    <div className="flex flex-1 flex-col ">
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
        <section>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-200">
                <th className="py-3 px-6 text-left text-gray-400 text-sm">
                  Transactions
                </th>
                <th className="py-3 px-6 text-right text-gray-400 text-sm">
                  Debit
                </th>
                <th className="py-3 px-6 text-right text-gray-400 text-sm">
                  Credit
                </th>
              </tr>
            </thead>
          </table>
        </section>

        <section>
          <table className="w-full">
            <tr className="bg-slate-100 w-full">
              <td className="p-3 px-6 text-left font-bold text-xs text-gray-700">
                Opening Balance
              </td>
              <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
                {openingBalances?.debitBalance >
                  openingBalances?.creditBalance &&
                  `₹ ${openingBalances?.debitBalance}`}
              </td>
              <td className="py-3 px-6 text-right font-bold text-xs text-gray-500">
                {openingBalances?.creditBalance >
                  openingBalances?.debitBalance &&
                  `₹ ${openingBalances?.creditBalance}`}
              </td>
            </tr>
          </table>
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
