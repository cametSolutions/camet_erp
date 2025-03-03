import DashboardTransaction from "@/components/common/DashboardTransaction";
import TitleDiv from "@/components/common/TitleDiv";
import { useLocation } from "react-router-dom";
function SalesSummaryTransactions() {
  const location = useLocation();
  const transactions = location.state.transactions;


  return (
    <div>
      <TitleDiv title="Sales Summary Transactions" from="/sUsers/salesSummary"/>

      <section className="mt-3">
        <DashboardTransaction
          filteredData={transactions}
          userType={"secondary"}
          from="/sUsers/reports/orderSummary"
        />
      </section>
    </div>
  );
}

export default SalesSummaryTransactions;
