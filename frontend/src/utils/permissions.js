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
      { key: "hotelDashboard", label: "Hotel Dashboard" },
      { key: "bookingList", label: "Booking List" },
      { key: "checkinList", label: "Check-in List" },
      { key: "checkoutList", label: "Checkout List" },
      { key: "editTariffRate", label: "Edit Tariff Rate" },
      { key: "swapRoom", label: "Swap Room" },
      { key: "roomShift", label: "Room Shift" },
      { key: "guestLedger", label: "Guest Ledger" },
    ],
  },
  {
    title: "Restaurant",
    items: [
      { key: "restaurantDashboard", label: "Restaurant Dashboard" },
      { key: "kotPage", label: "KOT Page" },
      { key: "restaurantPayment", label: "Restaurant Payment" },
      { key: "restaurantDailySales", label: "Daily Sales" },
      { key: "categoryWiseSales", label: "Category Wise Sales" },
      { key: "itemWiseSales", label: "Item Wise Sales" },
      { key: "kotRegister", label: "KOT Register" },
      { key: "restaurantReceiptReport", label: "Receipt Report" },
      { key: "saleRegister", label: "Sale Register" },
    ],
  },
  {
    title: "Reports",
    items: [
      { key: "hotelReports", label: "Hotel Reports" },
      { key: "restaurantReports", label: "Restaurant Reports" },
      { key: "voucherReports", label: "Voucher Reports" },
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
];

export const allPermissionKeys = permissionSections.flatMap((section) =>
  section.items.map((item) => item.key)
);

export const buildDefaultPermissions = () =>
  allPermissionKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {});

const pathPermissionRules = [
  { pattern: /^\/sUsers\/MenuRightsSettingsPage/i, adminOnly: true },
  {
    pattern: /^\/sUsers\/(hotelDashBoard|addAdditionalPax|visitOfPurpose|idProof|foodPlan|roomRegistration|roomList|editRoom|EditRoom|bookingPage|BookingList|checkInPage|checkInList|checkOutPage|CheckOutList|EditBooking|EditChecking|EditCheckOut|CheckOutPrint|BillPrint|CheckInPrint|Checkoutpdf|SummaryDashboard|BillSummary)/i,
    keys: ["hotelManagement"],
  },
  {
    pattern: /^\/sUsers\/hotelDashBoard/i,
    keys: ["hotelDashboard"],
  },
  {
    pattern: /^\/sUsers\/(BookingList|bookingPage|EditBooking)/i,
    keys: ["bookingList"],
  },
  {
    pattern: /^\/sUsers\/(checkInList|checkInPage|EditChecking|CheckInPrint)/i,
    keys: ["checkinList"],
  },
  {
    pattern: /^\/sUsers\/(CheckOutList|checkOutPage|EditCheckOut|CheckOutPrint|Checkoutpdf)/i,
    keys: ["checkoutList"],
  },
  {
    pattern: /^\/sUsers\/(RestaurantDashboard|KotPage|itemList|editItem|itemRegistration|TableMaster|TableSelection)/i,
    keys: ["restaurantManagement"],
  },
  {
    pattern: /^\/sUsers\/RestaurantDashboard/i,
    keys: ["restaurantDashboard"],
  },
  {
    pattern: /^\/sUsers\/KotPage/i,
    keys: ["kotPage"],
  },
  {
    pattern: /^\/sUsers\/(invoice|sales|purchase|vanSale|receipt|payment|paymentPurchase|saleOrderDetails|editSaleOrder|shareSaleOrder|sharesaleOrder|salesDetails|editsales|shareSales|addItemSales|editItemVoucher|purchaseDetails|editPurchase|sharePurchase|addBatchPurchase|billToPurchase|receiptPrintOut|paymentPrintOut|vouchersLIst|sales\/paymentSplitting)/i,
    keys: ["voucher"],
  },
  {
    pattern: /^\/sUsers\/(reports|salesSummary|summaryReport|salesSummaryDetails|salesSummaryTransactions|outstandingSummary|outstanding|outstandingDetails|Inventory|InventoryDetails|transaction|categoryprint|itemwisereport|tourist-report|foodplan-report|occupancy-checkout-report|FOSalesSummaryReport|HotelFlashReport|CancellationReport|Receiptreport|TravelAgentReport|register|sales-register|viewReport)/i,
    keys: ["reports"],
  },
  {
    pattern: /^\/sUsers\/(HotelFlashReport|SummaryDashboard|BillSummary|CancellationReport|Receiptreport|TravelAgentReport|tourist-report|foodplan-report|occupancy-checkout-report|FOSalesSummaryReport|viewReport)/i,
    keys: ["hotelReports"],
  },
  {
    pattern: /^\/sUsers\/(categoryprint|itemwisereport|register|sales-register)/i,
    keys: ["restaurantReports"],
  },
  {
    pattern: /^\/sUsers\/(reports|salesSummary|summaryReport|salesSummaryDetails|salesSummaryTransactions|outstandingSummary|outstanding|outstandingDetails|Inventory|InventoryDetails|transaction|vouchersLIst)/i,
    keys: ["voucherReports"],
  },
];

export const getRequiredPermissionForPath = (pathname) =>
  pathPermissionRules.find((rule) => rule.pattern.test(pathname));

export const isAdminUser = (user) =>
  user?.role === "admin" || user?.userType === "admin";

export const canAccessPath = ({ pathname, user, permissions }) => {
  const rule = getRequiredPermissionForPath(pathname);

  if (!rule) return true;
  if (isAdminUser(user)) return true;
  if (rule.adminOnly) return false;

  return rule.keys?.every((key) => permissions?.[key] === true) ?? true;
};
