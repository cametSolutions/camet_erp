import TitleDiv from "../../../components/common/TitleDiv";
import SelectDate from "../../../components/Filters/SelectDate";
import { useNavigate } from "react-router-dom";
import useFetch from "../../../customHook/useFetch";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const BalancePage = () => {
  const navigate = useNavigate();
  const [balanceDetails, setBalanceDetails] = useState([
    {
      label: "Cash In Hand",
      amount: 0,
      color: "text-gray-900",
      value: "cashInHand",
    },
    {
      label: "Bank Balance",
      amount: 0,
      color: "text-gray-900",
      value: "bankBalance",
    },
    // {
    //   label: "Bank OD A/c",
    //   amount: 0,
    //   color: "text-gray-900",
    //   value: "bankOd",
    // },
  ]);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const { start, end } = useSelector((state) => state.date);

  const { data: sourceData, loading } = useFetch(
    `/api/sUsers/findSourceBalance/${cmp_id}?startOfDayParam=${start}&endOfDayParam=${end}`
  );

  useEffect(() => {
    if (sourceData) {
      setBalanceDetails((prev) => {
        return [
          {
            ...prev[0],
            amount: sourceData?.cashCurrentBalance,
          },
          {
            ...prev[1],
            amount: sourceData?.bankCurrentBalance,
          },
          // {
          //   ...prev[2],
          //   amount: sourceData?.bankOd || 0,
          // },
        ];
      });
    }
  }, [sourceData]);



  return (
    <>
      <div className="sticky top-0">
        <TitleDiv
          title="Cash / Bank Balance"
          
          loading={loading}
        />

        <section className="shadow-lg border-b  ">
          <SelectDate />
        </section>
        <div className="text-center bg-[#219ebc] shadow-xl text-white h-60 flex justify-center items-center flex-col">
          <h2 className="text-3xl sm:text-4xl font-bold">
            ₹ {sourceData?.grandTotal || 0}
          </h2>
          <p className="text-sm mt-4 font-semibold opacity-90">
            {/* 01 APR 24 to 31 MAR 25 */}
            {new Date(start).toDateString()} - {new Date(end).toDateString()}
          </p>
        </div>
      </div>

      <div
        className={` ${
          loading && "animate-pulse opacity-70 pointer-events-none"
        }  flex flex-col gap-3`}
      >
        {/* Total Balance */}

        {/* Balance Details Card */}
        <div className="bg-white rounded-lg ">
          <div className="p-4">
            <div className="space-y-1">
              {balanceDetails.map((item, index) => (
                <div
                  onClick={() => {
                    navigate("/sUsers/balanceDetails/" + item?.value);
                  }}
                  key={index}
                  className="hover:-translate-y-[2px] ease-in-out duration-100 hover:bg-slate-50 px-5 "
                >
                  <div className="flex justify-between items-center py-2 border-gray-100 my-4 cursor-pointer ">
                    <span className="text-gray-500 font-bold text-sm sm:text-md">
                      {item.label}
                    </span>
                    <span
                      className={`${item.color} text-sm sm:text-md font-bold`}
                    >
                      ₹ {item.amount}
                    </span>
                  </div>
                  {index < balanceDetails.length - 1 && (
                    <hr className="border-gray-200 border dark:border-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BalancePage;
