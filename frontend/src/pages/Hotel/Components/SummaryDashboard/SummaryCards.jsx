/* eslint-disable react/prop-types */
import StatCard from "./StatCard";
import {
  RevenueIllustration,
  DailyCollectionIllustration,
  MonthlyCollectionIllustration,
  PropertySalesIllustration,
  RoomsIllustration,
} from "./CardIllustrations";
import RevenueBreakdownSheet from "./RevenueBreakdownSheet";
import CollectionBreakdownSheet from "./CollectionBreakdownSheet";
import PropertySalesBreakdownSheet from "./PropertySalesBreakdownSheet";
import RoomCountBreakdownSheet from "./RoomCountBreakdownSheet";
import { useState } from "react";

const SummaryCards = ({
  totalRevenue = "₹0",
  revenueBreakdown = [],
  dailyCollection = "₹0",
  dailyCollectionBreakdown = [],
  monthlyCollection = "₹0",
  monthlyCollectionBreakdown = [],
  totalRooms = "0",
  totalAvailableRooms = "0",
  totalBlockedRooms = "0",
  totalPropertySales = "₹0",
  totalHotelSales = "₹0",
  totalRestaurantSales = "₹0",
  propertySalesBreakdown = [],
  roomCountBreakdown = [],
  dailyCash = "₹0",
  dailyBank = "₹0",
  monthlyCash = "₹0",
  monthlyBank = "₹0",
}) => {
  const [revenueSheetOpen, setRevenueSheetOpen] = useState(false);
  const [dailySheetOpen, setDailySheetOpen] = useState(false);
  const [monthlySheetOpen, setMonthlySheetOpen] = useState(false);
  const [propertySalesSheetOpen, setPropertySalesSheetOpen] = useState(false);
  const [roomSheetOpen, setRoomSheetOpen] = useState(false);

  const financialCards = [
    {
      title: "Total Revenue",
      value: totalRevenue,
      subtitle: "All time earnings",
      bgColor: "#1db974",
      textColor: "#ffffff",
      subtitleColor: "#0a3d26",
      accentColor: "#17a060",
      badgeColor: "#e6fff4",
      illustration: RevenueIllustration,
      onClick: () => setRevenueSheetOpen(true),
    },
    {
      title: "Daily Collection",
      value: dailyCollection,
      subtitle: "Today's collection",
      bgColor: "#2a5298",
      textColor: "#ffffff",
      subtitleColor: "#0d1f3c",
      accentColor: "#1e3d78",
      badgeColor: "#dce8ff",
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
      textColor: "#ffffff",
      subtitleColor: "#2e1060",
      accentColor: "#6438b0",
      badgeColor: "#ede6ff",
      illustration: MonthlyCollectionIllustration,
      onClick: () => setMonthlySheetOpen(true),
      cashTotal: monthlyCash,
      bankTotal: monthlyBank,
    },
  ];

  const roomCards = [
    {
      title: "Property Sales",
      value: totalPropertySales,
      subtitle: "Hotel and restaurant sales",
      bgColor: "#7a5af8",
      textColor: "#ffffff",
      subtitleColor: "#2d1767",
      accentColor: "#5f43dc",
      badgeColor: "#ece8ff",
      illustration: PropertySalesIllustration,
      onClick: () => setPropertySalesSheetOpen(true),
      cashTotal: totalHotelSales,
      bankTotal: totalRestaurantSales,
      cashLabel: "Hotel",
      bankLabel: "Restaurant",
      cashIcon: "hotel",
      bankIcon: "restaurant",
    },
    {
      title: "Total Property Rooms",
      value: totalRooms,
      subtitle: "Total rooms count",
      bgColor: "#0096c7",
      textColor: "#ffffff",
      subtitleColor: "#003040",
      accentColor: "#007aa3",
      badgeColor: "#d9f4ff",
      illustration: RoomsIllustration,
      onClick: () => setRoomSheetOpen(true),
      cashTotal: totalAvailableRooms,
      bankTotal: totalBlockedRooms,
      cashLabel: "Available",
      bankLabel: "Blocked",
      cashIcon: "available",
      bankIcon: "blocked",
    },
  ];

  return (
    <>
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Revenue Summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
        {financialCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-6 mb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Property Summary
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-5">
        {roomCards.map((card) => (
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

      <PropertySalesBreakdownSheet
        open={propertySalesSheetOpen}
        onOpenChange={setPropertySalesSheetOpen}
        totalPropertySales={totalPropertySales}
        totalHotelSales={totalHotelSales}
        totalRestaurantSales={totalRestaurantSales}
        propertySalesBreakdown={propertySalesBreakdown}
      />

      <RoomCountBreakdownSheet
        open={roomSheetOpen}
        onOpenChange={setRoomSheetOpen}
        totalRooms={totalRooms}
        totalAvailableRooms={totalAvailableRooms}
        totalBlockedRooms={totalBlockedRooms}
        roomBreakdown={roomCountBreakdown}
      />
    </>
  );
};

export default SummaryCards;
