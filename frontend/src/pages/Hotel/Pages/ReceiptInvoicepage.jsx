import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReceiptInvoice from "./ReceiptInvoice";
import useFetch from "@/customHook/useFetch";
import TitleDiv from "@/components/common/TitleDiv";
const ReceiptInvoicepage = () => {
  const invoiceRef = useRef();
  const [receiptdata, setreceiptdata] = useState([]);
  const { id } = useParams();
  console.log(id);
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg,
  );
  const {
    data: transactionDetails,
    loading,
    refreshHook,
  } = useFetch(`/api/sUsers/get${"receipt"}Details/${id}`);


  console.log(transactionDetails);
  useEffect(() => {
    if (transactionDetails) {

      setreceiptdata(transactionDetails.receipt);
    }
  }, [transactionDetails]);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: "Advance_Receipt",
  });
  const handleDownload = async () => {
    const element = invoiceRef.current;

    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("Advance_Receipt.pdf");
  };

  return (
    <div>
      <TitleDiv title={"Receipt Details"} loading={loading} />
      {/* INVOICE CENTER WRAPPER */}

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ReceiptInvoice ref={invoiceRef} data={receiptdata} />
        </div>
        <div className="flex items-center justify-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:bg-gray-100"
          >
            <span className="text-base">🖨️</span>
            <span>Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 active:bg-sky-800"
          >
            <span className="text-base">⬇️</span>
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptInvoicepage;
