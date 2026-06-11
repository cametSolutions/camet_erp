/* eslint-disable react/prop-types */
import StatCard from "./StatCard";
import {
  RevenueIllustration,
  DailyCollectionIllustration,
  MonthlyCollectionIllustration,
} from "./CardIllustrations";
import RevenueBreakdownSheet from "./RevenueBreakdownSheet";
import { useState } from "react";

const SummaryCards = ({
  totalRevenue = "₹0",
  dailyCollection = "₹0",
  monthlyCollection = "₹0",
  dailyCash = "₹0",
  dailyBank = "₹0",
  monthlyCash = "₹0",
  monthlyBank = "₹0",
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  const cards = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      subtitle: "All time earnings",
      bgColor: "#1db974",
      illustration: RevenueIllustration,
      onClick: () => setSheetOpen(true),
    },
    {
      title: "Daily Collection",
      value: dailyCollection,
      subtitle: "Today's collection",
      bgColor: "#2a5298",
      illustration: DailyCollectionIllustration,
      cashTotal: dailyCash,
      bankTotal: dailyBank,
    },
    {
      title: "Monthly Collection",
      value: monthlyCollection,
      subtitle: "This month's total",
      bgColor: "#7c4dcc",
      illustration: MonthlyCollectionIllustration,
      cashTotal: monthlyCash,
      bankTotal: monthlyBank,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <RevenueBreakdownSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        totalRevenue={totalRevenue}
      />
    </>
  );
};

export default SummaryCards;