import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Sidebar from "../../components/homePage/Sidebar";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
import numberToWords from "number-to-words";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import SaleOrderPdf from "../../components/common/SaleOrderPdf";


function ShareInvoice() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [inWords, setInWords] = useState("");
  const [bank, setBank] = useState([]);

  const { id } = useParams();

  const contentToPrint = useRef(null);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/pUsers/getInvoiceDetails/${id}`, {
          withCredentials: true,
        });

        // Extract cmp_id from the response
        const cmpId = res.data.data.cmp_id; // Assuming cmp_id is a property of the data
        // Update the state with the cmp_id

        // Fetch company details using the cmp_id
        const companyDetails = await api.get(
          `/api/pUsers/getSingleOrganization/${cmpId}`,
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

  useEffect(() => {
    if (data && data.items) {
      const subTotal = data.items
        .reduce((acc, curr) => acc + parseFloat(curr?.total), 0)
        .toFixed(2);
      setSubTotal(subTotal);

      const addiTionalCharge = data?.additionalCharges
        ?.reduce((acc, curr) => {
          let value = curr?.finalValue === "" ? 0 : parseFloat(curr.finalValue);
          if (curr?.action === "add") {
            return acc + value;
          } else if (curr?.action === "sub") {
            return acc - value;
          }
          return acc;
        }, 0)

        ?.toFixed(2);
      setAdditinalCharge(addiTionalCharge);

      const finalAmount = data.finalAmount;
      console.log(finalAmount);

      setFinalAmount(finalAmount);

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      console.log(integerWords);
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";
      console.log(decimalWords);

      const mergedWord = [
        ...integerWords,
        " Rupees",
        ...decimalWords,
        "Paisa",
      ].join("");

      setInWords(mergedWord);
    }
  }, [data]);

  // if (totalAmount) {

  //   // setInWords(mergedWord)
  // }

  const handlePrint = useReactToPrint({
    documentTitle: `Sale Order ${data.orderNumber}`,
    pageStyle: `
    @page {
      size: A4;
      margin: 20mm 10mm;

    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        font-family: 'Arial', sans-serif;
      }

      .pdf-page {
        page-break-after: always;
      }

      .pdf-header {
        font-size: 16px;
        // font-weight: bold;
      }

      .pdf-content {
        font-size: 19px;
      }

      .pdf-footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        text-align: center;
        font-size: 12px;
      }
    }
  `,
    removeAfterPrint: true,
  });

  return (
    <div className="flex">
      <div className="flex-1">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/pUsers/InvoiceDetails/${id}`}>
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

        <SaleOrderPdf
          contentToPrint={contentToPrint}
          data={data}
          org={org}
          bank={bank}
          subTotal={subTotal}
          additinalCharge={additinalCharge}
          inWords={inWords}
          userType="primaryUser"
        />
      </div>
    </div>);
}

export default ShareInvoice;
