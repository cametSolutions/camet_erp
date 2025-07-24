import api from "@/api/api";
import DashboardTransaction from "@/components/common/DashboardTransaction";
import TransactionSkeleton from "@/components/common/TransactionSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import NotFound from "../../../assets/images/space.png";
import { LoaderCircle } from "lucide-react";

function TodaysTransaction() {
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?._id
  );

  const isAdmin =
    JSON.parse(localStorage.getItem("sUserData")).role === "admin";

  const fetchTodaysTransactions = async () => {
    const res = await api.get(
      `/api/sUsers/transactions/${cmp_id}?todayOnly=true&isAdmin=${isAdmin}`,
      {
        withCredentials: true,
      }
    );
    return res.data.data.combined;
  };

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: ["todaysTransaction", cmp_id, isAdmin],
    queryFn: fetchTodaysTransactions,
    enabled: !!cmp_id,
    refetchOnWindowFocus: false,
    refetchInterval: isAdmin ? 5 * 60 * 1000 : false,
    staleTime: isAdmin ? 5 * 60 * 1000 : Infinity,
    retry: 1,
  });

  return (
    <div>
      {isLoading && <TransactionSkeleton />}

      {error && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-301px)] ">
          <p className="text-gray-500 font-semibold text-xs">
            An error occurred while fetching transactions.
          </p>
          <button
            onClick={refetch}
            disabled={isFetching}
            className="px-4 py-1 text-xs bg-blue-400 hover:bg-blue-700 text-white rounded mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && data?.length === 0 && !error ? (
        <div className="h-[calc(100vh-301px)] flex justify-center flex-col items-center">
          <img className="h-12 w-12" src={NotFound} alt="" />
          <p className="text-xs font-bold text-gray-500 mt-2">
            {" "}
            No Transactions
          </p>
        </div>
      ) : (
        !error && <DashboardTransaction filteredData={data} from="dashboard" />
      )}
    </div>
  );
}

export default TodaysTransaction;
