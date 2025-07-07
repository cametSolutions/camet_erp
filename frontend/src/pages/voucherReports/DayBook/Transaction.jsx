/* eslint-disable react/no-unknown-property */
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

import SelectDate from "../../../components/Filters/SelectDate";
import VoucherTypeFilter from "../../../components/Filters/VoucherTypeFilter";
import useFetch from "../../../customHook/useFetch";
import TransactionTable from "../../../components/common/List/TranscationTable";
import TitleDiv from "../../../components/common/TitleDiv";
import { BarLoader } from "react-spinners";
import SecondaryUserFilter from "@/components/Filters/SecondaryUserFilter";

function Transaction() {
  const [netCashInHands, setNetCashInHands] = useState(0);
  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const { start, end } = useSelector((state) => state.date);
  const selectedVoucher = useSelector(
    (state) => state?.voucherType?.selectedVoucher
  );
  const selectedSecondaryUser = useSelector(
    (state) => state?.userFilter?.selectedUser
  );

  console.log(selectedSecondaryUser);
  

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false;

  const transactionsUrl = useMemo(
    () =>
      `/api/sUsers/transactions/${
        org?._id
      }?startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=${
        selectedVoucher?.value
      }&isAdmin=${isAdmin}&selectedSecondaryUser=${
        selectedSecondaryUser?._id || ""
      }`,
    [org?._id, start, end, selectedVoucher, selectedSecondaryUser]
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

          <section className="shadow-lg p-3 text-xs font-bold text-gray-500 flex items-center gap-5">
            {isAdmin && <SecondaryUserFilter />}
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
