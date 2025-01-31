/* eslint-disable react/jsx-key */
/* eslint-disable react/no-unknown-property */
import { FaArrowDown } from "react-icons/fa6";
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
  const [selectedFilter, setSelectedFilter] = useState("");

  const navigate = useNavigate();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data: outstandingData, loading } = useFetch(
    `/api/sUsers/fetchOutstandingTotal/${cmp_id}`
  );

  useEffect(() => {
    if (outstandingData) {
      setData(outstandingData?.outstandingData);
    }
  }, [cmp_id, outstandingData]);

  const searchData = (data) => {
    setSearch(data);
  };

  // Filtering Function
  const filterOutstanding = (data) => {

    return data.filter((item) => {
      const searchFilter = item.party_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

        

      const groupFilter = selectedFilter
        ? item.group_name_id === Number(selectedFilter) ||
          item.accountGroup === selectedFilter
        : true;

      return searchFilter && groupFilter;
    });
  };

  const finalData = filterOutstanding(data);

  const handleNavigate = (party_id, party_name, totalBillAmount) => {
    navigate(`/sUsers/outstandingDetails/${party_id}`, {
      state: { party_name, totalBillAmount },
    });
  };

  return (
    <div className="  ">
      <div className="sticky top-0 flex flex-col z-30 bg-white shadow-lg pb-2">
        <div className="flex items-center justify-between w-full bg-[#012a4a] shadow-lg px-4 py-3 pb-3">
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

        {/* Search Bar */}
        <SearchBar onType={searchData} />

        {/* Filter Dropdown */}
        <div className="px-4 mt-2 sm:w-1/4 ">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className=" text-xs w-full p-2 border border-gray-300 rounded no-focus-box border-none" 
          >
            <option value="">All Groups</option>
            {outstandingData?.uniqueGroups?.map((group) => (
              <option key={group.group_name_id} value={group.group_name_id}>
                {group.group_name}
              </option>
            ))}
            {outstandingData?.uniqueAccountGroups?.map((accountGroup) => (
              <option key={accountGroup} value={accountGroup}>
                {accountGroup}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <CustomBarLoader />}

      {!loading && finalData?.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 mt-6 text-center pb-10 md:px-2 cursor-pointer">
          {finalData.map((el, index) => (
            <div
              key={index}
              onClick={() =>
                handleNavigate(el?._id, el?.party_name, el?.totalBillAmount)
              }
              className="bg-[#f8ffff] rounded-md shadow-xl border border-gray-100 flex flex-col px-4 transition-all hover:translate-y-[1px] duration-150 transform ease-in-out"
            >
              <div className="flex justify-between items-center">
                <div className="h-full px-2 py-8 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col">
                  <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left">
                    {el.party_name}
                  </p>
                  <p className="text-gray-400 text-sm">Customer</p>
                </div>
                <div className="h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex text-right relative flex-col">
                  <div className="flex-col justify-center">
                    <p className="font-semibold text-green-600">Total Amount</p>
                    <div className="flex justify-end text-right">
                      <p className="text-sm font-bold">
                        ₹{formatAmount(el.totalBillAmount)}
                      </p>
                      <FaArrowDown className="ml-1 md:mt-[.1rem] text-green-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading &&
        finalData?.length === 0 && (
          <div className="flex justify-center h-screen items-center">
            <p className="font-semibold text-lg">No Data Available</p>
          </div>
        )
      )}
    </div>
  );
}

export default Outstanding;
