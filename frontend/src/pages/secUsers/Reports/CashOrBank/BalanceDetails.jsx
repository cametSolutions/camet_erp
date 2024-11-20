import TitleDiv from "../../../../components/common/TitleDiv";
import SelectDate from "../../../../components/Filters/SelectDate";
import { useNavigate, useParams } from "react-router-dom";

const BalanceDetails = () => {
  const balanceDetails = [
    { label: "Petty Cash", amount: 1022, color: "text-gray-600" },
    { label: "Cash", amount: 67557, color: "text-gray-900" },
    // { label: "Bank OD A/c", amount: 0, color: "text-gray-900" },
  ];

  const { accGroup } = useParams();
  let colorScheme;
  let title;

  switch (accGroup) {
    case "cashInHand":
      colorScheme = "#3a7ca5";
      title = "Cash In Hand";
      break;
    case "bankBalance":
      colorScheme = "#25a18e";
      title = "Bank Balance";
      break;
    case "bankOd":
      colorScheme = "#4a6fa5";
      title = "Bank OD A/c";
      break;
    default:
      colorScheme = "gray-900";
  }

  return (
    <>
      <TitleDiv title={title}  />

      <section className="shadow-lg border-b ">
        <SelectDate />
      </section>

      <div className="flex flex-col gap-3">
        {/* Total Balance */}
        <div 
        style={{ backgroundColor: colorScheme}}
        className="text-center  shadow-xl text-white h-48 flex justify-center items-center flex-col">
          <h2 className="text-3xl sm:text-4xl font-bold">₹ 57,33,000.47</h2>
          <p className="text-sm mt-4 font-semibold opacity-90">
            01 APR 24 to 31 MAR 25
          </p>
          <p className="text-sm mt-4 font-bold opacity-90">
            {title}
          </p>
        </div>

        {/* Balance Details Card */}
        <div className="bg-white rounded-lg ">
          <div className="p-4">
            <div className="space-y-1">
              {balanceDetails.map((item, index) => (
                <div
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
                      ₹ {item.amount.toLocaleString("en-IN")}
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

export default BalanceDetails;
