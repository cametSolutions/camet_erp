/* eslint-disable react-hooks/exhaustive-deps */
import { FaAngleDown } from "react-icons/fa6";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { formatAmount } from "../../../../backend/helpers/helper";
import {
  addGroupData,
  addLedgerData,
  addExpandedGroups,
  addExpandedSubGroups,
  addTab,
  addLedgerTotal,
  addGroupTotal,
  addPayableData,
  addReceivableData,
  addPayableTotal,
  addReceivableTotal,
  addScrollPosition,
} from "../../../slices/tallyDataSlice";
import SearchBar from "../../components/common/SearchBar";
import CustomBarLoader from "../../components/common/CustomBarLoader";
import useFetch from "../../customHook/useFetch";

function Outstanding() {
  // ---------- Redux & Router Hooks ----------
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const containerRef = useRef(null);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    ledgerData: ledgerDataFromRedux,
    groupData: groupDataFromRedux,
    payableData: payableDataFromRedux,
    receivableData: receivableDataFromRedux,
    expandedGroups: expandedGroupsFromRedux,
    expandedSubGroups: expandedSubGroupsFromRedux,
    scrollPosition: scrollPositionFromRedux,
    tab: tabFromRedux,
    ledgerTotal: ledgerTotalFromRedux,
    groupTotal: groupTotalFromRedux,
    payableTotal: payableTotalFromRedux,
    receivableTotal: receivableTotalFromRedux,
  } = useSelector((state) => state.tallyData);

  // ---------- State Management ----------
  const [selectedTab, setSelectedTab] = useState("ledger");
  const [ledgerData, setLedgerData] = useState([]);
  const [total, setTotal] = useState("");
  const [groupData, setGroupData] = useState([]);
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSubGroups, setExpandedSubGroups] = useState({});
  const [scrollPosition, setScrollPosition] = useState(0);

  // ---------- Data Fetching Logic ----------
  const shouldFetch =
    (selectedTab === "ledger" &&
      !ledgerDataFromRedux?.length &&
      ledgerData.length === 0) ||
    (selectedTab === "group" &&
      !groupDataFromRedux?.length &&
      groupData.length === 0) ||
    (selectedTab === "payables" && !payableDataFromRedux?.length) ||
    (selectedTab === "receivables" && !receivableDataFromRedux?.length);

  const { data: outstandingData, loading } = useFetch(
    shouldFetch
      ? `/api/sUsers/fetchOutstandingTotal/${cmp_id}?type=${selectedTab}`
      : null
  );

  // ---------- Effects ----------
  useEffect(() => {
    if (tabFromRedux) setSelectedTab(tabFromRedux);
    if (expandedGroupsFromRedux) setExpandedGroups(expandedGroupsFromRedux);
    if (expandedSubGroupsFromRedux)
      setExpandedSubGroups(expandedSubGroupsFromRedux);
    if (selectedTab === "ledger") setTotal(ledgerTotalFromRedux);
    if (selectedTab === "group") setTotal(groupTotalFromRedux);
  }, [scrollPositionFromRedux, tabFromRedux]);

  // Reset data on tab change
  useEffect(() => {
    if (selectedTab === "ledger" && !ledgerDataFromRedux?.length) {
      setLedgerData([]);
    } else if (selectedTab === "group" && !groupDataFromRedux?.length) {
      setGroupData([]);
    }
  }, [selectedTab]);

  // Handle fetched data useEffect
  useEffect(() => {
    if (!outstandingData?.outstandingData) return;

    if (selectedTab === "ledger" && !ledgerDataFromRedux?.length) {
      const {
        outstandingData: ledgerOutstandingData,
        totalOutstandingPayable,
        totalOutstandingReceivable,
        totalOutstandingDrCr,
      } = outstandingData;
      dispatch(addLedgerData(ledgerOutstandingData));
      const notation =
        totalOutstandingReceivable > totalOutstandingPayable ? "Dr" : "Cr";

      dispatch(addLedgerTotal(`${totalOutstandingDrCr} ${notation}`));
      setTotal(`${totalOutstandingDrCr} ${notation}`);
      setLedgerData(ledgerOutstandingData);
    } else if (selectedTab === "group" && !groupDataFromRedux?.length) {
      const {
        outstandingData: groupOutstandingData,
        totalOutstandingPayable,
        totalOutstandingReceivable,
        totalOutstandingDrCr,
      } = outstandingData;

      const notation =
        totalOutstandingReceivable > totalOutstandingPayable ? "Dr" : "Cr";

      dispatch(addGroupData(groupOutstandingData));
      dispatch(addGroupTotal(`${totalOutstandingDrCr} ${notation}`));
      setTotal(outstandingData?.totalOutstandingDrCr);
      setGroupData(groupOutstandingData);
    } else if (selectedTab === "payables") {
      dispatch(addPayableData(outstandingData.outstandingData));
      dispatch(addPayableTotal(`${outstandingData.totalOutstanding} Cr`));
      setLedgerData(`${outstandingData.totalOutstanding} Cr`);
      setTotal(outstandingData.totalOutstanding);
    } else if (selectedTab === "receivables") {
      dispatch(addReceivableData(outstandingData.outstandingData));
      dispatch(addReceivableTotal(`${outstandingData.totalOutstanding} Dr`));
      setLedgerData(outstandingData.outstandingData);
      setTotal(`${outstandingData.totalOutstanding} Dr`);
    }
  }, [outstandingData]);

  // Sync local state with Redux
  useEffect(() => {
    if (selectedTab === "ledger" && ledgerDataFromRedux?.length) {
      setLedgerData(ledgerDataFromRedux);
      setTotal(ledgerTotalFromRedux);
    } else if (selectedTab === "group" && groupDataFromRedux?.length) {
      setGroupData(groupDataFromRedux);
      setTotal(groupTotalFromRedux);
    } else if (selectedTab === "payables" && payableDataFromRedux?.length) {
      setLedgerData(payableDataFromRedux);
      setTotal(payableTotalFromRedux);
    } else if (
      selectedTab === "receivables" &&
      receivableDataFromRedux?.length
    ) {
      setLedgerData(receivableDataFromRedux);
      setTotal(receivableTotalFromRedux);
    }
  }, [
    selectedTab,
    ledgerDataFromRedux,
    groupDataFromRedux,
    payableDataFromRedux,
    receivableDataFromRedux,
    scrollPositionFromRedux,
  ]);

  /// -------------for handling scroll -----------------------

  //  scroll position restoration
  useEffect(() => { 
    const restoreScrollPosition = () => {
      if (
        containerRef.current &&
        typeof scrollPositionFromRedux === "number" &&
        !isNaN(scrollPositionFromRedux)
      ) {
        // Use requestAnimationFrame to ensure the DOM is fully rendered
        requestAnimationFrame(() => {
          containerRef.current.scrollTop = scrollPositionFromRedux;
        });
      }
    };

    // Restore scroll position after a short delay to ensure content is loaded
    const timeoutId = setTimeout(restoreScrollPosition, 100);

    return () => clearTimeout(timeoutId);
  }, [scrollPositionFromRedux]);

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

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

  const handleNavigate = (
    party_id,
    party_name,
    totalBillAmount,
    classification
  ) => {
    dispatch(addExpandedGroups(expandedGroups));
    dispatch(addExpandedSubGroups(expandedSubGroups));
    dispatch(addScrollPosition(scrollPosition));
    navigate(`/sUsers/outstandingDetails/${party_id}`, {
      state: { party_name, totalBillAmount, selectedTab, classification },
    });
  };

  // ---------- Data Processing ----------
  const filterOutstanding = (data) => {
    if (!Array.isArray(data)) return []; // Ensure data is an array
    return data.filter((item) =>
      item.party_name?.toLowerCase()?.includes(search?.toLowerCase())
    );
  };

  const finalData = filterOutstanding(
    selectedTab === "group" ? groupData : ledgerData
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col pb-3   ">
      <div
        id="title-div"
        className="sticky top-0 flex flex-col z-30 bg-white shadow-lg "
      >
        <div className="flex items-center justify-between w-full bg-[#012a4a] shadow-lg px-4 py-3">
          <div className="flex items-center gap-2 cursor-pointer">
            <IoIosArrowRoundBack
              onClick={() => navigate(-1, { replace: true })}
              className="text-white text-3xl"
            />
            <p className="text-white text-lg font-bold">Outstanding</p>
          </div>
        </div>

        <div
          className={` ${
            loading ? "animation-pulse opacity-80" : ""
          }  bg-[#219ebc] flex flex-col shadow-xl justify-center items-center py-14 sm:py-10 relative`}
        >
          <div className="absolute left-0 top-2">
            <select
              onChange={(e) => {
                setSelectedTab(e.target.value);
                dispatch(addTab(e.target.value));
              }}
              value={selectedTab}
              className="w-full bg-[#219ebc] text-white sm:max-w-sm md:max-w-sm text-sm font-bold py-2 px-3 cursor-pointer no-focus-box outline-none border-none !border-b"
            >
              <option value="ledger">Ledger</option>
              <option value="payables">Payables</option>
              <option value="receivables">Receivables</option>
              {/* <option value="group">Group</option> */}
            </select>
          </div>

          <div className=" text-center text-white flex justify-center items-center flex-col">
            <h2 className="text-3xl sm:text-4xl font-bold">
              {total &&
                parseInt(total?.split(" ")[0])
                  .toFixed(2)
                  .concat(" ", total?.split(" ")[1])}
            </h2>
            <Link to={`/sUsers/outstandingSummary`}>
              <button className="text-xs mt-4 font-bold opacity-90 underline hover:scale-105 transition-transform duration-300">
                View Bill Party Wise
              </button>
            </Link>
          </div>
        </div>
        {selectedTab !== "group" ? (
          <SearchBar onType={searchData} />
        ) : (
          <div className="bg-white py-3 "></div>
        )}
      </div>

      {loading && <CustomBarLoader />}

      <div ref={containerRef} className="flex flex-1 overflow-y-auto w-full  ">
        {/* Ledger/Payables/Receivables View */}
        {(selectedTab === "ledger" ||
          selectedTab === "payables" ||
          selectedTab === "receivables") &&
        !loading &&
        finalData?.length > 0 ? (
          <div
            className={`  flex flex-col gap-2 pt-2 text-center md:px-2 cursor-pointer w-full mt-4 `}
          >
            {finalData.map((el, index) => (
              <div
                key={index}
                onClick={() =>
                  handleNavigate(
                    el?._id,
                    el?.party_name,
                    el?.totalBillAmount,
                    el?.classification
                  )
                }
                className="bg-[#f8ffff] rounded-md shadow-xl border border-gray-100 flex flex-col px-4 transition-all hover:translate-y-[1px] duration-150 transform ease-in-out"
              >
                <div className="flex justify-between items-center p-3 py-6">
                  <div className="px-2 w-[300px] flex justify-center items-start flex-col">
                    <p className="font-bold text-sm text-left">
                      {el.party_name}
                    </p>
                  </div>
                  <div className="w-[200px] flex text-right flex-col">
                    <div className="flex-col justify-center">
                      <div className="flex justify-end">
                        <p className="text-sm font-bold text-gray-500">
                          ₹{formatAmount(el.totalBillAmount)}{" "}
                          {el?.classification}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Group View - Keeping the existing group view code */}
        {selectedTab === "group" && !loading && groupData?.length > 0 ? (
          <div className="pt-4 px-4 pb-10  w-full ">
            {groupData.map((group) => (
              <div key={group._id} className="mb-4 font-bold last:mb-9">
                <button
                  onClick={() => toggleGroup(group?.accountGroup_id)}
                  className="w-full text-left bg-blue-50 p-4 font-semibold   rounded-sm flex justify-between items-center transition-all hover:translate-y-[1px] duration-150 transform ease-in-out"
                >
                  <div className="flex items-center gap-3">
                    <FaAngleDown
                      className={`${
                        expandedGroups[group?.accountGroup_id] &&
                        " transform translate duration-300 ease-in-out rotate-180"
                      }  mt-1`}
                    />
                    <span className="font-bold text-gray-700">
                      {group?.accountGroup}
                    </span>
                  </div>
                  <span className="text-gray-700 font-bold">
                    ₹{formatAmount(group?.totalAmount)} {group?.classification}
                  </span>
                </button>

                {expandedGroups[group?.accountGroup_id] && (
                  <>
                    {/* Render Bills Without a Sub-Group */}
                    {group.bills.length > 0 && (
                      <div className="ml-4 my-5">
                        {group.bills.map((bill, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              handleNavigate(
                                bill?.party_id,
                                bill?.party_name,
                                bill?.bill_pending_amt,
                                bill?.classification
                              )
                            }
                            className="bg-white p-3 flex justify-between items-center shadow-sm mb-2 border border-gray-200 cursor-pointer"
                          >
                            <p className="text-gray-700 text-sm font-semibold">
                              {bill?.party_name}
                            </p>
                            <p className="text-gray-600 mt-1">
                              ₹{formatAmount(bill.bill_pending_amt)}{" "}
                              {bill?.classification}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render Sub-Groups */}
                    {group.subgroups.map((subgroup) => (
                      <div key={subgroup?.subGroup_id} className="ml-4 my-5">
                        <button
                          onClick={() => toggleSubGroup(subgroup?.subGroup_id)}
                          className="w-full text-left bg-blue-50 p-3 shadow-sm flex justify-between items-center transition-all hover:translate-y-[1px] duration-150 transform ease-in-out"
                        >
                          <div className="flex items-center gap-3">
                            <FaAngleDown
                              className={`${
                                expandedSubGroups[subgroup?.subGroup_id] &&
                                " transform translate duration-300 ease-in-out rotate-180"
                              }  mt-1`}
                            />
                            <span className="font-medium text-sm">
                              {subgroup?.subGroup}
                            </span>
                          </div>

                          <span className="text-gray-600">
                            ₹{formatAmount(subgroup?.totalAmount)}{" "}
                            {group?.classification}
                          </span>
                        </button>

                        {expandedSubGroups[subgroup?.subGroup_id] && (
                          <div className="ml-4 my-5">
                            {subgroup.bills.map((bill, index) => (
                              <div
                                key={index}
                                onClick={() =>
                                  handleNavigate(
                                    bill?.party_id,
                                    bill?.party_name,
                                    bill?.bill_pending_amt,
                                    bill?.classification
                                  )
                                }
                                className="bg-white p-3 flex justify-between rounded-md shadow-sm mb-2 border border-gray-100 cursor-pointer"
                              >
                                <p className="text-gray-700 text-sm font-semibold">
                                  {bill?.party_name}
                                </p>
                                <p className="text-gray-600 mt-1">
                                  ₹{formatAmount(bill.bill_pending_amt)}{" "}
                                  {bill?.classification}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          selectedTab === "group" && (
            <div className="flex justify-center items-center">
              <p className="font-semibold text-lg">No Data Available</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Outstanding;
