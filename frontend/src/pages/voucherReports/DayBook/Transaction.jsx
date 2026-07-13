/* eslint-disable react/no-unknown-property */
import { useMemo, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

import SelectDate from "../../../components/Filters/SelectDate";
import VoucherTypeFilter from "../../../components/Filters/VoucherTypeFilter";
import useFetch from "../../../customHook/useFetch";
import TransactionTable from "../../../components/common/List/TranscationTable";
import TitleDiv from "../../../components/common/TitleDiv";
import { BarLoader } from "react-spinners";
import SecondaryUserFilter from "@/components/Filters/SecondaryUserFilter";
import { Search } from "lucide-react";

function Transaction() {
  const [netCashInHands, setNetCashInHands] = useState(0);

  const [effectiveDates, setEffectiveDates] = useState({
    start: null,
    end: null,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation(); // Hook to access passed state
  const dispatch = useDispatch();
  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg,
  );
  const { start: reduxStart, end: reduxEnd } = useSelector(
    (state) => state.date,
  );
  const selectedVoucher = useSelector(
    (state) => state?.voucherType?.selectedVoucher,
  );
  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser,
  );

  console.log(selectedSecondaryUser);

  useEffect(() => {
    if (
      location.state?.fromSummary &&
      location.state?.startDate &&
      location.state?.endDate
    ) {
      // Coming from Summary Report - use month-specific dates
      setEffectiveDates({
        start: location.state.startDate,
        end: location.state.endDate,
      });
    } else {
      // Normal view - use Redux dates
      setEffectiveDates({
        start: reduxStart,
        end: reduxEnd,
      });
    }
  }, [location.state, reduxStart, reduxEnd]);

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false;

  const transactionsUrl = useMemo(
    () =>
      effectiveDates.start && effectiveDates.end
        ? `/api/sUsers/transactions/${
            org?._id
          }?startOfDayParam=${effectiveDates.start}&endOfDayParam=${effectiveDates.end}&selectedVoucher=${
            selectedVoucher?.value
          }&isAdmin=${isAdmin}&selectedSecondaryUser=${
            selectedSecondaryUser?._id || ""
          }&searchTerm=${encodeURIComponent(searchTerm || "")}`
        : null,
    [
      org?._id,
      effectiveDates.start,
      effectiveDates.end,
      selectedVoucher,
      selectedSecondaryUser,
      isAdmin,
      searchTerm,
    ],
  );
  // Fetch data using custom hook
  const { data: transactionData, loading: transactionLoading } =
    useFetch(transactionsUrl);

  const getDifference = (difference) => {
    setNetCashInHands(difference);
  };

  return (
    <div className="flex-1">
      <div className=" flex-1   ">
        <div className="sticky top-0 flex flex-col z-30 bg-white">
          <TitleDiv title="Daybook" />

          <section className="shadow-lg">
            <SelectDate />
          </section>

          <section className="shadow-lg">
            <VoucherTypeFilter />
          </section>

          <section className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            {isAdmin && <SecondaryUserFilter />}

            <p className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Net Cash In Hand :
              <span className="ml-2 font-semibold text-gray-900">
                {transactionLoading ? "Loading..." : netCashInHands || 0}
              </span>
            </p>

            <div className="ml-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-64 rounded-md border border-gray-300 bg-gray-50 pl-10 pr-3 text-sm font-medium text-gray-700 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search />
                </span>
              </div>
            </div>
          </section>

          {transactionLoading && (
            <section className="w-full">
              <BarLoader color="#9900ff" width="100%" />
            </section>
          )}

          <table className="w-full border-collapse mt-2  ">
            <thead className={`sticky top-0 bg-white z-10`}>
              <tr className="bg-gray-100 text-gray-500 text-xs">
                <th className="text-left p-3 border-b w-1/2">Transaction</th>
                <th className="text-right p-3 border-b w-1/4">Amount</th>
                <th className="text-right p-3 border-b w-1/4">Money In/Out</th>
              </tr>
            </thead>
          </table>
        </div>

        <TransactionTable
          transactionData={transactionData?.data?.combined}
          getDifference={getDifference}
          loading={transactionLoading}
        />
      </div>
    </div>
  );
}

export default Transaction;
