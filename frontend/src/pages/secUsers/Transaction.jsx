/* eslint-disable react/no-unknown-property */
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

import SelectDate from    "../../components/Filters/SelectDate"
import VoucherTypeFilter from "../../components/Filters/VoucherTypeFilter";
import useFetch from "../../customHook/useFetch";
import TransactionTable from "../../components/common/List/TranscationTable";
import TitleDiv from "../../components/common/TitleDiv";
import { BarLoader } from "react-spinners";

function Transaction() {
  const [netCashInHands, setNetCashInHands] = useState(0);
  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const { start, end } = useSelector((state) => state.date);
  const selectedVoucher = useSelector(
    (state) => state?.voucherType?.selectedVoucher
  );

  const transactionsUrl = useMemo(
    () =>
      `/api/sUsers/transactions/${org?._id}?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${selectedVoucher?.value}`,
    [org?._id, start, end, selectedVoucher]
  );

  // Fetch data using custom hook
  const { data: transactionData, loading: transactionLoading } =
    useFetch(transactionsUrl);

  console.log("transcationLoading", transactionLoading);

  const getDifference = (difference) => {
    setNetCashInHands(difference);
  };

  return (
    <div className="flex-1">
      <div className=" flex-1   ">
        <div className="sticky top-0 flex flex-col z-30 bg-white">
          <TitleDiv title="Daybook" />

          {/* <div className=" mt-0 shadow-lg p-2 md:p-0">
              <form>
                <label
                  for="default-search"
                  class="mb-2 text-sm font-medium text-gray-900 sr-only"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 "
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    value={search}
                    type="search"
                    id="default-search"
                    className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-t-none rounded-b-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search Mockups, Logos..."
                    required
                  />
                  <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Search
                  </button>
                </div>
                <div className="p-2 flex justify-between pr-4 items-center">
                  <div
                    className="flex gap-3 items-center
                  "
                  >
                    <AiFillCaretRight />
                    <DatePicker
                      className="h-6 text-xs bg-blue-200 rounded-sm w-full"
                      startDate={startDate}
                      dateFormat="dd/MM/yyyy"
                      endDate={endDate}
                      selectsRange
                      onChange={(dates) => {
                        console.log(dates);
                        if (dates) {
                          setStartDate(dates[0]);
                          localStorage.setItem("SecondaryTransactionStartDate", dates[0]?? new Date());
                          setEndDate(dates[1]);
                          localStorage.setItem("SecondaryTransactionEndDate", dates[1] ?? new Date());
                        }
                      }}
                    />
                  </div>

                  <div>
                    <p className="font-semibold text-green-500 text-sm">
                      <span className="text-gray-500 ">Total : </span>₹{" "}
                      {total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </form>
            </div> */}

          <section className="shadow-lg">
            <SelectDate />
          </section>

          <section className="shadow-lg">
            <VoucherTypeFilter />
          </section>

          <section className="shadow-lg p-3 text-xs font-bold text-gray-500">
            <p>
              Net Cash In Hand :{" "}
              {transactionLoading ? "Loading..." : netCashInHands || 0}
            </p>
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
