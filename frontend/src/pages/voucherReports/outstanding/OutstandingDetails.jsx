import { IoPersonSharp } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useParams, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TitleDiv from "../../../components/common/TitleDiv";
import useFetch from "../../../customHook/useFetch";

function OutStandingDetails() {
  const [data, setData] = useState([]);

  function formatAmount(amount) {
    // Use toLocaleString to add commas to the number
    return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const location = useLocation();
  const { party_id } = useParams();

  const { party_name, totalBillAmount, selectedTab,classification } = location.state;
  


  const { data: apiData, loading } = useFetch(
    `/api/sUsers/fetchOutstandingDetails/${party_id}/${cmp_id}`
  );

  useEffect(() => {
    if (apiData && selectedTab) {
      const { outstandings } = apiData;

      let finalData = [];
      if (selectedTab === "payables") {
        finalData = outstandings.filter((item) => item.classification === "Cr");
      } else if (selectedTab === "receivables") {
        finalData = outstandings.filter((item) => item.classification === "Dr");
      } else {
        finalData = outstandings;
      }
      setData(finalData);
    }
  }, [apiData, selectedTab]);

  return (
    <div className="  pb-5   ">
      <div className="sticky  top-0 z-10 w-full shadow-lg  flex flex-col rounded-[3px] gap-1">
        {/* receive payment */}

        <div className=" flex flex-col rounded-[3px] gap-1  bg-white">
          <TitleDiv title="Outstanding Details" loading={loading} />

          {/* party details */}
          <div className="flex justify-between px-5 py-4 bg-white font-bold border-b-2">
            <div className="flex items-center gap-2 ">
              <IoPersonSharp />
              <p className="font-bold  text-gray-500">{party_name}</p>
            </div>
            <p className="  text-green-600">
              ₹{formatAmount(parseFloat(totalBillAmount))} {classification}
            </p>
          </div>

          <div
            className="bg-white px-4 py-2 rounded-md flex gap-2"
            style={{ boxShadow: "0px -4px 115px rgba(244,246,254 0.1)" }}
          >
            <p className="text-[11px] font-bold"># Bills ({data.length})</p>
            <FaChevronDown />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-1 mt-2 text-center px-2  ">
        {data?.length > 0
          ? data.map((el, index) => {
              return (
                <div
                  key={index}
                  className=" mb-2 cursor-pointer bg-slate-50  rounded-md shadow-lg border border-gray-100  flex justify-between pr-4  transition-all duration-150 transform ease-in-out "
                >
                  <div className=" h-full= py-8 lg:p-6 w-[200px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1 text-left">
                        <p className="font-bold text-[12px] text-violet-500">
                          #{el.bill_no}
                        </p>
                        <pc className="text-xs font-bold  text-gray-500 ">
                          {dayjs(el.bill_date).format("DD/MM/YYYY")}
                        </pc>
                      </div>
                    </div>
                  </div>
                  <div className=" h-full p-2  w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-end  relative flex-col">
                    <div className="flex-col justify-center text-end ">
                      <p className="  font-bold text-gray-600 ">
                        ₹{formatAmount(el.bill_pending_amt)}
                        <span className=" text-sm">
                          {" "}
                          {el?.classification}{" "}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          : !loading && (
              <p className=" text-sm font-bold text-gray-500 mt-10">
                No Bills Were Found
              </p>
            )}
      </div>
    </div>
  );
}

export default OutStandingDetails;
