import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import { useReactToPrint } from "react-to-print"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import ReceiptInvoice from "./ReceiptInvoice"
import useFetch from "@/customHook/useFetch"
import TitleDiv from "@/components/common/TitleDiv"
const ReceiptInvoicepage = () => {
  const invoiceRef = useRef()
  const [receiptdata, setreceiptdata] = useState([])
  const { id } = useParams()
  console.log(id)
  const organization = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  )
  const {
    data: transactionDetails,
    loading,
    refreshHook
  } = useFetch(`/api/sUsers/get${"receipt"}Details/${id}`)
  console.log(transactionDetails)
  useEffect(() => {
    if (transactionDetails) {
      console.log(transactionDetails)
      console.log(organization.logo)

      setreceiptdata(transactionDetails.receipt)
    }
  }, [transactionDetails])
  console.log(receiptdata)
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: "Advance_Receipt"
  })
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
      <div style={{ padding: "20px" }}>
        {/* ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginBottom: "20px"
          }}
        >
          <button onClick={handlePrint}>🖨️ Print</button>
          <button onClick={handleDownload}>⬇️ Download PDF</button>
        </div>

        {/* INVOICE CENTER WRAPPER */}
        <div
          style={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <ReceiptInvoice ref={invoiceRef} data={receiptdata} />
        </div>
      </div>
    </div>
  )
}

export default ReceiptInvoicepage
