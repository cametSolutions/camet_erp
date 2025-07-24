import api from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

function TodaysTransaction() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
  );

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin"
      ? true
      : false;

  ///  api call to fetch today's transactions

  const fetchTodaysTransactions = async () => {
    const res = await api.get(
      `/api/sUsers/transactions/${cmp_id}?todayOnly=true&isAdmin=${isAdmin}`,
      {
        withCredentials: true,
      }
    );
    return res.data.data.combined;
  };

  const { data } = useQuery({
    queryKey: ["todaysTransaction", cmp_id, isAdmin],
    queryFn: fetchTodaysTransactions,
    enabled: !!cmp_id,
    refetchOnWindowFocus: false,
    refetchInterval:isAdmin ? 1 * 60 * 1000 : false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });


  console.log(data);
  

  return <div></div>;
}

export default TodaysTransaction;
