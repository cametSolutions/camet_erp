import { FaAngleDown, FaArrowDown } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import SearchBar from "../../components/common/SearchBar";
import { useNavigate } from "react-router-dom";
import { formatAmount } from "../../../../backend/helpers/helper";
import { CgDetailsLess } from "react-icons/cg";
import useFetch from "../../customHook/useFetch";
import CustomBarLoader from "../../components/common/CustomBarLoader";

function Outstanding() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("ledger");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSubGroups, setExpandedSubGroups] = useState({});

  const navigate = useNavigate();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data: outstandingData, loading } = useFetch(
    `/api/sUsers/fetchOutstandingTotal/${cmp_id}?type=${selectedTab}`
  );

  useEffect(() => {
    if (outstandingData) {
      setData(outstandingData?.outstandingData || []);
    }
  }, [cmp_id, outstandingData]);

  const searchData = (data) => {
    setSearch(data);
  };

  const filterOutstanding = (data) => {
    return data.filter((item) =>
      item.party_name?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const toggleSubGroup = (subGroupId) => {
    setExpandedSubGroups((prev) => ({
      ...prev,
      [subGroupId]: !prev[subGroupId],
    }));
  };

  const finalData = filterOutstanding(data);

  const handleNavigate = (party_id, party_name, totalBillAmount) => {
    navigate(`/sUsers/outstandingDetails/${party_id}`, {
      state: { party_name, totalBillAmount },
    });
  };

  return (
    <div>
      <div className="sticky top-0 flex flex-col z-30 bg-white shadow-lg pb-2">
        <div className="flex items-center justify-between w-full bg-[#012a4a] shadow-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <IoIosArrowRoundBack
              onClick={() => navigate("/sUsers/reports")}
              className="text-white text-3xl"
            />
            <p className="text-white text-lg font-bold">Outstanding</p>
          </div>
          <Link to={`/sUsers/outstandingSummary`}>
            <div className="text-white text-xs font-bold flex items-center gap-2 bg-[#163c5a] hover:bg-[#244a67] hover:scale-105 transform ease-in-out duration-200 py-1 px-3 rounded-sm shadow-lg cursor-pointer">
              <p>Summary</p>
              <CgDetailsLess size={20} />
            </div>
          </Link>
        </div>

        <SearchBar onType={searchData} />

        <div className="flex  mt-2 w-full px-3">
          <button
            onClick={() => setSelectedTab("ledger")}
            className={`px-4 py-2 text-sm  ${
              selectedTab === "ledger"
                ? "border-b-2 text-black font-bold"
                : "text-gray-500"
            } w-1/2`}
          >
            Ledger
          </button>
          <button
            onClick={() => setSelectedTab("group")}
            className={`px-4 py-2 text-sm  ${
              selectedTab === "group"
                ? "border-b-2 text-black font-bold"
                : "text-gray-500"
            }  w-1/2`}
          >
            Group
          </button>
        </div>
      </div>

      {loading && <CustomBarLoader />}

      {/* Ledger-wise View */}
      {selectedTab === "ledger" && !loading && finalData?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mt-6 text-center pb-10 md:px-2 cursor-pointer">
          {finalData.map((el, index) => (
            <div
              key={index}
              onClick={() =>
                handleNavigate(el?._id, el?.party_name, el?.totalBillAmount)
              }
              className="bg-[#f8ffff] rounded-md shadow-xl border border-gray-100 flex flex-col px-4 transition-all hover:translate-y-[1px] duration-150 transform ease-in-out"
            >
              <div className="flex justify-between items-center p-3 py-4">
                <div className="h-full px-2  w-[300px] flex justify-center items-start flex-col">
                  <p className="font-bold text-sm text-left">{el.party_name}</p>
                  <p className="text-gray-400 text-xs">Customer</p>
                </div>
                <div className="h-full  w-[200px] flex text-right flex-col">
                  <div className="flex-col justify-center">
                    {/* <p className="font-semibold text-gray-600">Total Amount</p> */}
                    <div className="flex justify-end">
                      <p className="text-sm font-bold">
                        ₹{formatAmount(el.totalBillAmount)}
                      </p>
                      {/* <FaArrowDown className="ml-1 text-gray-700" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Group-wise View */}
      {selectedTab === "group" && !loading && data?.length > 0 ? (
        <div className="mt-6 px-4 pb-10">
          {data.map((group) => (
            <div key={group._id} className="mb-4 font-bold">
              {/* Main Group */}
              <button
                onClick={() => toggleGroup(group?._id)}
                className="w-full text-left  bg-[#f8ffff]  p-4 font-semibold rounded-xs shadow-md flex justify-between items-center transition-all hover:translate-y-[1px] duration-150 transform ease-in-out "
              >
                <div className="flex items-center gap-3">
                  <FaAngleDown
                    className={`${
                      expandedGroups[group?._id] &&
                      " transform translate duration-300 ease-in-out rotate-180"
                    }  mt-1`}
                  />
                  <span className="font-bold text-gray-500">{group?._id}</span>
                </div>
                <span className="text-gray-600   font-bold">
                  ₹{formatAmount(group?.totalAmount)}
                </span>
              </button>

              {/* Subgroups */}
              {expandedGroups[group?._id] &&
                group?.subgroups.map((subgroup) => (
                  <div key={subgroup?.group_name_id} className="ml-4  my-5">
                    <button
                      onClick={() => toggleSubGroup(subgroup?.group_name_id)}
                      className="w-full text-left bg-slate-50 p-3  shadow-sm  flex justify-between items-center transition-all hover:translate-y-[1px] duration-150 transform ease-in-out "
                    >
                      <div className="flex items-center gap-3">
                      <FaAngleDown
                          className={`${
                            expandedSubGroups[subgroup?.group_name_id] &&
                            " transform translate duration-300 ease-in-out rotate-180"
                          }  mt-1`}
                        />
                        <span className="font-medium text-sm">
                          {subgroup?.group_name}
                        </span>
                       
                      </div>

                      <span className="text-gray-600">
                        ₹{formatAmount(subgroup?.totalAmount)}
                      </span>
                    </button>

                    {/* Bills */}
                    {expandedSubGroups[subgroup?.group_name_id] && (
                      <div className="ml-4 my-5">
                        {subgroup.bills.map((bill, index) => (
                          <div
                          onClick={() =>
                            handleNavigate(bill?.party_id, bill?.party_name, bill?.bill_pending_amt)
                          }
                            key={index}
                            className="bg-white p-3 flex justify-between rounded-md shadow-sm mb-2 border border-gray-100"
                          >
                            <p className=" text-gray-700 text-sm font-semibold">{bill?.party_name}</p>
                            <p className="text-gray-600 mt-1">
                              ₹{formatAmount(bill.bill_pending_amt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        selectedTab === "group" && (
          <div className="flex justify-center h-screen items-center">
            <p className="font-semibold text-lg">No Data Available</p>
          </div>
        )
      )}
    </div>
  );
}

export default Outstanding;
