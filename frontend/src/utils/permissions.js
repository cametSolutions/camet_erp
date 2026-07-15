export const permissionSections = [
  {
    title: "Main Menu",
    items: [
      { key: "hotelManagement", label: "Hotel Management" },
      { key: "restaurantManagement", label: "Restaurant Management" },
      { key: "voucher", label: "Voucher" },
      { key: "reports", label: "Reports" },
    ],
  },
  {
    title: "Hotel",
    items: [
      // { key: "hotelDashboard", label: "Hotel Dashboard" },
      { key: "bookingList", label: "Booking List" },
      { key: "checkinList", label: "Check-in List" },
      { key: "checkoutList", label: "Checkout List" },
      { key: "editTariffRate", label: "Edit Tariff Rate" },
      { key: "swapRoom", label: "Swap Room" },
      // { key: "roomShift", label: "Room Shift" },
      // { key: "guestLedger", label: "Guest Ledger" },
    ],
  },
  {
    title: "Restaurant",
    items: [
      // { key: "restaurantDashboard", label: "Restaurant Dashboard" },
      { key: "kotPage", label: "KOT Page" },
      { key: "restaurantPayment", label: "Restaurant Payment" },
    ],
  },
  {
    title: "Hotel Reports",
    items: [
      // { key: "hotelReports", label: "Hotel Reports" },
      // { key: "restaurantReports", label: "Restaurant Reports" },
      // { key: "voucherReports", label: "Voucher Reports" },
      { key: "dailySalesReport", label: "Daily Sales" },
      { key: "foDailyStatement", label: "FO Daily Statement" },
      { key: "flashReport", label: "Flash Report" },
      { key: "paxReport", label: "Pax Report" },
      { key: "foodPlanReport", label: "Food Plan Report" },
      { key: "occupancyReport", label: "Occupancy Report" },
      { key: "roomSummaryReport", label: "Room Summary Report" },
      { key: "receiptReport", label: "Receipt Report" },
      { key: "travelAgentReport", label: "Travel Agent Report" },
      { key: "foBillSummary", label: "FO Bill Summary" },
      { key: "cancellationReport", label: "Cancellation Report" },
    ],
  },
  {
    title: "Restaurant Reports",
    items: [
      { key: "restaurantDailySales", label: "Daily Sales" },
      { key: "categoryWiseSales", label: "Category Wise Sales" },
      { key: "itemWiseSales", label: "Item Wise Sales" },
      { key: "kotRegister", label: "KOT Register" },
      { key: "restaurantReceiptReport", label: "Receipt Report" },
      { key: "saleRegister", label: "Sale Register" },
    ],
  },
];

export const allPermissionKeys = permissionSections.flatMap((section) =>
  section.items.map((item) => item.key),
);

export const buildDefaultPermissions = () =>
  allPermissionKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});

const pathPermissionRules = [
  {
    pattern: /^\/sUsers\/hotelDashBoard/i,
    keys: ["hotelManagement"],
  },
  {
    pattern: /^\/sUsers\/RestaurantDashboard/i,
    keys: ["restaurantManagement"],
  },
  {
    pattern: /^\/sUsers\/selectVouchers/i,
    keys: ["voucher"],
  },
  {
    pattern: /^\/sUsers\/reports/i,
    keys: ["reports"],
  },
  {
    pattern: /^\/sUsers\/bookingList/i,
    keys: ["bookingList"],
  },
  {
    pattern: /^\/sUsers\/checkInList/i,
    keys: ["checkinList"],
  },
  {
    pattern: /^\/sUsers\/checkOutList/i,
    keys: ["checkoutList"],
  },
  {
    pattern: /^\/sUsers\/tariffRateChange/i,
    keys: ["editTariffRate"],
  },
  {
    pattern: /^\/sUsers\/KotPage/i,
    keys: ["kotPage"],
  },
  {
    pattern: /^\/sUsers\/hotelDailySales/i,
    keys: ["dailySalesReport"],
  },
  {
    pattern: /^\/sUsers\/BillSummary/i,
    keys: ["dailySalesReport", "restaurantDailySales"],
  },
  {
    pattern: /^\/sUsers\/Checkoutpdf/i,
    keys: ["foDailyStatement"],
  },
  {
    pattern: /^\/sUsers\/HotelFlashReport/i,
    keys: ["flashReport"],
  },
  {
    pattern: /^\/sUsers\/tourist-report/i,
    keys: ["paxReport"],
  },
  {
    pattern: /^\/sUsers\/foodplan-report/i,
    keys: ["foodPlanReport"],
  },
  {
    pattern: /^\/sUsers\/viewReport/i,
    keys: ["occupancyReport"],
  },
  {
    pattern: /^\/sUsers\/viewReport/i,
    keys: ["roomSummaryReport"],
  },
  {
    pattern: /^\/sUsers\/Receiptreport/i,
    keys: ["receiptReport"],
  },
  {
    pattern: /^\/sUsers\/TravelAgentReport/i,
    keys: ["travelAgentReport"],
  },
  {
    pattern: /^\/sUsers\/FOSalesSummaryReport/i,
    keys: ["foBillSummary"],
  },
  {
    pattern: /^\/sUsers\/CancellationReport/i,
    keys: ["cancellationReport"],
  },
  {
    pattern: /^\/sUsers\/restaurantDailySales/i,
    keys: ["restaurantDailySales"],
  },
  {
    pattern: /^\/sUsers\/categoryprint/i,
    keys: ["categoryWiseSales"],
  },
  {
    pattern: /^\/sUsers\/itemwisereport/i,
    keys: ["itemWiseSales"],
  },
  {
    pattern: /^\/sUsers\/register/i,
    keys: ["kotRegister"],
  },

  {
    pattern: /^\/sUsers\/restaurantReceiptReport/i,
    keys: ["restaurantReceiptReport"],
  },
  {
    pattern: /^\/sUsers\/sales-register/i,
    keys: ["saleRegister"],
  },
];

export const getRequiredPermissionForPath = (pathname) =>
  pathPermissionRules.find((rule) => rule.pattern.test(pathname));

export const isAdminUser = (user) =>
  user?.role === "admin" || user?.userType === "admin";

export const canAccessPath = ({ pathname, user, permissions }) => {
  console.log(pathname, permissions);
  const rule = getRequiredPermissionForPath(pathname);
  console.log(rule);

  if (!rule) return true;
  if (isAdminUser(user)) return true;
  if (rule.adminOnly) return false;

  return rule.keys?.every((key) => permissions?.[key] === true) ?? true;
};
