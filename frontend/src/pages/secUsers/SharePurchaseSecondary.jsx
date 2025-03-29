import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
// import numberToWords from "number-to-words";
import { Link } from "react-router-dom";
import PurchasePdf from "../../components/pdf/purchase/PurchasePdf";
import { useSelector } from "react-redux";
import PurchasePdfNonIndian from "../../components/pdf/purchase/nonIndian/PurchasePdfNonIndian";

function ShareSalesSecondary() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);

  const [bank, setBank] = useState([]);

  const { id } = useParams();

  const IsIndian =
    useSelector(
      (state) => state.secSelectedOrganization.secSelectedOrg.country
    ) === "India";

  const contentToPrint = useRef(null);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/sUsers/getPurchaseDetails/${id}`, {
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

  console.log(data);

  //  console.log(org?.configurations[0]?.terms);

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

  return (
    <div className="">
      <div className="">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/sUsers/purchaseDetails/${id}`}>
              <IoIosArrowRoundBack className="text-3xl" />
            </Link>
            <p>Share Your Order</p>
          </div>
          <div>
            <MdPrint
              onClick={() => {
                handlePrint(null, () => contentToPrint.current);
              }}
              className="text-xl cursor-pointer "
            />
          </div>
        </div>

        {IsIndian ? (
          <PurchasePdf
            contentToPrint={contentToPrint}
            data={data}
            org={org}
            bank={bank}
            userType="secondaryUser"
            tab="purchase"
          />
        ) : (
          <PurchasePdfNonIndian
            contentToPrint={contentToPrint}
            data={data}
            org={org}
            bank={bank}
            userType="secondaryUser"
            tab="purchase"
          />
        )}
      </div>
    </div>
  );
}

export default ShareSalesSecondary;
