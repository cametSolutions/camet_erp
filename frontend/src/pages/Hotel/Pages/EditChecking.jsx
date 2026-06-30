import { useEffect, useState, useRef } from "react";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import TitleDiv from "@/components/common/TitleDiv";
import BookingForm from "../Components/BookingForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "@/api/api";
import useFetch from "@/customHook/useFetch";

const normalizeAuditDate = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.includes("T") ? value.split("T")[0] : value;
};

const nextAuditDate = (value) => {
  const date = new Date(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split("T")[0];
};

function EditChecking() {
  const isSubmittingRef = useRef(false);
  const location = useLocation();
  const editData = location?.state;
  const isTariffRateChange = location?.state?.fromDashboard === true;
  const roomIdToEdit = location?.state?.roomId;

  console.log(editData, "editData");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [outStanding, setOutStanding] = useState([]);
  const [auditState, setAuditState] = useState({
    loading: Boolean(editData?.arrivalDate),
    isLocked: false,
    message: "",
    lockedThroughDate: "",
  });

  const { data, loading: advanceLoading } = useFetch(
    editData?._id
      ? `/api/sUsers/getBookingAdvanceData/${editData?._id}?type=${"EditChecking"}`
      : "",
  );

  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg,
  );

  useEffect(() => {
    if (data) {
      setOutStanding(data?.data);
    }
  }, [data]);

  useEffect(() => {
    if (!editData) {
      navigate("/sUsers/checkInList", { replace: true });
      return;
    }

    const auditDate = normalizeAuditDate(editData?.arrivalDate);

    if (!auditDate || !organization?._id) {
      setAuditState({
        loading: false,
        isLocked: false,
        message: "",
        lockedThroughDate: "",
      });
      return;
    }

    let isMounted = true;

    const fetchAuditStatus = async () => {
      setAuditState((prev) => ({
        ...prev,
        loading: true,
      }));

      try {
        const response = await api.get(
          `/api/sUsers/nightAudit/${organization._id}/status`,
          {
            params: { auditDate },
            withCredentials: true,
          },
        );

        const isLocked = Boolean(response?.data?.isLocked);
        const lockedThroughDate = response?.data?.lockedThroughDate;
        const checkoutDate = normalizeAuditDate(editData?.checkOutDate);
        const nextEditableDate = lockedThroughDate
          ? nextAuditDate(lockedThroughDate)
          : "";
        const hasTariffEditableWindow =
          isTariffRateChange &&
          lockedThroughDate &&
          checkoutDate &&
          nextEditableDate <= checkoutDate;

        if (!isMounted) return;

        setAuditState({
          loading: false,
          isLocked: isLocked && !(isTariffRateChange && hasTariffEditableWindow),
          message: isLocked
            ? isTariffRateChange && hasTariffEditableWindow
              ? `Dates up to ${lockedThroughDate} have been night audited. Tariff Applicable Date can be changed only from ${nextEditableDate} to ${checkoutDate}.`
              : isTariffRateChange
                ? `This tariff edit is blocked because all tariff dates up to ${checkoutDate} fall inside the night-audited period through ${lockedThroughDate}.`
                : `This check-in cannot be edited because check-ins up to ${lockedThroughDate} have been night audited.`
            : "",
          lockedThroughDate: lockedThroughDate || "",
        });
      } catch (error) {
        if (!isMounted) return;

        setAuditState({
          loading: false,
          isLocked: false,
          message: "",
          lockedThroughDate: "",
        });

        toast.error(
          error?.response?.data?.message || "Failed to fetch night audit status",
        );
      }
    };

    fetchAuditStatus();

    return () => {
      isMounted = false;
    };
  }, [editData, navigate, organization?._id]);

  // useEffect(() => {
  //   if (editData) {
  //     editData.previousAdvance = Number(
  //       editData?.bookingId?.advanceAmount || 0,
  //     );
  //     editData.totalAdvance =
  //       Number(editData?.bookingId?.totalAdvance || 0) +
  //       Number(editData?.totalAdvance || 0);
  //   }
  // }, [editData]);

  const handleSubmit = async (payload, paymentData,paymenttypeDetails) => {
    console.log(payload,paymentData,paymenttypeDetails)
    try {
      const response = await api.put(
        `/api/sUsers/updateRoomBooking/${editData._id}`,
        {
          data: payload,
          modal: "checkIn",
          paymentData: paymentData,
          orgId: organization._id,
          isTariffRateChange: isTariffRateChange, // ✅ Pass flag
          roomIdToEdit: roomIdToEdit,
          paymenttypeDetails
        },
        { withCredentials: true },
      );
      if (response?.data?.success) {
        toast.success(
          isTariffRateChange
            ? `Room tariff updated successfully. ${response.data.roomsCount} room(s) in check-in.`
            : response?.data?.message,
        );
        isTariffRateChange
          ? navigate("/sUsers/hotelDashBoard")
          : navigate("/sUsers/checkInList");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update faile`d");
    } finally {
      // Reset the submitting flag
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      {loading && advanceLoading ? (
        <CustomBarLoader />
      ) : (
        <div>
          <TitleDiv
            title={isTariffRateChange ? "Edit Tariff Rate" : "Edit Checking"}
            from="/sUsers/hotelDashBoard"
            dropdownContents={
              !isTariffRateChange
                ? [
                    {
                      title: "New Guest",
                      onClick: () => navigate("sUsers/partyList"),
                    },
                  ]
                : []
            }
          />
          <BookingForm
            handleSubmit={handleSubmit}
            setIsLoading={setLoading}
            editData={editData}
            isSubmittingRef={isSubmittingRef}
            // isFor={"deliveryNote"}
            outStanding={outStanding}
            isTariffRateChange={isTariffRateChange}
            roomId={roomIdToEdit}
            submitLoader={loading}
            isShowGrc={true}
            isEditLockLoading={auditState.loading}
            isEditLocked={auditState.isLocked}
            editLockMessage={auditState.message}
            lockedThroughDate={auditState.lockedThroughDate}
          />
        </div>
      )}
    </>
  );
}

export default EditChecking;
