/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { defaultPrintSettings } from "../../../../../utils/defaultConfigurations";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import TitleDiv from "@/components/common/TitleDiv";
import { Title } from "@radix-ui/react-dialog";

function VoucherThreeInchPdfFormat2({
  data,
  org,
  isPreview,
  sendToParent,
}) {
  const [subTotal, setSubTotal] = useState(0);
  const location = useLocation();
  const contentToPrint = useRef(null);
  
  !data && (data = location?.state);
  !org && (org = useSelector((state) => state?.secSelectedOrganization?.secSelectedOrg));

  const isIndian = useSelector((state) => state?.secSelectedOrganization?.secSelectedOrg?.country === "India");
  const party = data?.party;
  const isSameState = org?.state?.toLowerCase() === party?.state?.toLowerCase() || !party?.state;

  const voucherType = data?.voucherType;
  const getVoucherNumber = () => {
    if (!voucherType) return "";
    if (voucherType === "sales" || voucherType === "vanSale") return "salesNumber";
    if (voucherType === "saleOrder") return "orderNumber";
    return voucherType + "Number";
  };

  const getConfigurationVoucherType = () => {
    const currentVoucherType = data?.voucherType;
    if (currentVoucherType === "sales" || currentVoucherType === "vanSale") return "sale";
    if (currentVoucherType === "saleOrder") return "saleOrder";
    return "default";
  };

  const allPrintConfigurations = useSelector(
    (state) => state.secSelectedOrganization?.secSelectedOrg?.configurations[0]?.printConfiguration
  );

  const matchedConfiguration = allPrintConfigurations?.find(
    (item) => item.voucher === getConfigurationVoucherType()
  );

  // const configurations = voucherType && voucherType !== "default" && matchedConfiguration
  //   ? matchedConfiguration
  //   : defaultPrintSettings;

  useEffect(() => {
    if (data && data.items) {
      data.discount = data.additionalCharges?.[0]?.value || 0;
      console.log(data?.items[0])
      const calculatedSubTotal = data.items
        .reduce((acc, curr) => acc + Number(curr?.total) - Number(curr?.totalIgstAmt), 0)
        .toFixed(2);
        console.log(calculatedSubTotal)
      setSubTotal(Number( calculatedSubTotal || data?.subTotal));
    }
  }, [data]);

  const calculateTotalTax = () => data?.items?.reduce((acc, curr) => acc + (curr?.totalIgstAmt || 0), 0) || 0;

  const getBillNumber = () => data?.[getVoucherNumber()] || data?.voucherNumber?.[0]?.voucherNumber || "11007";

  const getTableNumber = () =>
    data?.voucherNumber?.map((item) => item?.tableNumber).join(", ") ||
    data?.convertedFrom?.map((item) => item?.tableNumber).join(", ") ||
    "1";

  const getRoomNumber = () => {
    if (!data?.voucherNumber?.[0]?.checkInNumber) return "Room";
    return `Room: ${
      data?.roomDetails?.roomno ||
      data?.voucherNumber?.[0]?.roomNumber ||
      data?.roomId?.roomno ||
      data?.roomId?.roomName ||
      "N/A"
    }`;
  };

  const netAmount = Number(data?.finalAmount || 0).toFixed(2);
  const discount = Number(data?.discount || 0).toFixed(2);
  const tax = calculateTotalTax().toFixed(2);
  const cgst = (calculateTotalTax() / 2).toFixed(2);

  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
  });

  const containerStyle = {
    width: "80mm",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    fontSize: "11px",
    lineHeight: 1.2,
    padding: "4mm",
    border: "1px dotted #000",
  };

  const flexRow = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2px",
  };

  const textRight = { textAlign: "right", paddingRight: "3px" };
  const textLeft = { textAlign: "left", paddingLeft: "3px" };
  const centerText = { textAlign: "center" };
  const bold = { fontWeight: "bold" };
  const headerGrid = {
    display: "grid",
    gridTemplateColumns: "35px 1fr 45px 55px 65px",
    fontSize: "11px",
    fontWeight: "bold",
    paddingBottom: "3px",
    borderBottom: "1px dotted #000",
    marginBottom: "4px",
  };
  const itemGrid = {
    display: "grid",
    gridTemplateColumns: "35px 1fr 45px 55px 65px",
    fontSize: "10px",
    fontWeight: "bold",
    marginBottom: "2px",
    padding: "1px 0",
  };

  return (
    <>
    <TitleDiv  title="Restaurant sale print" />
    <div className="grid mt-2">
      <div ref={contentToPrint} className="receipt-container" style={containerStyle}>
        {/* Header */}
        <div style={{ ...flexRow, marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px dotted #000", alignItems: "flex-start", gap: "8px" }}>
          {org?.logo && (
            <img
              src={org.logo}
              alt="Logo"
              style={{ width: "25mm", height: "auto", objectFit: "contain" }}
            />
          )}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ ...bold, fontSize: "16px", marginBottom: "2px" }}>{org?.name}</div>
            <div>{`${org?.road}, ${org?.place}`}</div>
            <div>PH: {org?.mobile}</div>
            <div>SAC CODE: {org?.sacCode}</div>
            {org?.gstNum && <div>GSTNO: {org.gstNum}</div>}
          </div>
        </div>

        {/* Title */}
        <div style={{ ...centerText, marginBottom: "6px", paddingBottom: "6px", borderBottom: "1px dotted #000" }}>
          <div style={{ fontSize: "14px", fontWeight: "bold", fontStyle: "italic" }}>INVOICE</div>
        </div>

        {/* Bill Info */}
        <div style={{ marginBottom: "6px", fontSize: "11px", fontWeight: "bold", paddingBottom: "6px", borderBottom: "1px dotted #000" }}>
          <div style={flexRow}><span>Bill {getBillNumber()}</span><span>Date: {new Date(data?.Date || data?.createdAt).toLocaleDateString("en-GB")}</span></div>
          <div style={flexRow}>
            <span>Table: {getTableNumber()}</span>
            <span>Time: {new Date(data?.Date || data?.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
          </div>
        </div>

        {/* Items Header */}
        <div style={headerGrid}>
          <div style={textLeft}>No</div>
          <div style={textLeft}>Item</div>
          <div style={centerText}>Qty</div>
          <div style={textRight}>Rate</div>
          <div style={textRight}>Amount</div>
        </div>

        {/* Items */}
        {data?.items?.map((el, index) => {
          const total = Number(el?.total || 0);
          const count = Number(el?.totalCount || 1);
          const rate = count > 0 ? (total / count).toFixed(2) : "0.00";
          return (
            <div key={index} style={itemGrid}>
              <div style={textLeft}>{index + 1}</div>
              <div style={{ ...textLeft, wordBreak: "break-word" }}>{el.product_name}</div>
              <div style={centerText}>{count}</div>
              <div style={textRight}>{rate}</div>
              <div style={textRight}>{total.toFixed(2)}</div>
            </div>
          );
        })}

        <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

        {/* Totals */}
        <div style={{ fontSize: "10px", marginBottom: "4px" }}>
          <div style={{ ...flexRow, marginBottom: "2px", fontWeight: "bold" }}>
            <div style={{ marginLeft: "auto", width: "60px" }}>Amount</div>
            <div style={textRight}>{subTotal.toFixed(2)}</div>
          </div>

          {isIndian && isSameState && calculateTotalTax() > 0 && (
            <>
              <div style={flexRow}>
                <div style={{ marginLeft: "auto", width: "70px", fontWeight: "bold" }}>CGST @2.5%</div>
                <div style={textRight}>{cgst}</div>
              </div>
              <div style={flexRow}>
                <div style={{ marginLeft: "auto", width: "70px", fontWeight: "bold" }}>SGST @2.5%</div>
                <div style={textRight}>{cgst}</div>
              </div>
            </>
          )}

          {isIndian && !isSameState && calculateTotalTax() > 0 && (
            <div style={flexRow}>
              <div style={{ marginLeft: "auto", width: "70px" }}>IGST @5%</div>
              <div style={textRight}>{tax}</div>
            </div>
          )}

          {!isIndian && calculateTotalTax() > 0 && (
            <div style={flexRow}>
              <div style={{ marginLeft: "auto", width: "70px" }}>VAT</div>
              <div style={textRight}>{tax}</div>
            </div>
          )}
        </div>

        <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

        {/* Final Details */}
        <div style={{ fontSize: "10px", marginBottom: "6px" }}>
          <div style={{ ...flexRow, fontWeight: "bold", marginBottom: "2px" }}>
            <div style={bold}>{getRoomNumber()}</div>
            <div style={{ paddingRight: "3px", fontWeight: "bold" }}>Total: {netAmount}</div>
          </div>

          {data?.voucherNumber?.[0]?.checkInNumber && (
            <div style={flexRow}>
              <div style={bold}>{data.voucherNumber[0].checkInNumber}</div>
              <div style={{ paddingRight: "3px" }}>
                GST: <span style={bold}>{tax}</span>
              </div>
            </div>
          )}

          {Number(discount) > 0 && (
            <div style={{ ...flexRow, justifyContent: "flex-end", paddingRight: "3px", fontWeight: "bold" }}>
              Discount: <span style={bold}>{discount}</span>
            </div>
          )}
        </div>

        <div style={{ borderBottom: "1px dotted #000", margin: "6px 0" }} />

        {/* Net Amount */}
        <div style={{ ...centerText, fontSize: "14px", fontWeight: "bold", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px dotted #000" }}>
          Net Amount: {netAmount}
        </div>

        {/* Footer */}
        <div style={{ ...centerText, fontSize: "11px", fontWeight: "bold", marginTop: "8px" }}>
          Thank You Visit Again
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center p-2">
        <button
          className="px-3 py-1 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 active:scale-95 transition"
          onClick={handlePrint}
        >
          Print
        </button>
        {isPreview && (
          <>
          <button
            className="px-3 py-1 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 active:scale-95 transition"
            onClick={() => sendToParent(true)}
          >
            Confirm
          </button>
           <button
          className="px-3 py-1 rounded-lg bg-red-400 text-gray-800 font-medium hover:bg-red-500 active:scale-95 transition"
          onClick={() => sendToParent(false)}
        >
          Cancel
        </button>
        </>
        )}
       
      </div>
    </div>
    </>
  );
}

export default VoucherThreeInchPdfFormat2;
