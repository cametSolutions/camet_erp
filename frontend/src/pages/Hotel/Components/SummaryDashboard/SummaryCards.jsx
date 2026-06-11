import StatCard from "./StatCard";
import {
  RevenueIllustration,
  DailyCollectionIllustration,
  MonthlyCollectionIllustration,
} from "./CardIllustrations";

const SummaryCards = ({
  totalRevenue = "₹24,80,632",
  dailyCollection = "₹98,450",
  monthlyCollection = "₹9,80,632",
}) => {
  const cards = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      subtitle: "All time earnings",
      bgColor: "#1db974",
      illustration: RevenueIllustration,
    },
    {
      title: "Daily Collection",
      value: dailyCollection,
      subtitle: "Today's collection",
      bgColor: "#e8960c",
      illustration: DailyCollectionIllustration,
    },
    {
      title: "Monthly Collection",
      value: monthlyCollection,
      subtitle: "This month's total",
      bgColor: "#7c4dcc",
      illustration: MonthlyCollectionIllustration,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] w-full">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

export default SummaryCards;