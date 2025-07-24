/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSidebar } from "../../../layout/Layout";
import RemoveReduxData from "../../../components/secUsers/RemoveReduxData";
import DashBoardLayout from "./DashboardLayout";

function Dashboard() {
  const [data, setData] = useState([]);
  const [loader, setLoader] = useState(false);

  const navigate = useNavigate();

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );


      


  const { handleToggleSidebar } = useSidebar();
  // useEffect(() => {
  //   if (org) {
  //     const fetchTransactions = async () => {
  //       setLoader(true);
  //       try {
  //         const res = await api.get(
  //           `/api/sUsers/transactions/${org._id}?todayOnly=true&isAdmin=${isAdmin}`,
  //           {
  //             withCredentials: true,
  //           }
  //         );

  //         setData(res.data.data.combined);

  //         // dispatch(addData(res.data.outstandingData));
  //       } catch (error) {
  //         console.log(error);
  //         setData([]);
  //       } finally {
  //         setLoader(false);
  //       }
  //     };
  //     fetchTransactions();
  //   }
  // }, [org]);

  const today = new Date();
  // Filter data based on today's date
  const filteredData = data?.filter((item) => {
    const createdAtDate = new Date(item?.date);

    return createdAtDate.toDateString() === today.toDateString();
  });

  const receiptTotal = filteredData?.reduce((acc, curr) => {
    if (!curr.isCancelled) {
      return (acc = acc + parseFloat(curr.enteredAmount));
    } else {
      return acc;
    }
  }, 0);

  const handleLinkClick = (to) => {
    if (org == undefined) {
      toast.error("No company available");
    } else if (org.isApproved === false) {
      toast.error("Company approval pending ");
    } else {
      navigate(to, { state: { receiptTotal } });
    }
  };

  return (
    <div>
      <RemoveReduxData />
      <DashBoardLayout
        handleToggleSidebar={handleToggleSidebar}
        filteredData={filteredData}
        org={org}
        receiptTotal={receiptTotal}
        handleLinkClick={handleLinkClick}
        type="secondary"
        from="dashboard"
        loader={loader}
      />
    </div>
  );
}

export default Dashboard;
