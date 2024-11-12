/* eslint-disable react/prop-types */
import { useLocation, useNavigate } from "react-router-dom";
import TitleDiv from "../../../../components/common/TitleDiv";
import { useEffect, useMemo, useState } from "react";
import { FaRegCircleDot } from "react-icons/fa6";
import { useSelector } from "react-redux";
import useFetch from "../../../../customHook/useFetch";
import { BarLoader } from "react-spinners";
import { addPaymentSplittingData } from "../../../../../slices/filterSlices/paymentSplitting/paymentSplitting";
import { useDispatch } from "react-redux";
import { addAllParties } from "../../../../../slices/partySlice";

const CashOption = ({ cash }) => (
  <option value={cash.cash_id}>{cash.cash_ledname}</option>
);

const BankOption = ({ bank }) => (
  <option value={bank.bank_id}>{bank.bank_name}</option>
);

const PartyOption = ({ party }) => (
  <option value={party?._id}>{party?.partyName}</option>
);

const PaymentSplitting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const parties = useSelector((state) => state?.partySlice?.allParties) || [];
  const subTotal = location.state.totalAmount;
  const paymentSplittingReduxData = useSelector(
    (state) => state?.paymentSplitting?.paymentSplittingData
  );

  const [balanceAmount, setBalanceAmount] = useState(0);
  const [banks, setBanks] = useState([]);
  const [cash, setCash] = useState([]);
  const [loadingMain, setLoadingMain] = useState(false);

  // const [parties, setParties] = useState("");

  const initialPayments = [
    {
      mode: "cash",
      title: "Cash",
      paymentSourceId: "",
      paymentSourceName: "",
      amount: "",
    },
    {
      mode: "online",
      title: "NEFT/Upi",
      paymentSourceId: "",
      paymentSourceName: "",
      amount: "",
    },
    {
      mode: "cheque",
      title: "Cheque",
      paymentSourceId: "",
      paymentSourceName: "",
      amount: "",
    },
    {
      mode: "credit",
      title: "Credit",
      paymentSourceId: "",
      paymentSourceName: "",
      amount: "",
    },
  ];

  const [payments, setPayments] = useState(initialPayments);

  // useEffect(() => {
  //   if (parties.length === 0) {
  //     navigate(location?.state?.from, { replace: true });
  //   }
  // }, [parties]);

  

  const fetchUrl = useMemo(() => {
    return cmp_id ? `/api/sUsers/getBankAndCashSources/${cmp_id}` : null;
  }, [cmp_id]);

  const fetchUrlPartyList = useMemo(() => {
    return cmp_id && parties.length === 0 ? `/api/sUsers/PartyList/${cmp_id}` : null;
  }, [cmp_id,parties]);

  const { data = [], loading } = useFetch(fetchUrl);
  const { data: partyData = [], partyLoading } = useFetch(fetchUrlPartyList);

  const isLoading = loading || partyLoading;

  useEffect(() => {
    if (data) {
      setBanks(data.data.banks);
      setCash(data.data.cashs);
    }
  }, [data]);

  useEffect(() => {
    if (partyData &&parties.length === 0) {
      console.log(partyData);

      dispatch(addAllParties(partyData.partyList));
    }
  }, [partyData]);



  // Update payments from Redux data
  useEffect(() => {
    if (Object.keys(paymentSplittingReduxData).length > 0) {
      const savedData = paymentSplittingReduxData.splittingData;

      const updatedPayments = initialPayments.map((payment) => {
        const savedPayment = savedData.find((sp) => sp.mode === payment.mode);
        if (savedPayment) {
          return {
            ...payment,
            paymentSourceId: savedPayment.sourceId,
            paymentSourceName: savedPayment.sourceName,
            amount: savedPayment.amount.toString(),
          };
        }
        return payment;
      });

      setPayments(updatedPayments);

      // Update balance amount
      const totalPaid = savedData.reduce(
        (sum, payment) => sum + Number(payment.amount),
        0
      );
      setBalanceAmount(subTotal - totalPaid);
    }
  }, [paymentSplittingReduxData]);

  const paymentOptions = {
    cash: cash,
    online: banks,
    cheque: banks,
    credit: parties,
  };

  const handleAmountChange = (index, value) => {
    const newPayments = [...payments];
    newPayments[index].amount = value;

    const total = newPayments.reduce((sum, payment) => {
      return sum + (Number(payment.amount) || 0);
    }, 0);

    if (total > subTotal) {
      window.alert("Total amount cannot be greater than the subtotal");
      return;
    }

    setPayments(newPayments);
    setBalanceAmount(subTotal - total);
  };

  const handleBankChange = (index, id, name) => {
    const newPayments = [...payments];
    newPayments[index].paymentSourceId = id;
    newPayments[index].paymentSourceName = name;
    setPayments(newPayments);
  };

  const submitHandler = () => {
    const isValid = payments.every((payment) => {
      const hasAmount = payment.amount && parseFloat(payment.amount) > 0;
      const hasSource = payment.paymentSourceId && payment.paymentSourceName;
      return (!hasAmount && !hasSource) || (hasAmount && hasSource);
    });

    if (!isValid) {
      alert(
        "For each payment, both 'amount' and 'source' must be filled or both must be empty."
      );
      return;
    }

    const paymentData = payments
      .filter(
        (payment) =>
          parseFloat(payment.amount) > 0 &&
          payment.paymentSourceId &&
          payment.paymentSourceName
      )
      .map((payment) => ({
        amount: parseFloat(payment.amount),
        mode: payment.mode,
        sourceId: payment.paymentSourceId,
        sourceName: payment.paymentSourceName,
      }));

    const finalData = {
      splittingData: paymentData,
      totalSettledAmount: subTotal - balanceAmount,
      balanceAmount: balanceAmount,
      subTotal: subTotal,
    };

    dispatch(addPaymentSplittingData(finalData));
    navigate(location?.state?.from, { replace: true });
  };

  // Mobile payment card component
  const PaymentCard = ({ payment, index }) => (
    <div className="bg-white rounded-lg shadow-sm border mb-2 p-3">
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <FaRegCircleDot className="h-3 w-3" />
        <span className="capitalize font-bold text-xs">{payment.title}</span>
      </div>
      <select
        value={payment.paymentSourceId}
        onChange={(e) =>
          handleBankChange(
            index,
            e.target.value,
            e.target.options[e.target.selectedIndex].text
          )
        }
        className="w-full p-2 mb-2 text-sm border-b border-0 no-focus-box"
      >
        <option value="" className="text-xs">
          Select source
        </option>
        {paymentOptions[payment.mode]?.map((option) => {
          if (payment.mode === "cash") {
            return <CashOption key={option._id} cash={option} />;
          } else if (payment.mode === "online" || payment.mode === "cheque") {
            return <BankOption key={option._id} bank={option} />;
          } else {
            return <PartyOption key={option._id} party={option} />;
          }
        })}
      </select>
      <input
        type="number"
        placeholder="Enter amount"
        value={payment.amount}
        onChange={(e) => handleAmountChange(index, e.target.value)}
        className="w-full p-2 text-sm border-b border-0 no-focus-box"
      />
    </div>
  );


  

  return (
    <>
      <div className="sticky top-0 z-50">
        <TitleDiv title="Payment Splitting" from={location?.state?.from} />
        {isLoading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" className="mt-[0.5px]" />
          </section>
        )}
      </div>

      <div
        className={`${
          isLoading ? "opacity-50 pointer-events-none" : ""
        } p-0 py-3 sm:p-6 sm:mt-2 mx-4 sm:mx-5 shadow-lg bg-slate-50`}
      >
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="">
            {/* Desktop view */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-200 text-gray-600">
                  <tr>
                    <th className="text-left p-3 font-bold">Mode</th>
                    <th className="text-left p-3 font-bold">Bank/Source</th>
                    <th className="text-left p-3 font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody className="mt-4">
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.mode}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="p-5 py-6">
                        <div className="flex items-center gap-4 text-gray-700">
                          <FaRegCircleDot className="h-3 w-3" />
                          <span className="font-bold text-sm">
                            {payment.title}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <select
                          value={payment.paymentSourceId}
                          onChange={(e) =>
                            handleBankChange(
                              index,
                              e.target.value,
                              e.target.options[e.target.selectedIndex].text
                            )
                          }
                          className="w-full p-2 text-sm border-b outline-none border-0 no-focus-box"
                        >
                          <option value="" className="text-xs">
                            Select source
                          </option>
                          {paymentOptions[payment.mode]?.map((option) => {
                            if (payment.mode === "cash") {
                              return (
                                <CashOption key={option._id} cash={option} />
                              );
                            } else if (
                              payment.mode === "online" ||
                              payment.mode === "cheque"
                            ) {
                              return (
                                <BankOption key={option._id} bank={option} />
                              );
                            } else {
                              return (
                                <PartyOption key={option._id} party={option} />
                              );
                            }
                          })}
                        </select>
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={payment.amount}
                          onChange={(e) =>
                            handleAmountChange(index, e.target.value)
                          }
                          className="w-full p-2 text-sm border-b outline-none border-0 no-focus-box"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden p-2">
              {payments.map((payment, index) => (
                <PaymentCard
                  key={payment.mode}
                  payment={payment}
                  index={index}
                />
              ))}
            </div>

            {/* Total Amount Display */}
            <div className="mt-6 bg-gray-200 border text-gray-700 p-4 flex justify-between">
              <div className="font-bold text-xs flex flex-col gap-2">
                <span>Total Amount</span>
                <span>{subTotal.toFixed(2)}</span>
              </div>
              <div className="font-bold text-xs flex flex-col gap-2">
                <span>Balance Amount</span>
                <span className="text-right">{balanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            className="bg-pink-500 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
            type="button"
            onClick={submitHandler}
          >
            Save
          </button>
          <button
            className="w-20 text-black active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentSplitting;
