/* eslint-disable react/prop-types */
import StatCard from "./StatCard";
import {
  RevenueIllustration,
  DailyCollectionIllustration,
  MonthlyCollectionIllustration,
} from "./CardIllustrations";
import RevenueBreakdownSheet from "./RevenueBreakdownSheet";
import CollectionBreakdownSheet from "./CollectionBreakdownSheet";
import { useState } from "react";

const SummaryCards = ({
  totalRevenue = "₹0",
  revenueBreakdown = [],
  dailyCollection = "₹0",
  dailyCollectionBreakdown = [],
  monthlyCollection = "₹0",
  monthlyCollectionBreakdown = [],
  dailyCash = "₹0",
  dailyBank = "₹0",
  monthlyCash = "₹0",
  monthlyBank = "₹0",
}) => {
  const [revenueSheetOpen, setRevenueSheetOpen] = useState(false);
  const [dailySheetOpen, setDailySheetOpen] = useState(false);
  const [monthlySheetOpen, setMonthlySheetOpen] = useState(false);

  const cards = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      subtitle: "All time earnings",
      bgColor: "#1db974",
      illustration: RevenueIllustration,
      onClick: () => setRevenueSheetOpen(true),
    },
    {
      title: "Daily Collection",
      value: dailyCollection,
      subtitle: "Today's collection",
      bgColor: "#2a5298",
      illustration: DailyCollectionIllustration,
      onClick: () => setDailySheetOpen(true),
      cashTotal: dailyCash,
      bankTotal: dailyBank,
    },
    {
      title: "Monthly Collection",
      value: monthlyCollection,
      subtitle: "This month's total",
      bgColor: "#7c4dcc",
      illustration: MonthlyCollectionIllustration,
      onClick: () => setMonthlySheetOpen(true),
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
        open={revenueSheetOpen}
        onOpenChange={setRevenueSheetOpen}
        totalRevenue={totalRevenue}
        revenueBreakdown={revenueBreakdown}
      />

      <CollectionBreakdownSheet
        open={dailySheetOpen}
        onOpenChange={setDailySheetOpen}
        title="Daily Collection Breakdown"
        description="Company-wise cash and bank split for today"
        totalAmount={dailyCollection}
        periodLabel="today's"
        collectionBreakdown={dailyCollectionBreakdown}
      />

      <CollectionBreakdownSheet
        open={monthlySheetOpen}
        onOpenChange={setMonthlySheetOpen}
        title="Monthly Collection Breakdown"
        description="Company-wise cash and bank split for the current month"
        totalAmount={monthlyCollection}
        periodLabel="this month's"
        collectionBreakdown={monthlyCollectionBreakdown}
      />
    </>
  );
};

export default SummaryCards;
