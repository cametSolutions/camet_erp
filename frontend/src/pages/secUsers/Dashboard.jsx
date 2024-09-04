/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSidebar } from "../../layout/Layout";
import DashBoard from "../../components/common/DashBoard";

function Dashboard() {
  const [data, setData] = useState([]);

  const navigate = useNavigate();

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // const dispatch = useDispatch();

  const { handleToggleSidebar } = useSidebar();

  useEffect(() => {
    if (org) {
      const fetchTransactions = async () => {
        try {
          const res = await api.get(`/api/sUsers/transactions/${org._id}`, {
            withCredentials: true,
          });

          setData(res.data.data.combined);

          // dispatch(addData(res.data.outstandingData));
        } catch (error) {
          console.log(error);
          setData([]);
        }
      };
      fetchTransactions();
    }
  }, [org]);

  const today = new Date();

  // Filter data based on today's date
  const filteredData = data?.filter((item) => {
    const createdAtDate = new Date(item.createdAt);
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
    <DashBoard
      handleToggleSidebar={handleToggleSidebar}
      filteredData={filteredData}
      org={org}
      receiptTotal={receiptTotal}
      handleLinkClick={handleLinkClick}
      type="secondary"
      from="dashboard"
    />
  );
}

export default Dashboard;
