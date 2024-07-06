/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { MdInventory } from "react-icons/md";
import { CiCalendarDate } from "react-icons/ci";
import api from "../../api/api";
import { FaCaretDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { BiSolidAddToQueue } from "react-icons/bi";
import { removeAll } from "../../../slices/invoice";
import { removeAllSales } from "../../../slices/sales";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSidebar } from "../../layout/Layout";
import DashboardTransaction from "../../components/common/DashboardTransaction";
import DashboardCardPrimary from "../../components/homePage/DashboardCardPrimary";

function Dashboard() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  console.log(org);
  const dispatch = useDispatch();

  const { handleToggleSidebar } = useSidebar();

  useEffect(() => {
    if (org) {
      const fetchTransactions = async () => {
        try {
          const res = await api.get(`/api/pUsers/transactions/${org._id}`, {
            withCredentials: true,
          });

          setData(res.data.data.combined);

          // dispatch(addData(res.data.outstandingData));
        } catch (error) {
          console.log(error);
        }
      };
      fetchTransactions();
      dispatch(removeAll());
      dispatch(removeAllSales());
    }
  }, [org]);

  console.log(data);

  const today = new Date();

  // Filter data based on today's date
  const filteredData = data.filter((item) => {
    const createdAtDate = new Date(item.createdAt);
    return createdAtDate.toDateString() === today.toDateString();
  });
  console.log(filteredData);

  const receiptTotal = filteredData.reduce((acc, curr) => {
    if (!curr.isCancelled) {
      return (acc = acc + parseFloat(curr.enteredAmount));
    } else {
      return acc;
    }
  }, 0);

  // Handle click event of link
  const handleLinkClick = (to) => {
    if (org == undefined) {
      toast.error("No company available");
    } else if (org.isApproved === false) {
      toast.error("Company approval pending ");
    } else {
      navigate(to, { state: { receiptTotal } });
    }
  };

  console.log(receiptTotal);

  console.log(filteredData);

  return (
    <div className="">
      <div className="sticky top-0  ">
        <div className="sticky top-0  z-[100] h-[100px] ">
          <div className="bg-[#012a4a]   sticky top-0 p-3  text-white text-lg font-bold flex items-center gap-3  shadow-lg">
            <IoReorderThreeSharp
              onClick={handleToggleSidebar}
              className="block md:hidden text-3xl"
            />
            <p>Dashboard</p>
          </div>

          {/* company name */}

          <div className="  bg-white shadow-lg p-2  flex items-center gap-3">
            <div className="bg-blue-500 rounded-full w-[30px] h-[30px]  flex justify-center items-center text-md  text-white font-bold">
              <div className="rounded-full w-[25px] h-[25px] md:w-[25px] md:h-[25px] bg-[#012a4a] flex items-center justify-center">
                <p>{org?.name?.slice(0, 1)}</p>
              </div>
            </div>
            <p className="font-bold text-md md:text-lg">
              {org?.name || "Company Name"}
            </p>
            <FaCaretDown />
          </div>
        </div>
        {/* company name */}

        <div className="flex flex-col md:flex-row   ">
          <div className="sticky top-[100px] z-20  shadow-xl  ">
            {/* tiles */}
            <DashboardCardPrimary
              receiptTotal={receiptTotal}
              handleLinkClick={handleLinkClick}
              userType={"primary"}
            />
            {/* tiles */}

            <div className=" md:hidden border-t-2  bg-white px-4 p-2  text-gray-500 text-sm md:text-lg font-bold flex items-center gap-3 z shadow-lg sm:sticky top-[115px]">
              <p> Today's Transactions</p>

              <p className="text-[9px] md:text-sm">
                ( {new Date().toDateString()} )
              </p>
              <CiCalendarDate className="text-xl font-bold text-violet-500" />
              <FaCaretDown />
            </div>
          </div>

          {/* transactions */}

          <div className=" md:flex-1 z-10  ">
            <div className="hidden md:block  md:sticky md:top-[97px] z-10">
              <div className=" bg-white p-2  text-gray-500 text-sm md:text-lg font-bold flex items-center gap-3 z shadow-lg  ">
                <p> Today's Transactions</p>

                <p className="text-[9px] md:text-sm">
                  ( {new Date().toDateString()} )
                </p>
                <CiCalendarDate className="text-xl font-bold text-violet-500" />
                <FaCaretDown />
              </div>
            </div>
            {/* one */}
            <DashboardTransaction filteredData={filteredData} />
            {/* one */}
          </div>

          {/* transactions */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
