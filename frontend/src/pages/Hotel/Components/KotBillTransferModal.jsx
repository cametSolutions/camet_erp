import { useState, useMemo, useEffect } from "react";
import {
  X,
  Search,
  ArrowRight,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  ChevronsRight,
  Utensils,
  Trash2,
} from "lucide-react";
import useFetch from "@/customHook/useFetch";
import { toast } from "sonner";
import api from "@/api/api";

const statusConfig = {
  served: {
    label: "Served",
    color: "#16a34a",
    bg: "#dcfce7",
    border: "#bbf7d0",
  },
  pending: {
    label: "Pending",
    color: "#d97706",
    bg: "#fef9c3",
    border: "#fde68a",
  },
  cancelled: {
    label: "Cancelled",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fecaca",
  },
};

export default function KotBillTransferModal({
  selectedCheckIns = [],
  onClose,
  cmp_id,
}) {
  const [selectedBills, setSelectedBills] = useState([]);
  const [kotData, setKotData] = useState([]);
  const [allChecking, setAllChecking] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [targetRoom, setTargetRoom] = useState(null);
  const [sourceSearch, setSourceSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [step, setStep] = useState(1);
  const [transferred, setTransferred] = useState(false);

  const checkInNumbers = useMemo(() => {
    return selectedCheckIns
      .map((item) => item?.voucherNumber || item?.checkInNumber)
      .filter(Boolean);
  }, [selectedCheckIns]);

  const { data, loading, error } = useFetch(
    `/api/sUsers/getRestaurantBillsDetails/${cmp_id}`,
    { checkInNumbers }
  );

  const {
    data: AllChecking,
    loading: AllCheckingLoading,
    error: AllCheckingError,
  } = useFetch(`/api/sUsers/getAllChecking/${cmp_id}`);

  useEffect(() => {
    if (data?.data) {
      setKotData(Array.isArray(data.data) ? data.data : []);
    } else {
      setKotData([]);
    }
  }, [data]);

  useEffect(() => {
    if (AllChecking?.data) {
      setAllChecking(Array.isArray(AllChecking.data) ? AllChecking.data : []);
    } else {
      setAllChecking([]);
    }
  }, [AllChecking]);

  // 1) Convert API KOT data into room-wise map
  const billsByRoom = useMemo(() => {
    const roomMap = {};

    (kotData || []).forEach((kot) => {
      const roomId = kot?.roomId?._id || kot?.roomId;
      if (!roomId) return;

      if (!roomMap[roomId]) {
        roomMap[roomId] = [];
      }

      roomMap[roomId].push({
        id: kot?._id,
        billNo: kot?.voucherNumber || "KOT",
        amount: Number(kot?.total || 0),
        status: kot?.status || "pending",
        time: kot?.createdAt
          ? new Date(kot.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        createdAt: kot?.createdAt,
        originalData: kot,
        items: (kot?.items || []).map((item) => ({
          id: item?._id,
          name: item?.product_name || item?.name || "Item",
          qty: Number(
            item?.remainingQty > 0 ? item?.remainingQty : item?.quantity || 0
          ),
          rate: Number(item?.price || 0),
          total: Number(item?.total || 0),
        })),
      });
    });

    Object.keys(roomMap).forEach((roomId) => {
      roomMap[roomId].sort((a, b) => {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    });

    return roomMap;
  }, [kotData]);

  // 2) Build organized rooms from selectedCheckIns for STEP 1
  const organizedRooms = useMemo(() => {
    if (!Array.isArray(selectedCheckIns)) return [];

    return selectedCheckIns.flatMap((checkIn) => {
      const checkInNo = checkIn?.voucherNumber || checkIn?.checkInNumber || "";
      const guestName =
        checkIn?.guestName ||
        checkIn?.customerName ||
        checkIn?.customerId?.partyName ||
        checkIn?.guestId?.partyName ||
        checkIn?.customer?.name ||
        "";

      return (checkIn?.selectedRooms || []).map((room, index) => {
        const roomId = room?.roomId?._id || room?.roomId || "";
        const roomName = room?.roomName || room?.roomId?.roomName || "";
        const bills = billsByRoom[roomId] || [];

        return {
          id: `${checkIn?._id || checkInNo}-${roomId || index}`,
          roomId,
          roomName,
          roomNo: roomName,
          guestName,
          checkInNo,
          checkInId: checkIn?._id,
          voucherNumber: checkInNo,
          bills,
          totalBillAmount: bills.reduce(
            (sum, bill) => sum + Number(bill.amount || 0),
            0
          ),
        };
      });
    });
  }, [selectedCheckIns, billsByRoom]);

  // 3) Build all active check-in rooms for STEP 2
  const allCheckInRooms = useMemo(() => {
    if (!Array.isArray(allChecking)) return [];

    return allChecking.flatMap((checkIn) => {
      const checkInNo = checkIn?.voucherNumber || checkIn?.checkInNumber || "";
      const guestName =
        checkIn?.guestName ||
        checkIn?.customerName ||
        checkIn?.customerId?.partyName ||
        checkIn?.guestId?.partyName ||
        checkIn?.customer?.name ||
        "";

      return (checkIn?.selectedRooms || []).map((room, index) => {
        const roomId = room?.roomId?._id || room?.roomId || "";
        const roomName = room?.roomName || room?.roomId?.roomName || "";
        const bills = billsByRoom[roomId] || [];

        return {
          id: `target-${checkIn?._id || checkInNo}-${roomId || index}`,
          roomId,
          roomName,
          roomNo: roomName,
          guestName,
          checkInNo,
          checkInId: checkIn?._id,
          voucherNumber: checkInNo,
          party:checkIn?.customerId,
          bills,
          totalBillAmount: bills.reduce(
            (sum, bill) => sum + Number(bill.amount || 0),
            0
          ),
        };
      });
    });
  }, [allChecking, billsByRoom]);

  // 4) Auto-select first room if current active room becomes invalid
  useEffect(() => {
    if (!organizedRooms.length) {
      setActiveRoom(null);
      return;
    }

    const stillExists = organizedRooms.find(
      (room) => room.roomId === activeRoom?.roomId
    );

    if (!stillExists) {
      setActiveRoom(organizedRooms[0]);
    }
  }, [organizedRooms, activeRoom]);

  // 5) Filter source rooms
  const filteredSourceRooms = useMemo(() => {
    const search = sourceSearch?.toLowerCase().trim() || "";

    if (!search) return organizedRooms;

    return organizedRooms.filter((room) => {
      return (
        (room?.roomNo || "").toLowerCase().includes(search) ||
        (room?.guestName || "").toLowerCase().includes(search) ||
        (room?.checkInNo || "").toLowerCase().includes(search)
      );
    });
  }, [organizedRooms, sourceSearch]);

  // 6) Rooms from which bills are selected
  const sourceRoomIds = useMemo(() => {
    return [
      ...new Set(selectedBills.map((sb) => sb.room.roomId).filter(Boolean)),
    ];
  }, [selectedBills]);

  // 7) Filter target rooms from ALL active check-ins
  const filteredTargetRooms = useMemo(() => {
    const search = targetSearch?.toLowerCase().trim() || "";

    return allCheckInRooms.filter((room) => {
      const excluded = sourceRoomIds.includes(room.roomId);
      if (excluded) return false;

      if (!search) return true;

      return (
        (room?.roomNo || "").toLowerCase().includes(search) ||
        (room?.guestName || "").toLowerCase().includes(search) ||
        (room?.checkInNo || "").toLowerCase().includes(search)
      );
    });
  }, [allCheckInRooms, sourceRoomIds, targetSearch]);

  const toggleBill = (bill, room) => {
    setSelectedBills((prev) => {
      const exists = prev.find((sb) => sb.bill.id === bill.id);

      if (exists) {
        return prev.filter((sb) => sb.bill.id !== bill.id);
      }

      return [...prev, { bill, room }];
    });
  };

  const isBillSelected = (billId) => {
    return selectedBills.some((sb) => sb.bill.id === billId);
  };

  const totalSelectedAmount = useMemo(() => {
    return selectedBills.reduce(
      (sum, sb) => sum + Number(sb?.bill?.amount || 0),
      0
    );
  }, [selectedBills]);

  const groupedSelected = useMemo(() => {
    const grouped = {};

    selectedBills.forEach(({ bill, room }) => {
      const key = room.roomId;

      if (!grouped[key]) {
        grouped[key] = {
          room,
          bills: [],
        };
      }

      grouped[key].bills.push(bill);
    });

    return Object.values(grouped);
  }, [selectedBills]);

const handleTransfer = async () => {
  if (!groupedSelected?.length) {
    toast.error("Please select at least one bill to transfer");
    return;
  }

  if (!targetRoom?.roomId) {
    toast.error("Please select a target room");
    return;
  }

  try {
    const { data } = await api.post(
      `/api/sUsers/transferKotBills/${cmp_id}`,
      {
        groupedSelected,
        targetRoom,
      }
    );

    if (!data?.success) {
      toast.error(data?.message || "Transfer failed");
      return;
    }

    toast.success(data?.message || "Bills transferred successfully");
    setTransferred(true);

    setTimeout(() => {
      onClose?.(false);
    }, 2400);
  } catch (error) {
    console.error("Error in handleTransfer:", error);
    toast.error(error?.response?.data?.message || "Something went wrong");
  }
};

  const primaryBtn = (enabled) => ({
    padding: "8px 20px",
    borderRadius: "6px",
    border: "none",
    background: enabled ? "#1d4ed8" : "#e2e8f0",
    color: enabled ? "#fff" : "#94a3b8",
    fontSize: "13px",
    fontWeight: 500,
    cursor: enabled ? "pointer" : "not-allowed",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  });

  if (loading || AllCheckingLoading) {
    return <div>Loading...</div>;
  }

  if (error || AllCheckingError) {
    return <div>Error: {(error || AllCheckingError)?.message}</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose?.(false)}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "940px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#1e2a3a",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "6px",
                background: "rgba(59,130,246,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ChefHat size={16} color="#60a5fa" />
            </div>
            <div>
              <div
                style={{
                  color: "#f1f5f9",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                Restaurant Bill Transfer
              </div>
              <div style={{ color: "#94a3b8", fontSize: "11px" }}>
                Select bills from any rooms and move them to one destination
              </div>
            </div>
          </div>

          <button
            onClick={() => onClose(false)}
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: "6px",
              padding: "6px",
              cursor: "pointer",
              display: "flex",
              color: "#94a3b8",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            padding: "10px 20px",
            background: "#f8f9fb",
            borderBottom: "1px solid #e5e9ef",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            flexShrink: 0,
          }}
        >
          {["Select Bills", "Select Target Room", "Confirm"].map((s, i) => {
            const idx = i + 1;
            const active = step === idx;
            const done = step > idx;

            return (
              <div
                key={s}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    opacity: done || active ? 1 : 0.4,
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: done
                        ? "#16a34a"
                        : active
                        ? "#1d4ed8"
                        : "#cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {done ? <CheckCircle2 size={12} /> : idx}
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: active ? 600 : 400,
                      color: active
                        ? "#1e293b"
                        : done
                        ? "#16a34a"
                        : "#64748b",
                    }}
                  >
                    {s}
                  </span>
                </div>
                {i < 2 && <ChevronsRight size={13} color="#cbd5e1" />}
              </div>
            );
          })}

          {selectedBills.length > 0 && step === 1 && (
            <div
              style={{
                marginLeft: "auto",
                background: "#1d4ed8",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "20px",
              }}
            >
              {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} · ₹
              {totalSelectedAmount.toLocaleString()}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {transferred && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={32} color="#16a34a" />
              </div>

              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#1e293b",
                  }}
                >
                  Bills Transferred Successfully
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    marginTop: "4px",
                  }}
                >
                  {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} →{" "}
                  Room {targetRoom?.roomNo} ({targetRoom?.guestName})
                </div>
              </div>
            </div>
          )}

          {!transferred && step === 1 && (
            <div style={{ display: "flex", minHeight: "420px" }}>
              <div
                style={{
                  width: "220px",
                  flexShrink: 0,
                  borderRight: "1px solid #e5e9ef",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    padding: "11px 13px",
                    borderBottom: "1px solid #f1f3f6",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#64748b",
                      marginBottom: "7px",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Rooms
                  </div>

                  <div style={{ position: "relative" }}>
                    <Search
                      size={12}
                      style={{
                        position: "absolute",
                        left: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      placeholder="Search room or guest..."
                      value={sourceSearch}
                      onChange={(e) => setSourceSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px 8px 6px 26px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "12px",
                        outline: "none",
                        boxSizing: "border-box",
                        color: "#1e293b",
                      }}
                    />
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto" }}>
                  {filteredSourceRooms.map((room) => {
                    const isViewing = activeRoom?.roomId === room.roomId;
                    const selCount = selectedBills.filter(
                      (sb) => sb.room.roomId === room.roomId
                    ).length;

                    return (
                      <div
                        key={room.id}
                        onClick={() => setActiveRoom(room)}
                        style={{
                          padding: "10px 13px",
                          cursor: "pointer",
                          background: isViewing ? "#eff6ff" : "transparent",
                          borderLeft: isViewing
                            ? "3px solid #1d4ed8"
                            : "3px solid transparent",
                          borderBottom: "1px solid #f8fafc",
                          transition: "background 0.1s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              fontSize: "13px",
                              color: isViewing ? "#1d4ed8" : "#1e293b",
                            }}
                          >
                            Room {room.roomNo}
                          </span>

                          <div style={{ display: "flex", gap: "4px" }}>
                            {selCount > 0 && (
                              <span
                                style={{
                                  fontSize: "10px",
                                  background: "#1d4ed8",
                                  color: "#fff",
                                  padding: "1px 6px",
                                  borderRadius: "20px",
                                  fontWeight: 600,
                                }}
                              >
                                {selCount}
                              </span>
                            )}

                            {/* <span
                              style={{
                                fontSize: "10px",
                                background: isViewing ? "#dbeafe" : "#f1f5f9",
                                color: isViewing ? "#1d4ed8" : "#64748b",
                                padding: "2px 6px",
                                borderRadius: "20px",
                                fontWeight: 500,
                              }}
                            >
                              {room.bills.length} KOT{room.bills.length > 1 ? "s" : ""}
                            </span> */}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#64748b",
                            marginTop: "2px",
                          }}
                        >
                          {room.guestName || "No guest"}
                        </div>

                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                          {room.checkInNo}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid #e5e9ef",
                }}
              >
                <div
                  style={{
                    padding: "11px 14px",
                    borderBottom: "1px solid #f1f3f6",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {activeRoom
                      ? `KOT Bills — Room ${activeRoom.roomNo}`
                      : "Select a room to view bills"}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                  }}
                >
                  {!activeRoom && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "220px",
                        gap: "10px",
                        color: "#94a3b8",
                      }}
                    >
                      <Utensils size={30} color="#e2e8f0" />
                      <span style={{ fontSize: "13px" }}>
                        Pick a room on the left
                      </span>
                    </div>
                  )}

                  {activeRoom && activeRoom.bills.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "220px",
                        gap: "10px",
                        color: "#94a3b8",
                      }}
                    >
                      <Utensils size={30} color="#e2e8f0" />
                      <span style={{ fontSize: "13px" }}>
                        No KOT bills for this room
                      </span>
                    </div>
                  )}

                  {activeRoom?.bills.map((bill) => {
                    const selected = isBillSelected(bill.id);
                    const st = statusConfig[bill.status] || statusConfig.pending;

                    return (
                      <div
                        key={bill.id}
                        onClick={() => toggleBill(bill, activeRoom)}
                        style={{
                          border: selected
                            ? "2px solid #1d4ed8"
                            : "1px solid #e5e9ef",
                          borderRadius: "8px",
                          padding: "11px 13px",
                          cursor: "pointer",
                          background: selected ? "#eff6ff" : "#fff",
                          transition: "all 0.12s",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "7px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <div
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "4px",
                                border: selected
                                  ? "none"
                                  : "1.5px solid #cbd5e1",
                                background: selected ? "#1d4ed8" : "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {selected && (
                                <CheckCircle2
                                  size={12}
                                  color="#fff"
                                  strokeWidth={3}
                                />
                              )}
                            </div>
                            <span
                              style={{
                                fontWeight: 600,
                                fontSize: "13px",
                                color: selected ? "#1d4ed8" : "#1e293b",
                              }}
                            >
                              {bill.billNo}
                            </span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                padding: "2px 7px",
                                borderRadius: "20px",
                                background: st.bg,
                                color: st.color,
                                border: `1px solid ${st.border}`,
                                fontWeight: 500,
                              }}
                            >
                              {st.label}
                            </span>
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#94a3b8",
                              }}
                            >
                              {bill.time}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                            marginBottom: "9px",
                          }}
                        >
                          {bill.items.map((item, i) => (
                            <div
                              key={item.id || i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "12px",
                              }}
                            >
                              <span style={{ color: "#475569" }}>
                                <span
                                  style={{
                                    color: "#94a3b8",
                                    marginRight: "4px",
                                  }}
                                >
                                  {item.qty}×
                                </span>
                                {item.name}
                              </span>
                              <span style={{ color: "#64748b" }}>
                                ₹
                                {(
                                  item.total ||
                                  item.qty * item.rate ||
                                  0
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            borderTop: "1px dashed #e5e9ef",
                            paddingTop: "8px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {bill.items.length} items
                          </span>
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: "14px",
                              color: "#1e293b",
                            }}
                          >
                            ₹{Number(bill.amount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  width: "200px",
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  background: "#fafbfc",
                }}
              >
                <div
                  style={{
                    padding: "11px 13px",
                    borderBottom: "1px solid #f1f3f6",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Selected {selectedBills.length > 0 && `(${selectedBills.length})`}
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px 11px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {selectedBills.length === 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "160px",
                        gap: "8px",
                        color: "#94a3b8",
                        textAlign: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          border: "1.5px dashed #e2e8f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <ArrowRight size={14} color="#cbd5e1" />
                      </div>
                      <span style={{ fontSize: "12px", lineHeight: "1.4" }}>
                        Tap bills to add them here
                      </span>
                    </div>
                  )}

                  {groupedSelected.map(({ room, bills }) => (
                    <div key={room.roomId}>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#94a3b8",
                          marginBottom: "4px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        Room {room.roomNo}
                      </div>

                      {bills.map((bill) => (
                        <div
                          key={bill.id}
                          style={{
                            background: "#fff",
                            border: "1px solid #e5e9ef",
                            borderRadius: "6px",
                            padding: "7px 9px",
                            marginBottom: "4px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#1e293b",
                              }}
                            >
                              {bill.billNo}
                            </div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>
                              ₹{Number(bill.amount || 0).toLocaleString()}
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBill(bill, room);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              color: "#ef4444",
                              padding: "2px",
                              display: "flex",
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {selectedBills.length > 0 && (
                  <div
                    style={{
                      padding: "10px 11px",
                      borderTop: "1px solid #e5e9ef",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "12px",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Total</span>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>
                        ₹{totalSelectedAmount.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {selectedBills.length} bill{selectedBills.length > 1 ? "s" : ""} ·{" "}
                      {groupedSelected.length} room{groupedSelected.length > 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!transferred && step === 2 && (
            <div style={{ padding: "16px 20px" }}>
              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px solid #bae6fd",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#0369a1",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Moving
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0c4a6e",
                    }}
                  >
                    {selectedBills.length} KOT bill
                    {selectedBills.length > 1 ? "s" : ""} from {groupedSelected.length} room
                    {groupedSelected.length > 1 ? "s" : ""}
                  </div>
                </div>

                <ArrowRight size={14} color="#7dd3fc" />

                <div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#0369a1",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Total Amount
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#0c4a6e",
                    }}
                  >
                    ₹{totalSelectedAmount.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    marginLeft: "auto",
                    display: "flex",
                    gap: "5px",
                    flexWrap: "wrap",
                  }}
                >
                  {groupedSelected.map(({ room }) => (
                    <span
                      key={room.roomId}
                      style={{
                        fontSize: "11px",
                        background: "#e0f2fe",
                        color: "#0369a1",
                        padding: "2px 8px",
                        borderRadius: "20px",
                        fontWeight: 500,
                      }}
                    >
                      Room {room.roomNo}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Select Destination Room
              </div>

              <div style={{ position: "relative", marginBottom: "12px" }}>
                <Search
                  size={13}
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                />
                <input
                  placeholder="Search by room, guest or check-in no..."
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "7px",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box",
                    color: "#1e293b",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
                  gap: "10px",
                }}
              >
                {filteredTargetRooms.map((room) => {
                  const active = targetRoom?.roomId === room.roomId;

                  return (
                    <div
                      key={room.id}
                      onClick={() => setTargetRoom(room)}
                      style={{
                        border: active
                          ? "2px solid #1d4ed8"
                          : "1px solid #e5e9ef",
                        borderRadius: "8px",
                        padding: "13px 14px",
                        cursor: "pointer",
                        background: active ? "#eff6ff" : "#fff",
                        transition: "all 0.12s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color: active ? "#1d4ed8" : "#1e293b",
                            }}
                          >
                            Room {room.roomNo}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "2px",
                            }}
                          >
                            {room.guestName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {room.checkInNo}
                          </div>
                        </div>

                        {active && <CheckCircle2 size={18} color="#1d4ed8" />}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!transferred && step === 3 && (
            <div style={{ padding: "18px 20px" }}>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  marginBottom: "18px",
                }}
              >
                <AlertCircle
                  size={15}
                  color="#d97706"
                  style={{ flexShrink: 0, marginTop: "1px" }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    color: "#92400e",
                    lineHeight: "1.5",
                  }}
                >
                  This will permanently move {selectedBills.length} bill
                  {selectedBills.length > 1 ? "s" : ""} to Room {targetRoom?.roomNo}.
                  This action cannot be undone.
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  gap: "12px",
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    border: "1px solid #e5e9ef",
                    borderRadius: "10px",
                    padding: "14px",
                    background: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#94a3b8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    From
                  </div>

                  {groupedSelected.map(({ room, bills }) => (
                    <div key={room.roomId}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "13px",
                          color: "#1e293b",
                          marginBottom: "2px",
                        }}
                      >
                        Room {room.roomNo} — {room.guestName}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          marginBottom: "8px",
                        }}
                      >
                        {room.checkInNo}
                      </div>

                      {bills.map((bill) => (
                        <div
                          key={bill.id}
                          style={{
                            background: "#fff",
                            border: "1px solid #e5e9ef",
                            borderRadius: "6px",
                            padding: "9px 11px",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: "12px",
                              color: "#1e293b",
                              marginBottom: "5px",
                            }}
                          >
                            {bill.billNo}
                          </div>

                          {bill.items.map((item, i) => (
                            <div
                              key={item.id || i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "11px",
                                color: "#64748b",
                                marginBottom: "2px",
                              }}
                            >
                              <span>
                                {item.qty}× {item.name}
                              </span>
                              <span>
                                ₹
                                {(
                                  item.total ||
                                  item.qty * item.rate ||
                                  0
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}

                          <div
                            style={{
                              borderTop: "1px dashed #e5e9ef",
                              marginTop: "7px",
                              paddingTop: "7px",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Subtotal
                            </span>
                            <span
                              style={{
                                fontWeight: 700,
                                fontSize: "12px",
                                color: "#1e293b",
                              }}
                            >
                              ₹{Number(bill.amount || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  <div
                    style={{
                      borderTop: "1px solid #e5e9ef",
                      paddingTop: "8px",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      {selectedBills.length} bills total
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#1e293b",
                      }}
                    >
                      ₹{totalSelectedAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingTop: "40px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "#1d4ed8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ArrowRight size={16} color="#fff" />
                  </div>
                </div>

                <div
                  style={{
                    border: "2px solid #1d4ed8",
                    borderRadius: "10px",
                    padding: "14px",
                    background: "#eff6ff",
                  }}
                >
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#1d4ed8",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "8px",
                    }}
                  >
                    To
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "#1e293b",
                    }}
                  >
                    Room {targetRoom?.roomNo}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748b" }}>
                    {targetRoom?.guestName}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "12px",
                    }}
                  >
                    {targetRoom?.checkInNo}
                  </div>

                  <div
                    style={{
                      background: "#fff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "7px",
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        marginBottom: "5px",
                      }}
                    >
                      Existing KOTs
                    </div>

                    {targetRoom?.bills.length === 0 ? (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#94a3b8",
                          marginBottom: "5px",
                        }}
                      >
                        No bills yet
                      </div>
                    ) : (
                      targetRoom?.bills.map((b) => (
                        <div
                          key={b.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "11px",
                            color: "#64748b",
                            marginBottom: "2px",
                          }}
                        >
                          <span>{b.billNo}</span>
                          <span>₹{Number(b.amount || 0).toLocaleString()}</span>
                        </div>
                      ))
                    )}

                    <div
                      style={{
                        borderTop: "1px dashed #bfdbfe",
                        marginTop: "8px",
                        paddingTop: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                        After transfer
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "13px",
                          color: "#1d4ed8",
                        }}
                      >
                        ₹
                        {(
                          Number(targetRoom?.totalBillAmount || 0) +
                          totalSelectedAmount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!transferred && (
          <div
            style={{
              padding: "12px 20px",
              background: "#f8f9fb",
              borderTop: "1px solid #e5e9ef",
              flexShrink: 0,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => (step > 1 ? setStep((s) => s - 1) : onClose?.(false))}
              style={{
                padding: "8px 18px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                {step === 1 &&
                  (selectedBills.length === 0
                    ? "Select at least one bill"
                    : `${selectedBills.length} bill${
                        selectedBills.length > 1 ? "s" : ""
                      } selected`)}
                {step === 2 &&
                  (!targetRoom ? "Select destination room" : "Ready to review")}
                {step === 3 && "Review and confirm"}
              </span>

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={step === 1 ? selectedBills.length === 0 : !targetRoom}
                  style={primaryBtn(step === 1 ? selectedBills.length > 0 : !!targetRoom)}
                >
                  Continue <ArrowRight size={13} />
                </button>
              ) : (
                <button
                  onClick={handleTransfer}
                  style={{
                    padding: "8px 22px",
                    borderRadius: "6px",
                    border: "none",
                    background: "#16a34a",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CheckCircle2 size={14} /> Confirm Transfer
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}