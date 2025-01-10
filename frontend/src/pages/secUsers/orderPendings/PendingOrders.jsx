import { useState } from "react";
import { useSelector } from "react-redux";
import TitleDiv from "../../../components/common/TitleDiv";
import SelectDate from "../../../components/Filters/SelectDate";
import useFetch from "../../../customHook/useFetch";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { PiSelectionAllFill } from "react-icons/pi";
import { PiSelectionAllDuotone } from "react-icons/pi";


function PendingOrders() {
  const { start, end } = useSelector((state) => state.date);
  const { partyId } = useParams();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const transactionsUrl = useMemo(() => {
    if (start && end) {
      return `/api/sUsers/transactions/${cmp_id}?party_id=${
        partyId ?? ""
      }&startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=saleOrder`;
    }
    return null;
  }, [cmp_id, start, end, partyId]);

  const {
    data: transactionData,
    loading: transactionLoading,
    error: transactionError,
  } = useFetch(transactionsUrl);

  const handleSelectAll = () => {
    if (selectedOrders.size === transactionData?.data?.combined?.length) {
      setSelectedOrders(new Set());
      setSelectAll(false);
    } else {
      const allOrderIds =
        transactionData?.data?.combined?.map((order) => order._id) || [];
      setSelectedOrders(new Set(allOrderIds));
      setSelectAll(true);
    }
  };

  const handleSelectOrder = (orderId) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <TitleDiv
        title="Pending Orders"
        // from="/sUsers/orderPending/partyList"
        loading={transactionLoading}
      />

      <section className="shadow-lg border-b">
        <SelectDate />
      </section>

      <div className="bg-white p-2 shadow-lg font-bold text-xs sm:text-sm pr-4 text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2  ">
       {
        selectAll ? (
          <PiSelectionAllFill onClick={handleSelectAll} className="w-4 h-4 cursor-pointer text-black text-sm sm:text-lg" />
        ) : (
          <PiSelectionAllDuotone onClick={handleSelectAll} className="w-4 h-4 cursor-pointer text-sm sm:text-lg " />
        )
       }
           <p>Select all</p>
        </div>
        <div>
          Total : ₹
          {parseFloat(
            transactionData?.data?.totalTransactionAmount || 0
          ).toLocaleString()}{" "}
        </div>
      </div>

      <div className=" py-2">
        <div className="bg-white rounded-lg ">
          <div className="">
            {/* <button 
              onClick={handleSelectAll}
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {selectedOrders.size === transactionData?.data?.combined?.length 
                ? "Deselect All" 
                : "Select All"}
            </button> */}

            <div className="overflow-x-auto ">
              <table className="w-full border-collapse text-xs sm:text-sm  ">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="p-3 text-left">Select</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Voucher No</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionData?.data?.combined?.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b hover:bg-gray-50 font-semibold text-gray-500"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(transaction._id)}
                          onChange={() => handleSelectOrder(transaction._id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">{transaction.voucherNumber}</td>
                      <td className="p-3 text-right">
                        ₹
                        {parseFloat(transaction.enteredAmount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
               
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingOrders;
