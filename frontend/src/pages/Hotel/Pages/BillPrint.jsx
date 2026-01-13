import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import api from "@/api/api";
import Logo from "../../../assets/images/hill.png";
import TitleDiv from "@/components/common/TitleDiv";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
// import {
//   handlePrintInvoice,
//   handleDownloadPDF,
// } from "../PrintSide/generateHotelInvoicePDF ";
import {
  handleBillPrintInvoice,
  handleBillDownloadPDF,
} from "../PrintSide/generateBillPrintPDF";
import Outstanding from "@/pages/voucherReports/outstanding/Outstanding";
// import { Title } from "@radix-ui/react-dialog";

const HotelBillPrint = () => {
  // Router and Redux state
  const location = useLocation();
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );
  const navigate = useNavigate();

  // Props from location state
  const selectedCheckOut = location.state?.selectedCheckOut || [];
  console.log(selectedCheckOut);
  const a = selectedCheckOut.some((it) => it.originalCheckInId);
  console.log(a);
  const checkoutmode = location?.state?.checkoutMode || null;
  const cheinids = location?.state?.checkinIds;
  console.log(selectedCheckOut);
  // const selectedCustomerId = location.state?.customerId;
  const isForPreview = location.state?.isForPreview;

  // Component state (global for fetch results used across docs)
  const [outStanding, setOutStanding] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [showSplitPopUp, setShowSplitPopUp] = useState(false);
  const [selected, setSelected] = useState("default");
  const printReference = useRef(null);

  // Fetch debit and KOT once for all docs shown
  const fetchDebitData = async (data) => {
    console.log(data);
    try {
      const res = await api.post(
        `/api/sUsers/fetchOutStandingAndFoodData`,
        { data },
        { withCredentials: true }
      );
      if (res.data.success) {
        console.log(res.data.data);
        setOutStanding(res.data.data || []);
        setKotData(res.data.kotData || []);
      }
    } catch (error) {
      toast.error(error.message);
      console.error("Error fetching debit data:", error);
    }
  };

  useEffect(() => {
    if (selectedCheckOut?.length > 0) {
      console.log(selectedCheckOut);
      fetchDebitData(selectedCheckOut);
    }
  }, [JSON.stringify(selectedCheckOut)]); // ✅ CHANGED: Added JSON.stringify

  // Split handlers
  const handleSplitPayment = () => setShowSplitPopUp(true);
  const handleChange = (value) => setSelected(value);
  const handleSplit = () => {
    setShowSplitPopUp(false);
    if (selected === "room") {
      setKotData([]);
    } else if (selected === "restaurant") {
      setOutStanding([]);
    }
  };

  // Utils
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Per-doc transforms
  // Per-doc transforms
  // Replace your transformDocToDateWiseLines function with this complete version:

  const transformDocToDateWiseLines = (doc) => {
    const result = [];

    (doc.selectedRooms || []).forEach((room) => {
      const roomStartDate = new Date(room.arrivalDate || doc.arrivalDate);

      const stayDays = room.stayDays || 1;
      const fullDays = Math.floor(stayDays);
      const fractionalDay = stayDays - fullDays;

      const perDayAmount =
        Number(room.priceLevelRate || 0) ||
        Number(room.baseAmountWithTax || 0) / stayDays;
      const baseAmountPerDay = Number(room.baseAmount || 0) / stayDays;
      const taxAmountPerDay = Number(room.taxAmount || 0) / stayDays;
      const foodPlanAmountWithTaxPerDay =
        Number(room.foodPlanAmountWithTax || 0) / stayDays;
      const foodPlanAmountWithOutTaxPerDay =
        Number(room.foodPlanAmountWithOutTax || 0) / stayDays;

      // ✅ FIX: Calculate additional pax per day based on FULL DAYS ONLY
      const totalAdditionalPaxWithTax = Number(
        room.additionalPaxAmountWithTax || 0
      );
      const totalAdditionalPaxWithOutTax = Number(
        room.additionalPaxAmountWithOutTax || 0
      );

      const additionalPaxDataWithTaxPerDay =
        fullDays > 0 ? totalAdditionalPaxWithTax / fullDays : 0;
      const additionalPaxDataWithOutTaxPerDay =
        fullDays > 0 ? totalAdditionalPaxWithOutTax / fullDays : 0;

      // Add full days
      for (let i = 0; i < fullDays; i++) {
        const currentDate = new Date(roomStartDate);
        currentDate.setDate(roomStartDate.getDate() + i);
        const formattedDate = currentDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

        result.push({
          date: formattedDate,
          description: `Room Rent - Room ${room.roomName}`,
          docNo: doc.voucherNumber,
          amount: baseAmountPerDay,
          baseAmountWithTax: perDayAmount,
          baseAmount: baseAmountPerDay,
          taxAmount: taxAmountPerDay,
          voucherNumber: doc.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: doc.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTaxPerDay,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTaxPerDay,
          additionalPaxDataWithTax: additionalPaxDataWithTaxPerDay,
          additionalPaxDataWithOutTax: additionalPaxDataWithOutTaxPerDay,
          roomId: room?.roomId || room?._id,
          roomArrivalDate: formattedDate,
          isFullDay: true,
        });
      }

      // Add fractional day (half day) - NO additional pax charges
      if (fractionalDay > 0) {
        const fractionalDate = new Date(roomStartDate);
        fractionalDate.setDate(roomStartDate.getDate() + fullDays);
        const formattedFractionalDate = fractionalDate
          .toLocaleDateString("en-GB")
          .replace(/\//g, "-");

        result.push({
          date: formattedFractionalDate,
          description: `Room Rent - Room ${room.roomName} (Half Day)`,
          docNo: doc.voucherNumber,
          amount: baseAmountPerDay * 0.5,
          baseAmountWithTax: perDayAmount * 0.5,
          baseAmount: baseAmountPerDay * 0.5,
          taxAmount: taxAmountPerDay * 0.5,
          voucherNumber: doc.voucherNumber,
          roomName: room.roomName,
          hsn: room?.hsnDetails?.hsn,
          customerName: doc.customerId?.partyName,
          foodPlanAmountWithTax: foodPlanAmountWithTaxPerDay * 0.5,
          foodPlanAmountWithOutTax: foodPlanAmountWithOutTaxPerDay * 0.5,
          additionalPaxDataWithTax: 0,
          additionalPaxDataWithOutTax: 0,
          roomId: room?.roomId || room?._id,
          isFullDay: false, // ✅ Mark as half day
          checkoutDate: formattedFractionalDate,
        });
      }
    });

    return result;
  };

  const getKotTotalsByRoom = (kots = []) => {
    const map = new Map();
    kots.forEach((kot) => {
      const roomId = kot?.kotDetails?.roomId;
      if (!roomId) return;
      const amount = Number(
        kot?.finalAmount ?? kot?.subTotal ?? kot?.total ?? 0
      );
      const key = String(roomId);
      map.set(key, (map.get(key) ?? 0) + amount);
    });
    return map;
  };

  // Build per-room restaurant line for a doc’s rooms only
  // Build per-room restaurant line for a doc's rooms only
  // Build per-room restaurant line for a doc's rooms only
  const buildPerRoomRestaurantLinesForDoc = (doc) => {
    console.log("=== Building restaurant lines ===");
    console.log("Doc:", doc);
    console.log("All KOT Data:", kotData);

    const lines = [];

    // Get all room IDs from this document
    const roomIdSet = new Set(
      (doc.selectedRooms || [])
        .map((r) => String(r?.roomId || r?._id || r?.id))
        .filter(Boolean)
    );

    console.log("Room IDs in this checkout:", Array.from(roomIdSet));

    // Split KOTs based on available fields
    const roomServiceKots = [];
    const dineInKots = [];

    kotData.forEach((kot) => {
      const kotRoomId = String(kot?.kotDetails?.roomId || kot?.roomId || "");
      const tableNumber =
        kot?.kotDetails?.tableNumber ||
        kot?.tableNumber ||
        kot?.customer?.tableNumber;
      const type = kot?.type || "";

      console.log(
        `KOT ${kot?.salesNumber}: roomId=${kotRoomId}, tableNumber=${tableNumber}, type=${type}`
      );

      // CLASSIFICATION LOGIC:
      // 1. If KOT has tableNumber -> it's DINE IN (even if it has roomId)
      // 2. If KOT has roomId but NO tableNumber -> it's ROOM SERVICE
      // 3. If type is "takeaway" or "delivery" -> treat as DINE IN

      if (tableNumber) {
        // Has table number = Dine In
        dineInKots.push(kot);
        console.log(`  -> RESTAURANT DINE IN (has tableNumber)`);
      } else if (type === "takeaway" || type === "delivery") {
        // Takeaway/Delivery = Dine In
        dineInKots.push(kot);
        console.log(`  -> RESTAURANT DINE IN (takeaway/delivery)`);
      } else if (kotRoomId && roomIdSet.has(kotRoomId)) {
        // Has roomId but no table = Room Service
        roomServiceKots.push(kot);
        console.log(`  -> ROOM SERVICE (has roomId, no table)`);
      } else {
        // Default to Dine In if unclear
        dineInKots.push(kot);
        console.log(`  -> RESTAURANT DINE IN (default)`);
      }
    });

    console.log("Room Service KOTs:", roomServiceKots.length);
    console.log("Dine In KOTs:", dineInKots.length);

    // 1. Add Room Service charges (grouped by room)
    const roomServiceTotals = {};
    roomServiceKots.forEach((kot) => {
      const roomId = String(kot?.kotDetails?.roomId || kot?.roomId || "");
      const amount = Number(
        kot?.finalAmount ?? kot?.subTotal ?? kot?.total ?? 0
      );

      if (!roomServiceTotals[roomId]) {
        roomServiceTotals[roomId] = {
          amount: 0,
          docNos: [],
        };
      }

      roomServiceTotals[roomId].amount += amount;
      if (kot?.salesNumber) {
        roomServiceTotals[roomId].docNos.push(kot.salesNumber);
      }
    });

    Object.keys(roomServiceTotals).forEach((roomId) => {
      const roomName =
        (doc.selectedRooms || []).find(
          (r) => String(r?.roomId || r?._id || r?.id) === roomId
        )?.roomName || "Unknown Room";

      const docNo = roomServiceTotals[roomId].docNos.join(", ") || "-";

      console.log(
        `Adding Room Service line: ${roomName} = ${roomServiceTotals[roomId].amount}`
      );

      lines.push({
        date: formatDate(new Date()),
        description: `Room Service - ${roomName}`,
        docNo: docNo,
        amount: Number(roomServiceTotals[roomId].amount || 0),
        taxes: 0,
        advance: "",
        roomName: roomName,
        roomId: roomId,
        type: "roomService",
      });
    });

    // 2. Add Restaurant Dine In charges (grouped by table or as one line)
    const dineInTotals = {};
    dineInKots.forEach((kot) => {
      const tableNo =
        kot?.kotDetails?.tableNumber ||
        kot?.tableNumber ||
        kot?.customer?.tableNumber ||
        "Restaurant";
      const amount = Number(
        kot?.finalAmount ?? kot?.subTotal ?? kot?.total ?? 0
      );

      if (!dineInTotals[tableNo]) {
        dineInTotals[tableNo] = {
          amount: 0,
          docNos: [],
        };
      }

      dineInTotals[tableNo].amount += amount;
      if (kot?.salesNumber) {
        dineInTotals[tableNo].docNos.push(kot.salesNumber);
      }
    });

    Object.keys(dineInTotals).forEach((tableNo) => {
      const docNo = dineInTotals[tableNo].docNos.join(", ") || "-";

      console.log(
        `Adding Dine In line: Table ${tableNo} = ${dineInTotals[tableNo].amount}`
      );

      lines.push({
        date: formatDate(new Date()),
        description: `Restaurant Dine In - ${tableNo}`,
        docNo: docNo,
        amount: Number(dineInTotals[tableNo].amount || 0),
        taxes: 0,
        advance: "",
        roomName: "",
        roomId: "",
        type: "dineIn",
      });
    });

    console.log("=== Final restaurant lines ===", lines);
    return lines;
  };

  // Helpers to decide where to show advances
  const docOwnsAdvances = (doc) => {
    const originalId = doc?.originalCustomerId;
    const custId = doc?.customerId?._id || doc?.customerId;
    if (!custId) return false;
    // If originalId exists, match it; if not provided, treat as original/primary and allow
    return originalId ? String(originalId) === String(custId) : true;
  };

  const findFirstPrimaryIdx = (docs) => {
    const idx = (docs || []).findIndex((d) => docOwnsAdvances(d));
    return idx >= 0 ? idx : 0;
  };

  // Build bill payload per doc; gate advances via useAdvances
  const prepareBillDataForDoc = (doc, useAdvances) => {
    // Lines from room stay
    const dateWiseLines = transformDocToDateWiseLines(doc);

    // Totals for room parts
    const roomTariffTotal = dateWiseLines.reduce(
      (t, i) => t + Number(i.baseAmount || 0),
      0
    );
    const planAmount = dateWiseLines.reduce(
      (t, i) => t + Number(i.foodPlanAmountWithOutTax || 0),
      0
    );
    const foodPlanAmountWithTax = dateWiseLines.reduce(
      (t, i) => t + (Number(i.foodPlanAmountWithTax || 0) - Number(i.foodPlanAmountWithOutTax || 0)),
      0
    ).toFixed(2);

    console.log(foodPlanAmountWithTax)
    const additionalPaxAmount = (doc.selectedRooms || []).reduce(
      (total, room) => {
        const stayDays = room.stayDays || 1;
        const fullDays = Math.floor(stayDays); // Only count full days
        const totalPaxWithoutTax = Number(
          room.additionalPaxAmountWithOutTax || 0
        );

        // If there are full days, use the full amount; otherwise 0
        return total + (fullDays > 0 ? totalPaxWithoutTax : 0);
      },
      0
    );
    console.log(dateWiseLines)
    const roomTaxTotal = dateWiseLines.reduce(
      (t, i) => t + Number(i.taxAmount || 0),
      0
    );
  
     const additionalPaxTax = dateWiseLines.reduce(
      (t, i) => t + Number(i.additionalPaxDataWithTax || 0) - Number(i.additionalPaxDataWithOutTax || 0),
      0
    );
  
    const sgstAmount = (roomTaxTotal + additionalPaxTax) / 2;
    const cgstAmount = (roomTaxTotal + additionalPaxTax) / 2;

    // Per-room restaurant lines (for this doc’s rooms)
    const perRoomRestaurantLines = buildPerRoomRestaurantLinesForDoc(doc);
    const roomServiceTotal = perRoomRestaurantLines
      .filter((l) => l.type === "roomService")
      .reduce((t, l) => t + Number(l.amount || 0), 0);

    const dineInTotal = perRoomRestaurantLines
      .filter((l) => l.type === "dineIn")
      .reduce((t, l) => t + Number(l.amount || 0), 0);

    const restaurantTotal = roomServiceTotal + dineInTotal;

    console.log("Room Service Total:", roomServiceTotal);
    console.log("Dine In Total:", dineInTotal);
    console.log("Restaurant Total:", restaurantTotal);
    console.log(perRoomRestaurantLines);
    console.log(perRoomRestaurantLines);

    const groupedRoomCharges = (() => {
      const charges = [];
      const groups = {};

      // Group charges by room
      dateWiseLines.forEach((i) => {
        const k = i.roomName;
        if (!groups[k]) groups[k] = [];
        groups[k].push(i);
      });

      // Get array of room names to track first room
      const roomNames = Object.keys(groups);

      // Process each room's charges in order
      roomNames.forEach((roomName, roomIndex) => {
        const roomDays = groups[roomName];

        // Get the original room data for this room
        const originalRoom = doc.selectedRooms?.find(
          (r) => r.roomName === roomName
        );

        // Get tax percentages
        const roomTaxPercentage = originalRoom?.taxPercentage || 0;
        const halfRoomTaxPercentage = roomTaxPercentage / 2;

        // Get THIS specific room's arrival date
        const roomArrivalDate =
          roomDays[0]?.date || formatDate(doc.arrivalDate);

        // Separate full days and half days
        const fullDayCharges = roomDays.filter(
          (item) =>
            !item.description?.includes("Half Day") &&
            !item.description?.includes("Half Tariff")
        );
        const halfDayCharges = roomDays.filter(
          (item) =>
            item.description?.includes("Half Day") ||
            item.description?.includes("Half Tariff")
        );

        // Get the half day date (checkout date) - it's the last day in the room charges
        const halfDayDate =
          halfDayCharges.length > 0
            ? halfDayCharges[0]?.date // Use the actual date from the half day charge
            : roomArrivalDate;

        // 1. Add FULL DAY room rent charges
        fullDayCharges.forEach((item) => {
          charges.push({
            date: item.date,
            description: `Room Rent :${item.roomName}`,
            docNo: item.docNo || "-",
            amount: (item.baseAmount + item.foodPlanAmountWithTax).toFixed(2),
            taxes: (item.taxAmount || 0).toFixed(2),
            advance: "",
            roomName: item.roomName,
          });
        });

        // 2. Add CGST and SGST for FULL DAYS (if any)
        if (fullDayCharges.length > 0) {
          const fullDayTotalTax = fullDayCharges.reduce(
            (sum, i) => sum + (i.taxAmount || 0),
            0
          );

          if (fullDayTotalTax > 0) {
            const fullDayCGST = fullDayTotalTax / 2;
            const fullDaySGST = fullDayTotalTax / 2;

            charges.push({
              // date: roomArrivalDate, // Use arrival date for full day taxes
              description: `CGST on Rent@${halfRoomTaxPercentage}%`,
              docNo: "-",
              amount: 0,
              taxes: fullDayCGST.toFixed(2),
              advance: "",
              roomName,
            });

            charges.push({
              // date: roomArrivalDate, // Use arrival date for full day taxes
              description: `SGST on Rent@${halfRoomTaxPercentage}%`,
              docNo: "-",
              amount: 0,
              taxes: fullDaySGST.toFixed(2),
              advance: "",
              roomName,
            });
          }
        }

        // 3. Add HALF DAY room rent charges with CHECKOUT DATE
        halfDayCharges.forEach((item) => {
          charges.push({
            date: item.date, // ✅ Use the actual half day date (checkout date)
            description: `Half Tariff :${item.roomName}`,
            docNo: item.docNo || "-",
            amount: (item.baseAmount + item.foodPlanAmountWithTax).toFixed(2),
            taxes: (item.taxAmount || 0).toFixed(2),
            advance: "",
            roomName: item.roomName,
          });
        });

        // 4. Add CGST and SGST for HALF DAYS with CHECKOUT DATE (if any)
        if (halfDayCharges.length > 0) {
          const halfDayTotalTax = halfDayCharges.reduce(
            (sum, i) => sum + (i.taxAmount || 0),
            0
          );

          if (halfDayTotalTax > 0) {
            const halfDayCGST = halfDayTotalTax / 2;
            const halfDaySGST = halfDayTotalTax / 2;

            charges.push({
              // date: halfDayDate, // ✅ Use checkout date for half tariff taxes
              description: `CGST on Half Tariff@${halfRoomTaxPercentage}%`,
              docNo: "-",
              amount: 0,
              taxes: halfDayCGST.toFixed(2),
              advance: "",
              roomName,
            });

            charges.push({
              // date: halfDayDate, // ✅ Use checkout date for half tariff taxes
              description: `SGST on Half Tariff@${halfRoomTaxPercentage}%`,
              docNo: "-",
              amount: 0,
              taxes: halfDaySGST.toFixed(2),
              advance: "",
              roomName,
            });
          }
        }

        // 5. Add Additional Pax amount if applicable
        const totalAdditionalPaxWithoutTax = roomDays.reduce(
          (sum, i) => sum + (i.additionalPaxDataWithOutTax || 0),
          0
        );

        if (totalAdditionalPaxWithoutTax > 0) {
          charges.push({
            date: roomArrivalDate,
            description: `Extra Person`,
            docNo: "-",
            amount: totalAdditionalPaxWithoutTax,
            taxes: 0,
            advance: "",
            roomName,
          });
        }

        // 6. Add CGST and SGST for Additional Pax (if any)
        const roomAdditionalPaxTax = roomDays.reduce((sum, i) => {
          const paxWithTax = i.additionalPaxDataWithTax || 0;
          const paxWithoutTax = i.additionalPaxDataWithOutTax || 0;
          return sum + (paxWithTax - paxWithoutTax);
        }, 0);

        if (roomAdditionalPaxTax > 0) {
          const totalPaxWithTax = roomDays.reduce(
            (sum, i) => sum + (i.additionalPaxDataWithTax || 0),
            0
          );
          const additionalPaxTaxPercentage =
            totalAdditionalPaxWithoutTax > 0
              ? ((totalPaxWithTax - totalAdditionalPaxWithoutTax) /
                  totalAdditionalPaxWithoutTax) *
                100
              : 0;
          const halfAdditionalPaxTaxPercentage = additionalPaxTaxPercentage / 2;

          const paxCGST = roomAdditionalPaxTax / 2;
          const paxSGST = roomAdditionalPaxTax / 2;

          charges.push({
            // date: roomArrivalDate,
            description: `CGST on Extra Person@${halfAdditionalPaxTaxPercentage.toFixed(
              1
            )}%`,
            docNo: "-",
            amount: 0,
            taxes: paxCGST.toFixed(2),
            advance: "",
            roomName,
          });

          charges.push({
            // date: roomArrivalDate,
            description: `SGST on Extra Person@${halfAdditionalPaxTaxPercentage.toFixed(
              1
            )}%`,
            docNo: "-",
            amount: 0,
            taxes: paxSGST.toFixed(2),
            advance: "",
            roomName,
          });
        }

        // 7. Add Room Service charges for this specific room
        const roomServiceLines = perRoomRestaurantLines.filter(
          (l) => l.roomName === roomName && l.type === "roomService"
        );

        roomServiceLines.forEach((serviceLine) => {
          if (Number(serviceLine.amount) > 0) {
            charges.push({
              date: serviceLine.date,
              description: serviceLine.description,
              docNo: serviceLine.docNo,
              amount: serviceLine.amount,
              taxes: 0,
              advance: "",
              roomName: roomName,
            });
          }
        });

        // ✅ 8. After FIRST room only, add ALL Dine In charges
        if (roomIndex === 0) {
          const dineInLines = perRoomRestaurantLines.filter(
            (l) => l.type === "dineIn"
          );
          console.log("Adding dine-in lines after first room:", dineInLines);

          dineInLines.forEach((dineInLine) => {
            if (Number(dineInLine.amount) > 0) {
              charges.push({
                date: dineInLine.date,
                description: dineInLine.description,
                docNo: dineInLine.docNo,
                amount: dineInLine.amount,
                taxes: 0,
                advance: "",
                roomName: "", // Dine-in not tied to room
              });
            }
          });
        }
      }); // End of roomNames.forEach

      return charges;
    })();

    console.log(doc?.checkInId);
    console.log(doc?.partyArray);
    const allcheckinids = doc?.allCheckInIds;
    const allpartyid = doc?.partyArray;
    console.log(allpartyid);
    console.log(allcheckinids);
    // Advances only on the decided bill
    const advanceEntries = useAdvances
      ? (outStanding || [])
          // .filter((t) => allpartyid?.includes(t.party_id))
          .map((t) => ({
            date: formatDate(t.bill_date || t.billdate || new Date()),
            description: "Advance",
            docNo: t.bill_no || t.billno || "-",
            amount: -Math.abs(t.bill_amount || t.billamount || 0),
            taxes: "",
            advance: Math.abs(t.bill_amount || t.billamount || 0).toFixed(2),
          }))
      : [];

    const advanceTotal = useAdvances
      ? (outStanding || [])
          // .filter((t) => allpartyid?.includes(t.party_id))
          .reduce(
            (sum, t) => sum + Number(t.bill_amount || t.billamount || 0),
            0
          )
      : 0;
    console.log(advanceEntries);
    // Combine charges and compute balances
    const allCharges = [...groupedRoomCharges, ...advanceEntries];
    console.log(allCharges);
    let cumulativeBalance = 0;
    const chargesWithBalance = allCharges.map((charge) => {
      let currentAmount = Number(charge.amount || 0);
      const lineTaxes = Number(charge.taxes || 0);

      if (String(charge.description).includes("Room Rent")) {
        cumulativeBalance += currentAmount + lineTaxes;
      } else if (charge.description === "Advance") {
        cumulativeBalance += currentAmount;
      } else if (
        String(charge.description).includes("CGST on Rent") ||
        String(charge.description).includes("SGST on Rent")
      ) {
        // Room rent taxes already added with room rent, don't add again
      } else if (String(charge.description).includes("Food Plan")) {
        // Add food plan amount and its taxes
        cumulativeBalance += currentAmount + lineTaxes;
      } else if (String(charge.description).includes("Extra Person")) {
        // Add extra person amount and its taxes
        cumulativeBalance += currentAmount + lineTaxes;
      } else if (
        String(charge.description).includes("CGST") ||
        String(charge.description).includes("SGST")
      ) {
        // Other CGST/SGST already handled above, don't add
      } else {
        // Restaurant and other charges
        cumulativeBalance += currentAmount;
      }

      return {
        ...charge,
        balance: Number.isFinite(cumulativeBalance)
          ? cumulativeBalance.toFixed(2)
          : "0.00",
      };
    });
    console.log(doc?.checkOutTime);
        console.log(roomTariffTotal,planAmount,
          foodPlanAmountWithTax,sgstAmount,cgstAmount,restaurantTotal,
        )

    const grandTotal =
      roomTariffTotal +
      additionalPaxAmount +
      planAmount +
      Number(foodPlanAmountWithTax) +
      sgstAmount + cgstAmount +
      restaurantTotal
    const netPay = grandTotal - advanceTotal;

    // Compose hotel/guest info per doc
    const guestRooms = (doc.selectedRooms || [])
      .map((r) => r.roomName)
      .join(", ");
    const pax =
      (doc.selectedRooms || []).reduce(
        (acc, curr) => acc + Number(curr.pax || 0),
        0
      ) || 1;

    const basePax =
      (doc.selectedRooms || []).reduce(
        (acc, curr) => acc + Number(curr.pax || 0),
        0
      ) || 1;

    const additionalPaxCount = (doc.additionalPaxDetails || []).length;

    const totalPax = basePax + additionalPaxCount;

    const convertNumberToWords = (amount) =>
      `${Math.round(amount || 0)} Rupees Only`;

    return {
      hotel: {
        name: organization?.name,
        address:
          `${organization?.flat || ""} ${organization?.road || ""} ${
            organization?.landmark || ""
          }`.trim() || "Erattayar road, Kattapana, Kerala India",
        phone: organization?.mobile,
        email: organization?.email,
        website: organization?.website,
        pan: organization?.pan,
        gstin: organization?.gstNum,
        sacCode: "996311",
        logo: organization?.logo,
      },
      guest: {
        name: doc?.customerId?.partyName,
        roomNo: guestRooms,
        billNo: doc?.voucherNumber,
        travelAgent: doc?.agentId?.name,
        address: doc?.customerId?.billingAddress || "",
        phone: doc?.customerId?.mobileNumber || "",
        gstNo: doc?.customerId?.gstNo || "",
      },
      stay: {
        billDate: formatDate(new Date()),
        arrival: `${formatDate(doc?.arrivalDate)} ${doc?.arrivalTime || ""}`,
        departure: `${formatDate(doc?.checkOutDate || new Date())} ${
          doc?.checkOutTime || new Date().toLocaleTimeString()
        }`,
        days: doc?.selectedRooms?.[0]?.stayDays,
        plan: doc?.foodPlan?.[0]?.foodPlan,
        pax: totalPax,
        tariff: doc?.selectedRooms?.[0]?.totalAmount || 0,
      },
      charges: chargesWithBalance,
      summary: {
        roomRent: (roomTariffTotal || 0) + (additionalPaxAmount || 0) ,
        sgst: sgstAmount,
        cgst: cgstAmount,
        restaurant: dineInTotal, // ✅ Only dine-in restaurant amount
        roomService: roomServiceTotal, // ✅ Only room service amount
        foodPlan: planAmount + Number(foodPlanAmountWithTax),
        additionalPax: additionalPaxAmount,
        total: grandTotal,
        totalWords: convertNumberToWords(grandTotal),
      },

      payment: {
        mode: "Credit",
        total: grandTotal,
        advance: advanceTotal,
        netPay,
      },
    };
  };

  // Build all billData per doc; decide where advances appear
  const bills = useMemo(() => {
    const docs = selectedCheckOut || [];

    if (!docs.length) return [];
    const firstPrimaryIdx = findFirstPrimaryIdx(docs);

    return docs.map((doc, idx) => {
      // Rule: if this doc owns advances, show here; else show on firstPrimaryIdx
      const owns = docOwnsAdvances(doc);
      const useAdvances = owns ? true : idx === firstPrimaryIdx;
      return prepareBillDataForDoc(doc, useAdvances);
    });
  }, [selectedCheckOut, outStanding, kotData, organization]);

  // Print handlers use first bill by default for metadata
  const handlePrint = useReactToPrint({
    content: () => printReference.current,
    documentTitle: "Hotel Bill",
    removeAfterPrint: true,
  });

  const handlePrintPDF = (isPrint) => {
    const multi = bills && bills.length ? bills : [];
    if (!multi.length) return;

    if (!isPrint) {
      handleBillDownloadPDF(multi); // pass array
    } else {
      handleBillPrintInvoice(multi); // pass array
    }
  };
  console.log(bills);
  return (
    <>
      <TitleDiv title="Bill Print" />

      {showSplitPopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-80">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Select Option
            </h2>

            <div className="flex items-center mb-3">
              <input
                id="opt-default"
                type="radio"
                name="split-option"
                value="default"
                checked={selected === "default"}
                onChange={() => setSelected("default")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-default"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Default Print
              </label>
            </div>

            <div className="flex items-center mb-3">
              <input
                id="opt-room"
                type="radio"
                name="split-option"
                value="room"
                checked={selected === "room"}
                onChange={() => setSelected("room")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-room"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Room based
              </label>
            </div>

            <div className="flex items-center mb-5">
              <input
                id="opt-restaurant"
                type="radio"
                name="split-option"
                value="restaurant"
                checked={selected === "restaurant"}
                onChange={() => setSelected("restaurant")}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="opt-restaurant"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Restaurant based
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSplitPopUp(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSplit}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                disabled={!selected}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="font-sans bg-gray-100 p-5 min-h-screen"
        ref={printReference}
      >
        {/* Render one complete bill per selectedCheckOut doc */}
        {bills.map((billData, pageIdx) => (
          <div
            key={pageIdx}
            style={{
              maxWidth: "21cm",
              margin: "0 auto",
              padding: "0.5cm",
              backgroundColor: "white",
              fontFamily: "Arial, sans-serif",
              fontSize: "11px",
              lineHeight: "1.1",
              color: "#000",
              pageBreakAfter: pageIdx < bills.length - 1 ? "always" : "auto",
            }}
          >
            {/* Header */}
            <div
              className="page-header flex"
              style={{
                textAlign: "center",
                borderBottom: "1px solid #000",
                paddingBottom: "8px",
                marginBottom: "10px",
              }}
            >
              <div style={{ flex: "0 0 120px" }}>
                {Logo && (
                  <img
                    src={Logo}
                    alt="Logo"
                    style={{ width: "120px", height: "auto" }}
                  />
                )}
              </div>
              <div className="ml-auto">
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {billData?.hotel?.name}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    lineHeight: "1.2",
                  }}
                >
                  {billData?.hotel?.address?.split(",").map((line, index) => (
                    <div key={index}>{line.trim()}</div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "2px",
                    lineHeight: "1.2",
                  }}
                >
                  Phone: {billData?.hotel?.phone}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    marginBottom: "3px",
                    lineHeight: "1.2",
                  }}
                >
                  E-mail: {billData?.hotel?.email} | Website{" "}
                  {billData?.hotel?.website}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.1",
                  }}
                >
                  PAN NO: {billData?.hotel?.pan} | GSTIN:{" "}
                  {billData?.hotel?.gstin}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    lineHeight: "1.1",
                  }}
                >
                  SAC CODE-{billData?.hotel?.sacCode}
                </div>
              </div>
            </div>

            {/* Guest Info */}
            <div style={{ marginBottom: "10px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "10px",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "15%",
                        padding: "2px 0",
                        fontWeight: "bold",
                      }}
                    >
                      GRC No
                    </td>
                    <td style={{ width: "15%", padding: "2px 0" }}>
                      {billData?.guest?.billNo}
                    </td>
                    <td
                      style={{
                        width: "15%",
                        padding: "2px 0",
                        fontWeight: "bold",
                      }}
                    >
                      Bill No
                    </td>
                    <td style={{ width: "15%", padding: "2px 0" }}>
                      {billData?.guest?.billNo}
                    </td>
                    <td
                      style={{
                        width: "10%",
                        padding: "2px 0",
                        fontWeight: "bold",
                      }}
                    >
                      Date
                    </td>
                    <td style={{ width: "30%", padding: "2px 0" }}>
                      {billData?.stay?.billDate}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      GUEST
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.name}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Arrival
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.arrival}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Departure
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.departure}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Address
                    </td>
                    <td
                      colSpan="3"
                      style={{
                        padding: "2px 0",
                        fontSize: "10px",
                        lineHeight: "1.2",
                      }}
                    >
                      {billData?.guest?.address
                        ?.split(",")
                        .map((line, index) => (
                          <div key={index}>{line.trim()}</div>
                        ))}
                    </td>

                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Plan
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.plan} Pax {billData?.stay?.pax}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Phone
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.phone}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Tariff
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.stay?.tariff}
                    </td>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      No. of Days
                    </td>
                    <td style={{ padding: "2px 0" }}>{billData?.stay?.days}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Travel Agent
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.travelAgent}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      GST No
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.gstNo}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                  {/* <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Company
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.gstNo}
                    </td>
                    <td colSpan="4"></td>
                  </tr> */}
                  <tr>
                    <td style={{ padding: "2px 0", fontWeight: "bold" }}>
                      Room No
                    </td>
                    <td style={{ padding: "2px 0" }}>
                      {billData?.guest?.roomNo}
                    </td>
                    <td colSpan="4"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Charges Table */}
            <div style={{ marginBottom: "10px" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #000",
                  fontSize: "10px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left",
                      }}
                    >
                      Doc No
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "left",
                      }}
                    >
                      Description
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      Amount
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      Taxes
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      Advance
                    </th>
                    <th
                      style={{
                        border: "1px solid #000",
                        padding: "4px",
                        textAlign: "right",
                      }}
                    >
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {billData?.charges?.map((charge, index) => (
                    <tr key={index}>
                      <td style={{ border: "1px solid #000", padding: "3px" }}>
                        {charge.date}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "center",
                        }}
                      >
                        {charge.docNo}
                      </td>
                      <td style={{ border: "1px solid #000", padding: "3px" }}>
                        {charge.description}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right",
                        }}
                      >
                        {Number(charge.amount || 0).toFixed(2)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right",
                        }}
                      >
                        {charge.taxes}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right",
                        }}
                      >
                        {charge.advance}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "3px",
                          textAlign: "right",
                        }}
                      >
                        {charge.balance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary + Payment */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "10px" }}>
              {/* Summary */}
              <div style={{ flex: "1" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    fontSize: "11px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        Summary
                      </th>
                      <th
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Room Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.roomRent?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    {billData?.summary?.foodPlan > 0 && (
                      <tr>
                        <td
                          style={{ border: "1px solid #000", padding: "4px" }}
                        >
                          Food Plan
                        </td>
                        <td
                          style={{
                            border: "1px solid #000",
                            padding: "4px",
                            textAlign: "right",
                          }}
                        >
                          {billData?.summary?.foodPlan?.toLocaleString(
                            "en-IN",
                            {
                              minimumFractionDigits: 2,
                            }
                          )}
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        SGST on Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.sgst?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        CGST on Rent
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.cgst?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Ac Restaurant
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.restaurant?.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        Room Service
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.summary?.roomService?.toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>
                    </tr>

                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        Total
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                          fontWeight: "bold",
                        }}
                      >
                        {billData?.summary?.total?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment */}
              <div style={{ flex: "1" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #000",
                    fontSize: "11px",
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th
                        colSpan="2"
                        style={{
                          border: "1px solid #000",
                          padding: "6px",
                          textAlign: "left",
                          fontWeight: "bold",
                        }}
                      >
                        Payment Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                        }}
                      >
                        PAYMODE
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        AMOUNT
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        {billData?.payment?.mode}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        {billData?.payment?.total?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                        colSpan="2"
                      >
                        {billData?.guest?.name}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{ border: "1px solid #000", padding: "4px" }}
                        colSpan="2"
                      >
                        <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                          {billData?.summary?.totalWords}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ border: "1px solid #000", padding: "4px" }}>
                        <div>Total :</div>
                        <div>Less Advance:</div>
                        <div style={{ fontWeight: "bold" }}>Net Pay :</div>
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "4px",
                          textAlign: "right",
                        }}
                      >
                        <div>
                          {Number(billData?.payment?.total || 0).toFixed(2)}
                        </div>
                        <div>
                          {Number(billData?.payment?.advance || 0).toFixed(2)}
                        </div>
                        <div style={{ fontWeight: "bold" }}>
                          {Number(billData?.payment?.netPay || 0).toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div style={{ border: "1px solid #000" }}>
              <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "8px",
                    borderRight: "1px solid #000",
                    fontSize: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Please Deposit Your Room and Locker Keys
                </div>
                <div style={{ flex: "1", padding: "8px", fontSize: "10px" }}>
                  Regardless of charge instructions, I agree to be held
                  personally liable for the payment of total amount of bill.
                  Please collect receipt if you have paid cash.
                </div>
              </div>

              <div style={{ display: "flex", borderBottom: "1px solid #000" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    borderRight: "1px solid #000",
                    textAlign: "left",
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Prepared By
                  </div>
                  <div>FO</div>
                </div>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    borderRight: "1px solid #000",
                    textAlign: "left",
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Manager
                  </div>
                  <div
                    style={{
                      height: "15px",
                      borderBottom: "1px solid #000",
                      margin: "10px 0",
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    flex: "1",
                    padding: "12px",
                    textAlign: "left",
                    fontSize: "10px",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "15px" }}>
                    Guest Signature & Date
                  </div>
                  <div
                    style={{
                      height: "15px",
                      borderBottom: "1px solid #000",
                      margin: "10px 0",
                    }}
                  ></div>
                </div>
              </div>

              <div style={{ display: "flex" }}>
                <div
                  style={{
                    flex: "1",
                    padding: "8px",
                    borderRight: "1px solid #000",
                    fontStyle: "italic",
                    fontSize: "10px",
                  }}
                >
                  We hope you enjoyed your stay and would like to welcome you
                  back...
                </div>
                <div
                  style={{
                    padding: "8px",
                    fontSize: "10px",
                    textAlign: "center",
                    minWidth: "120px",
                  }}
                >
                  Original Bill
                  <br />
                  Page {pageIdx + 1}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Print Styles */}
        <style>{`
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body { margin: 0; padding: 0; }
            @page { margin: 0.5cm; size: A4; }
            .page-header { position: running(header); page-break-inside: avoid; break-inside: avoid; }
            .charges-table, .summary-section, .payment-section { page-break-inside: avoid; }
          }
        `}</style>
      </div>

      {/* Action buttons */}
      <div className="no-print w-full flex justify-center">
        <div className="no-print flex flex-wrap gap-3 mb-4 p-4">
          <button
            onClick={() => handlePrintPDF(false)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            📄 Download PDF
          </button>

          <button
            onClick={handleSplitPayment}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            💳 Split Payment
          </button>

          {isForPreview && (
            <button
              onClick={() => {
                // For preview confirm, use first bill’s netPay as balanceToPay

                let balanceToPay = 0;
                bills.forEach((item) => (balanceToPay += item.payment.netPay));
                console.log(balanceToPay);
                const firstDoc = selectedCheckOut[0];
                navigate("/sUsers/checkInList", {
                  state: {
                    selectedCheckOut,
                    selectedCustomer: firstDoc?.customerId,
                    balanceToPay,
                    kotData,
                    checkoutmode,
                    cheinids,
                  },
                });
              }}
              className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
            >
              ✅ Confirm
            </button>
          )}

          <button
            onClick={() => handlePrintPDF(true)}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors"
          >
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </>
  );
};

export default HotelBillPrint;
