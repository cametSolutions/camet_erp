import { useRef, useEffect, useState } from "react";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { FaFilePdf, FaPrint } from "react-icons/fa";
import { BeatLoader } from "react-spinners";

import SalesPdf from "../../components/pdf/sales/SalesPdf";
import SalesPdfNonInd from "../../components/pdf/sales/nonIndian/SalesPdfNonInd";

function ShareSalesSecondary() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const IsIndian =
    useSelector(
      (state) => state.secSelectedOrganization.secSelectedOrg.country
    ) === "India";

  const contentToPrint = useRef(null);
  const navigate = useNavigate();

  // Setup print functionality using useReactToPrint
  const handlePrint = useReactToPrint({
    content: () => contentToPrint.current,
    documentTitle: data.salesNumber
      ? `${data.salesNumber}_${data._id.slice(-4)}`
      : "Sales_Invoice",
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
          border-right: 1px solid #e5e7eb;
        }

        .details-table {
          width: 50%;
          padding-left: 1rem;
        }

        .details-table td {
          font-size: 11px;
          color: #6b7280;
        }

        @media print {
          .print-md-layout {
            display: flex !important;
            flex-direction: row !important;
          }
        }
      }
    `,
    onAfterPrint: () => {
      console.log("PDF printed successfully");
    },
    removeAfterPrint: true,
  });

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/sUsers/getSalesDetails/${id}`, {
          withCredentials: true,
        });

        // Extract cmp_id from the response
        const cmpId = res.data.data.cmp_id;

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

        // Set loading to false after data is fetched
        setLoading(false);
      } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || "Failed to load data");
        setLoading(false);

        // Navigate back if there's an error
        setTimeout(() => {
          navigate(-1, { replace: true });
        }, 2000);
      }
    };

    getTransactionDetails();
  }, [id, navigate]);

  // Function to handle navigation back
  const handleGoBack = () => {
    navigate(-1, { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-4">
      {loading ? (
        // Loading Screen
        <div className="flex flex-col items-center justify-center gap-6 h-screen">
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
            Your PDF is being generated. Please wait...
          </p>
        </div>
      ) : (
        // Content after loading
        <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Controls bar */}
          <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {data.salesNumber || "Sales Invoice"}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                <FaPrint /> Print Invoice
              </button>
              <button
                onClick={handleGoBack}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Back
              </button>
            </div>
          </div>
          
          {/* PDF Content */}
          <div className="p-4">
            {IsIndian ? (
              <SalesPdf
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
      )}
    </div>
  );
}

export default ShareSalesSecondary;