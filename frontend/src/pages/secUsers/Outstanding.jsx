import { FaAngleDown } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { CgDetailsLess } from "react-icons/cg";
import { formatAmount } from "../../../../backend/helpers/helper";
import {
  addGroupData,
  addLedgerData,
  addExpandedGroups,
  addExpandedSubGroups,
  // addScrollPosition,
  addTab,
  addLedgerTotal,
  addGroupTotal,
} from "../../../slices/tallyDataSlice";
import SearchBar from "../../components/common/SearchBar";
import CustomBarLoader from "../../components/common/CustomBarLoader";
import useFetch from "../../customHook/useFetch";

function Outstanding() {
  // ---------- Redux & Router Hooks ----------
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    ledgerData: ledgerDataFromRedux,
    groupData: groupDataFromRedux,
    expandedGroups: expandedGroupsFromRedux,
    expandedSubGroups: expandedSubGroupsFromRedux,
    scrollPosition: scrollPositionFromRedux,
    tab: tabFromRedux,
    ledgerTotal: ledgerTotalFromRedux,
    groupTotal: groupTotalFromRedux,
  } = useSelector((state) => state.tallyData);

  // ---------- State Management ----------
  const [selectedTab, setSelectedTab] = useState("ledger");
  const [ledgerData, setLedgerData] = useState([]);
  const [total, setTotal] = useState(0);
  const [groupData, setGroupData] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSubGroups, setExpandedSubGroups] = useState({});
  // const [scrollPosition, setScrollPosition] = useState(0);

  // ---------- Data Fetching Logic ----------
  const shouldFetch =
    (selectedTab === "ledger" &&
      !ledgerDataFromRedux?.length &&
      ledgerData.length === 0) ||
    (selectedTab === "group" &&
      !groupDataFromRedux?.length &&
      groupData.length === 0);

  const { data: outstandingData, loading } = useFetch(
    shouldFetch
      ? `/api/sUsers/fetchOutstandingTotal/${cmp_id}?type=${selectedTab}`
      : null
  );

  // ---------- Effects ----------

  /// to fetch the scroll postion

  // Restore scroll position on component mount
  useEffect(() => {
    // if (scrollPositionFromRedux) {
    //   window.scrollTo(0, scrollPositionFromRedux);
    // }
    if (tabFromRedux) setSelectedTab(tabFromRedux);
    if (expandedGroupsFromRedux) setExpandedGroups(expandedGroupsFromRedux);
    if (expandedSubGroupsFromRedux)
      setExpandedSubGroups(expandedSubGroupsFromRedux);
    if (selectedTab === "ledger") setTotal(ledgerTotalFromRedux);
    if (selectedTab === "group") setTotal(groupTotalFromRedux);
  }, [scrollPositionFromRedux, tabFromRedux]);

  // Save scroll position before navigating away

  // Reset data on tab change
  useEffect(() => {
    if (selectedTab === "ledger" && !ledgerDataFromRedux?.length) {
      setLedgerData([]);
    } else if (selectedTab === "group" && !groupDataFromRedux?.length) {
      setGroupData([]);
    }
  }, [selectedTab]);

  // Handle fetched data
  useEffect(() => {
    if (!outstandingData?.outstandingData) return;

    if (selectedTab === "ledger" && !ledgerDataFromRedux?.length) {
      const ledgerOutstandingData = outstandingData.outstandingData;
      dispatch(addLedgerData(ledgerOutstandingData));
      dispatch(addLedgerTotal(outstandingData?.totalOutstandingAmount));
      setTotal(outstandingData?.totalOutstandingAmount);
      setLedgerData(ledgerOutstandingData);
    } else if (selectedTab === "group" && !groupDataFromRedux?.length) {
      const groupOutstandingData = outstandingData.outstandingData;
      dispatch(addGroupData(groupOutstandingData));
      dispatch(addGroupTotal(outstandingData?.totalOutstandingAmount));
      setTotal(outstandingData?.totalOutstandingAmount);

      setGroupData(groupOutstandingData);
    }
  }, [outstandingData]);

  // Sync local state with Redux
  useEffect(() => {
    if (selectedTab === "ledger" && ledgerDataFromRedux?.length) {
      setLedgerData(ledgerDataFromRedux);
    } else if (selectedTab === "group" && groupDataFromRedux?.length) {
      setGroupData(groupDataFromRedux);
    }
  }, [selectedTab, ledgerDataFromRedux, groupDataFromRedux]);

  // ---------- Event Handlers ----------
  const searchData = (data) => {
    setSearch(data);
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

  const handleNavigate = (party_id, party_name, totalBillAmount) => {
    // Save current expanded states and scroll position before navigation

    dispatch(addExpandedGroups(expandedGroups));
    dispatch(addExpandedSubGroups(expandedSubGroups));
    navigate(`/sUsers/outstandingDetails/${party_id}`, {
      state: { party_name, totalBillAmount },
    });
  };

  // ---------- Data Processing ----------
  const filterOutstanding = (data) => {
    return data.filter((item) =>
      item.party_name?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const finalData = filterOutstanding(
    selectedTab === "ledger" ? ledgerData : groupData
  );

  return (
    <div>
      <div className="sticky top-0 flex flex-col z-30 bg-white shadow-lg ">
        <div className="flex items-center justify-between w-full bg-[#012a4a] shadow-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <IoIosArrowRoundBack
              onClick={() => navigate("/sUsers/reports")}
              className="text-white text-3xl"
            />
            <p className="text-white text-lg font-bold">Outstanding</p>
          </div>
          {/* <Link to={`/sUsers/outstandingSummary`}>
            <div className="text-white text-xs font-bold flex items-center gap-2 bg-[#163c5a] hover:bg-[#244a67] hover:scale-105 transform ease-in-out duration-200 py-1 px-3 rounded-sm shadow-lg cursor-pointer">
              <p>Summary</p>
              <CgDetailsLess size={20} />
            </div>
          </Link> */}
        </div>


        <div className="bg-[#219ebc] flex flex-col  shadow-xl justify-center items-center  py-14 sm:py-10   relative ">
          <div className="absolute left-0 top-2">
            <select
              onChange={(e) => {
                setSelectedTab(e.target.value);
                dispatch(addTab(e.target.value));
              }}
              value={selectedTab}
              className="w-full bg-[#219ebc] text-white sm:max-w-sm md:max-w-sm text-sm font-bold   py-2 px-3  cursor-pointer no-focus-box border-none !border-b"
            >
              <option value="ledger">Ledger</option>
              <option value="group">Group</option>
              {/* <option value="payable">Payable</option>
              <option value="receivable">Receivable</option> */}
            </select>
          </div>

          <div className="text-center text-white flex justify-center items-center flex-col ">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ₹{total?.toFixed(2)}
            </h2>
            <Link to={`/sUsers/outstandingSummary`}>
            <button
              onClick={handleNavigate}
              className="text-xs mt-4 font-bold opacity-90 underline hover:scale-105 transition-transform duration-300"
            >
              View Summary
            </button>
            </Link>
          </div>
        </div>
        <SearchBar onType={searchData} />

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
                <div className=" px-2  w-[300px] flex justify-center items-start flex-col">
                  <p className="font-bold text-sm text-left">{el.party_name}</p>
                  <p className="text-gray-400 text-xs">Customer</p>
                </div>
                <div className="  w-[200px] flex text-right flex-col">
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
      {selectedTab === "group" && !loading && groupData?.length > 0 ? (
        <div className="mt-6 px-4 pb-10">
          {groupData.map((group) => (
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
                              handleNavigate(
                                bill?.party_id,
                                bill?.party_name,
                                bill?.bill_pending_amt
                              )
                            }
                            key={index}
                            className="bg-white p-3 flex justify-between rounded-md shadow-sm mb-2 border border-gray-100"
                          >
                            <p className=" text-gray-700 text-sm font-semibold">
                              {bill?.party_name}
                            </p>
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
          <div className="flex justify-center  items-center">
            <p className="font-semibold text-lg">No Data Available</p>
          </div>
        )
      )}
    </div>
  );
}

export default Outstanding;
