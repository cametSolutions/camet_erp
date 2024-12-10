import TitleDiv from "../../../../components/common/TitleDiv";
import SelectDate from "../../../../components/Filters/SelectDate";
import { useNavigate, useParams } from "react-router-dom";
import useFetch from "../../../../customHook/useFetch";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { MdAddLink } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";

const BalanceDetails = () => {
  const [balanceDetails, setBalanceDetails] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const { start, end } = useSelector((state) => state.date);

  const { accGroup } = useParams();
  const navigate = useNavigate();
  let colorScheme;
  let title;
  let label;

  switch (accGroup) {
    case "cashInHand":
      colorScheme = "#3a7ca5";
      title = "Cash In Hand";
      label = "Cash";
      break;
    case "bankBalance":
      colorScheme = "#25a18e";
      title = "Bank Balance";
      label = "Bank";
      break;
    case "bankOd":
      colorScheme = "#4a6fa5";
      title = "Bank OD A/c";
      label = "Bank OD";
      break;
    default:
      colorScheme = "gray-900";
  }

  const { data, loading } = useFetch(
    `/api/sUsers/findSourceDetails/${cmp_id}?accountGroup=${accGroup}&startOfDayParam=${start}&endOfDayParam=${end}`
  );

  useEffect(() => {
    if (data?.data) {
      setBalanceDetails(data?.data);
      // setBalanceDetails([]);
      const grandTotal = data?.data?.reduce(
        (total, item) => total + item.total,
        0
      );
      setGrandTotal(grandTotal || 0);
    }
  }, [data]);

  const handleClickHandler = (id) => {
    navigate(`/sUsers/sourceTransactions/${id}/${accGroup}`);
  };

  return (
    <>
      <div className="flex flex-col sticky top-0 z-50">
        <TitleDiv title={title} loading={loading} />

        <section className="shadow-lg border-b ">
          <SelectDate />
        </section>
        {/* Total Balance */}

        <div
          style={{ backgroundColor: colorScheme }}
          className={`  ${
            loading && "animate-pulse pointer-events-none opacity-80"
          }   flex flex-col   pb-11 shadow-xl justify-center`}
        >
          <div className=" w-full flex justify-end pr-3  text-white mt-4 gap-1 font-bold cursor-pointer  ">
            {/* {type === "self" && ( */}
            <button
              onClick={() => navigate(`/sUsers/add${label}`)}
              className="flex items-center gap-1 shadow-xl  p-1 px-2 rounded-lg  hover:translate-y-0.5 ease-out duration-150"
            >
              <MdAddLink size={20} />
              <p className="text-xs  ">
                Add <span>{label}</span>{" "}
              </p>
            </button>
            {/* )} */}
          </div>
          <div
            className={`   text-center  text-white  flex justify-center items-center flex-col mt-5`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold">₹{grandTotal}</h2>
            <p className="text-sm mt-4 font-semibold opacity-90">
              {new Date(start).toDateString()} - {new Date(end).toDateString()}
            </p>
            <p className="text-sm mt-4 font-bold opacity-90">{title}</p>
          </div>
        </div>
        <div className="bg-white h-2 shadow-lg">

        </div>
      </div>


      <div className="flex flex-col gap-3 z-10">
        {/* Balance Details Card */}
        <div className={`   bg-white rounded-lg `}>
          <div className="p-4">
            <div className="space-y-1">
              {balanceDetails.map((item, index) => (
                <div
                  key={index}
                  className="hover:-translate-y-[2px] ease-in-out duration-100 hover:bg-slate-50 px-5 "
                >
                  <div className="flex  items-center py-2 border-gray-100 my-4 cursor-pointer gap-3 ">
                    <aside>
                      <span
                        onClick={() => {
                          navigate(`/sUsers/edit${label}/${item._id}`);
                        }}
                        className="text-gray-700 hover:scale-110  "
                      >
                        {" "}
                        <RiEdit2Fill />{" "}
                      </span>
                    </aside>
                    <div
                      onClick={() => {
                        handleClickHandler(item?._id);
                      }}
                      className="flex justify-between flex-1"
                    >
                      <span className="text-gray-500 font-bold text-sm sm:text-md flex items-center gap-2">
                        {item.name}
                      </span>
                      <span className={` text-sm sm:text-md font-bold`}>
                        ₹ {item.total.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                  {index < balanceDetails.length - 1 && (
                    <hr className="border-gray-200 border dark:border-gray-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {!loading && balanceDetails.length === 0 && (
          <div className="flex justify-center items-center ">
            <h1 className="text-sm font-bold text-gray-600">No Data Found</h1>
          </div>
        )}
      </div>
    </>
  );
};

export default BalanceDetails;
