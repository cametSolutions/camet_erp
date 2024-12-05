import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
// import numberToWords from "number-to-words";
import { Link } from "react-router-dom";
import SalesPdf from "../../components/common/SalesPdf";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function ShareSalesSecondary() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);

  const [bank, setBank] = useState([]);

  const { id } = useParams();

  const contentToPrint = useRef(null);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          withCredentials: true,
        });

        // Extract cmp_id from the response
        const cmpId = res.data.data.cmp_id; // Assuming cmp_id is a property of the data
        // Update the state with the cmp_id

        // Fetch company details using the cmp_id
        const companyDetails = await api.get(
          `/api/sUsers/getSingleOrganization/${cmpId}`,
          {
            withCredentials: true,
          }
        );

        setData(res.data.data);
        setOrg(companyDetails?.data?.organizationData);
        setBank(
          companyDetails?.data?.organizationData?.configurations[0]?.bank
        );
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    getTransactionDetails();
  }, [id]);


  


//// to print pdf
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    // documentTitle: `Sales ${data.salesNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0mm 10mm 9mm 10mm;
      }
  
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          font-family: 'Arial', sans-serif;
        }
  
        .pdf-page {
          page-break-after: always;
        }
  
        .pdf-content {
          font-size: 19px;
        }
  
        .print-md-layout {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          gap: 8px;
          padding: 1rem 2rem;
          width: 100%;
        }
  
        .bill-to, .ship-to {
          width: 50%;
          padding-right: 1rem;
          border-right: 1px solid #e5e7eb; /* Tailwind color gray-300 */
        }
  
        .details-table {
          width: 50%;
          padding-left: 1rem;
        }
  
        .details-table td {
          font-size: 11px;
          color: #6b7280; /* Tailwind color gray-500 */
        }
  
        /* Force flex-row for print */
        @media print {
          .print-md-layout {
            display: flex !important;
            flex-direction: row !important;
          }
        }
      }
    `,
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });
  
  /// to sent to email/////////////////

  const sendEmailWithPdf = async () => {
    const element = contentToPrint.current;

    try {
      // Generate PDF Blob
      const pdfBlob = await generatePdfBlob(element);

      // Convert Blob to Base64
      const base64Pdf = await blobToBase64(pdfBlob);

      const response = await api.post(
        `/api/sUsers/sendPdfViaMail/${org?._id}`,
        {
          pdfBlob: base64Pdf,
          email: data?.party?.emailID,
          subject: "Your Sales Invoice",
        },
        { withCredentials: true } // Ensure this is passed in the second argument
      );

      if (response.data.success) {
        console.log("Email sent successfully");
      } else {
        console.error("Failed to send email:", response.data.message);
      }
    } catch (error) {
      console.error("Error generating or sending PDF:", error);
    }
  };


  /////////// to generate blob////

  const generatePdfBlob = async (element) => {
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 0, 0);
    return pdf.output("blob");
  };

  //// convert blob to 64 base
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1]; // Extract only the Base64 string
        resolve(base64data);
      };
      reader.onerror = (error) => reject(error);
    });
  };



  return (
    <div className="">
   
      <div className="">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/sUsers/salesDetails/${id}`}>
              <IoIosArrowRoundBack className="text-3xl" />
            </Link>
            <p>Share Your Sale</p>
          </div>
          <div>
            <MdPrint
              onClick={() => {
                sendEmailWithPdf(null, () => contentToPrint.current);
              }}
              className="text-xl cursor-pointer "
            />
          </div>
        </div>

        <SalesPdf
          contentToPrint={contentToPrint}
          data={data}
          org={org}
          bank={bank}
          // subTotal={subTotal}
          // additinalCharge={additinalCharge}
          // inWords={inWords}
          userType="secondaryUser"
          tab="sales"
          // calculateTotalTax={calculateTotalTax}
          
        />
      </div>
    </div>
  );
}

export default ShareSalesSecondary;
