import { useRef, useEffect, useState } from "react";
import api from "../../../api/api";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import { useReactToPrint } from "react-to-print";
// import { FaFilePdf } from "react-icons/fa";
// import { BeatLoader } from "react-spinners"; // You can use any loader from react-spinners

import SalesPdfNonInd from "../../../components/pdf/sales/nonIndian/SalesPdfNonInd";
import VoucherPdf from "./indian/VoucherPdf";

function VoucherPdfInitiator() {
  const [data, setData] = useState([]);
  // const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const IsIndian =
    useSelector(
      (state) => state?.secSelectedOrganization?.secSelectedOrg?.country
    ) === "India";

  const org = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg
  );

  const bank = org?.configurations[0]?.bank;

  const contentToPrint = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  let voucherType = null;
  const params = {};

  if (pathname.includes("/sUsers/sharesales/")) {
    voucherType = "sales";
  } else if (pathname.includes("/sUsers/sharepurchase/")) {
    voucherType = "purchase";
  } else if (pathname.includes("/sUsers/sharesaleOrder/")) {
    voucherType = "saleOrder";
  } else if (pathname.includes("/sUsers/sharecreditNote/")) {
    voucherType = "creditNote";
  } else if (pathname.includes("/sUsers/sharedebitNote/")) {
    voucherType = "debitNote";
  } else if (pathname.includes("/sUsers/sharevanSale/")) {
    voucherType = "sales";
    params.vanSale = true;
  }

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(
          `/api/sUsers/get${voucherType}Details/${id}`,
         
          {
             params,
            withCredentials: true,
          }
        );
        setData(res.data.data);

        // Set loading to false after data is fetched
        // setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
        // setLoading(false);

        // Navigate back if there's an error
        setTimeout(() => {
          navigate(-1, { replace: true });
        }, 2000);
      }
    };

    getTransactionDetails();
  }, [id, voucherType]);

  // Setup print functionality using useReactToPrint
  // const handlePrint = useReactToPrint({
  //   content: () => contentToPrint.current,
  //   documentTitle: data.salesNumber
  //     ? `${data.salesNumber}_${data._id.slice(-4)}`
  //     : "Sales_Invoice",
  //   pageStyle: `
  //     @page {
  //       size: A4;
  //       margin: 0mm 10mm 9mm 10mm;
  //     }

  //     @media print {
  //       body {
  //         -webkit-print-color-adjust: exact;
  //         font-family: 'Arial', sans-serif;
  //       }

  //       .pdf-page {
  //         page-break-after: always;
  //       }

  //       .pdf-content {
  //         font-size: 19px;
  //       }

  //       .print-md-layout {
  //         display: flex;
  //         flex-direction: row;
  //         justify-content: space-between;
  //         align-items: flex-start;
  //         gap: 8px;
  //         padding: 1rem 2rem;
  //         width: 100%;
  //       }

  //       .bill-to, .ship-to {
  //         width: 50%;
  //         padding-right: 1rem;
  //         border-right: 1px solid #e5e7eb;
  //       }

  //       .details-table {
  //         width: 50%;
  //         padding-left: 1rem;
  //       }

  //       .details-table td {
  //         font-size: 11px;
  //         color: #6b7280;
  //       }

  //       @media print {
  //         .print-md-layout {
  //           display: flex !important;
  //           flex-direction: row !important;
  //         }
  //       }
  //     }
  //   `,
  //   onAfterPrint: () => {
  //     console.log("PDF printed successfully");
  //     // Navigate back after printing completes
  //     setTimeout(() => {
  //       navigate(-1, { replace: true });
  //     }, 500);
  //   },
  //   removeAfterPrint: true,
  // });

  // Effect to trigger PDF printing once data is loaded
  // useEffect(() => {
  //   if (!loading && data.salesNumber && contentToPrint.current) {
  //     // Small delay to ensure the PDF component is fully rendered
  //     const timer = setTimeout(() => {
  //       // Trigger the print dialog automatically
  //       handlePrint();
  //     }, 1000);

  //     return () => clearTimeout(timer);
  //   }
  // }, [loading, data.salesNumber, handlePrint]);

  return (
    <div className="h-screen  flex flex-col items-center justify-center ">
      {/* Loading Screen */}
      {/* <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-6xl text-purple-600">
          <FaFilePdf />
        </div>
        <h1 className="text-2xl font-bold text-gray-700">
          Preparing Your Sales Invoice
        </h1>
        <div className="mt-4">
          <BeatLoader color="#9900ff" size={15} />
        </div>
        <p className="text-gray-500 mt-4 text-center max-w-md">
          Your PDF is being generated. The print dialog will appear shortly.
          <br />
          Please wait...
        </p>
      </div> */}

      {/* Hidden PDF Content */}
      <div className="w-full overflow-x-scroll scrollbar-none">
        <div>
          {IsIndian ? (
            <VoucherPdf
              contentToPrint={contentToPrint}
              data={data}
              org={org}
              bank={bank}
              userType="secondaryUser"
              tab="sales"
            />
          ) : (
            <SalesPdfNonInd
              contentToPrint={contentToPrint}
              data={data}
              org={org}
              bank={bank}
              userType="secondaryUser"
              tab="sales"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VoucherPdfInitiator;
