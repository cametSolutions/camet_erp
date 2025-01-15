import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TitleDiv from "../../../components/common/TitleDiv";
import SelectDate from "../../../components/Filters/SelectDate";
import useFetch from "../../../customHook/useFetch";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { PiSelectionAllFill } from "react-icons/pi";
import { PiSelectionAllDuotone } from "react-icons/pi";
import { useDispatch } from "react-redux";
import { addOrderConversionDetails } from "../../../../slices/salesSecondary";
import { useNavigate } from "react-router-dom";

function PendingOrders() {
  const { start, end } = useSelector((state) => state.date);
  const { partyId } = useParams();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const transactionsUrl = useMemo(() => {
    if (start && end) {
      return `/api/sUsers/transactions/${cmp_id}?party_id=${
        partyId ?? ""
      }&startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=saleOrder&fullDetails=true`;
    }
    return null;
  }, [cmp_id, start, end, partyId]);

  const {
    data: transactionData,
    loading: transactionLoading,
    // error: transactionError,
  } = useFetch(transactionsUrl);

  useEffect(() => {
    if (transactionData?.data?.combined) {
      const filteredOrders = transactionData?.data?.combined.filter(
        (order) =>
          (order.isConverted === false ||
            order.isConverted === null ||
            order.isConverted === undefined) &&
          order.isCancelled === false
      );
      setFilteredOrders(filteredOrders);
    }
  }, [transactionData]);

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

    if (newSelected.size === filteredOrders?.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
    setSelectedOrders(newSelected);
  };

  const handleConvertion = () => {
    if (selectedOrders.size === 0) {
      window.alert("Select at least one order to convert");
    }

    const selectedSaleOrders = transactionData?.data?.combined.filter((order) =>
      selectedOrders.has(order._id)
    );

    if (selectedSaleOrders.length === 0) return;

    // Check for items with hasGodownOrBatch and collect voucher numbers
    const ordersWithGodownOrBatch = selectedSaleOrders.filter((order) =>
      order.items.some((item) => item.hasGodownOrBatch)
    );

    if (ordersWithGodownOrBatch.length > 0) {
      const voucherNumbers = ordersWithGodownOrBatch
        .map((order) => order.voucherNumber)
        .join(", ");
      window.alert(
        `Cannot convert orders containing items with Godown or Batch tracking.\nAffected order(s): ${voucherNumbers}`
      );
      return;
    }

    const party = selectedSaleOrders[0].party;

    // Combine all items and modify `GodownList[0].individualTotal`
    const allItems = selectedSaleOrders.reduce((acc, order) => {
      const updatedItems = order.items.map((item) => {
        // Create a deep clone of the item to avoid modifying the original object
        const clonedItem = structuredClone(item);

        if (clonedItem?.GodownList?.[0]) {
          // Add `total` to `GodownList[0].individualTotal`
          clonedItem.GodownList[0].individualTotal =
            Number(clonedItem.GodownList[0]?.individualTotal || 0) +
            Number(clonedItem?.total || 0);

          // Add selected price rate
          clonedItem.GodownList[0].selectedPriceRate =
            clonedItem?.selectedPriceRate || 0;
          clonedItem.GodownList[0].added = true;
        }
        return clonedItem;
      });

      return acc.concat(updatedItems);
    }, []);

    // Combine additional charges to get allAdditionalCharges
    const allAdditionalCharges = selectedSaleOrders?.reduce((acc, order) => {
      return acc.concat(order?.additionalCharges);
    }, []);

    // Consolidate additional charges by `_id`
    const consolidatedAdditionalCharges = allAdditionalCharges?.reduce(
      (acc, charge) => {
        const existingCharge = acc?.find((item) => item?._id === charge?._id);
        if (existingCharge) {
          // If the same `_id` exists, consolidate the values
          existingCharge.value =
            Number(existingCharge?.value) + Number(charge?.value);
          existingCharge.finalValue =
            Number(existingCharge?.finalValue) + Number(charge?.finalValue);
          existingCharge.taxAmt =
            Number(existingCharge?.taxAmt) + Number(charge?.taxAmt);
        } else {
          // Add new charge if `_id` doesn't exist
          acc.push({ ...charge });
        }
        return acc;
      },
      []
    );

    /// save details of orders which are converted
    const convertedFrom = selectedSaleOrders.map((order) => ({
      _id: order._id,
      saleOrderNo: order.voucherNumber,
      amount: Number(order.enteredAmount),
      date: order.date,
    }));

    //  adding the despatch details of the 1 st order to the sale
    const firstOrder = selectedSaleOrders[0];

    const despatchDetails = firstOrder.despatchDetails;

    // Dispatch updated items and additional charges
    dispatch(
      addOrderConversionDetails({
        items: allItems,
        party,
        additionalCharges: consolidatedAdditionalCharges, // Add consolidated additional charges
        convertedFrom: convertedFrom,
        despatchDetails,
      })
    );
    navigate("/sUsers/sales");
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
          {selectAll ? (
            <PiSelectionAllFill
              onClick={handleSelectAll}
              className="w-4 h-4 cursor-pointer text-black text-sm sm:text-lg"
            />
          ) : (
            <PiSelectionAllDuotone
              onClick={handleSelectAll}
              className="w-4 h-4 cursor-pointer text-sm sm:text-lg "
            />
          )}
          <p>Select all</p>
        </div>
        {/* <div>
          Total : ₹
          {parseFloat(
            transactionData?.data?.totalTransactionAmount || 0
          ).toLocaleString()}{" "}
        </div> */}
        {/* <div className="bg-white py-2 shadow-lg flex  justify-end px-2"> */}
        <button
          onClick={() => {
            handleConvertion();
          }}
          className="bg-blue-500 px-2.5 text-xs py-1.5  text-white rounded"
        >
          Convert
        </button>
      </div>
      {/* </div> */}

      {/* <div className="bg-white py-2 shadow-lg flex  justify-end px-2">
        <button className="bg-blue-500 px-2.5 text-xs py-1.5  text-white rounded">
          Convert
        </button>
      </div> */}

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
                    <th className="p-3 text-center">Date</th>
                    <th className="p-3 text-center">Voucher No</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders?.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b hover:bg-gray-50 font-semibold text-gray-500"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(transaction._id)}
                          onChange={() => handleSelectOrder(transaction._id)}
                          className="h-4 w-4 rounded border-gray-300 cursor-pointer text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td 
                      onClick={()=>{navigate("/sUsers/InvoiceDetails/" + transaction._id)}}
                      className="p-3 text-center hover:underline cursor-pointer">{transaction.voucherNumber}</td>
                      <td className="p-3 text-right ">
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
