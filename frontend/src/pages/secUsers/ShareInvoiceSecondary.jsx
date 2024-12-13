import { useRef, useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
// import numberToWords from "number-to-words";
import { Link } from "react-router-dom";
// import SaleOrderPdf from "../../components/common/SaleOrderPdf";
import { useSelector } from "react-redux";
import ShareModal from "./settilngs/dataEntry/modals/ShareModal";
import { IoShareSocial } from "react-icons/io5";
import SalesOrderPdf from "../../components/pdf/saleOrder/SalesOrderPdf";

function ShareInvoiceSecondary() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { id } = useParams();
  const [bank, setBank] = useState([]);

  const contentToPrint = useRef(null);

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        // Fetch invoice details
        const res = await api.get(`/api/sUsers/getInvoiceDetails/${id}`, {
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
        setOrg(companyDetails.data.organizationData);
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

  // useEffect(() => {
  //   if (data && data.items) {
  //     const subTotal = data.items
  //       .reduce((acc, curr) => acc + parseFloat(curr?.total), 0)
  //       .toFixed(2);
  //     setSubTotal(subTotal);

  //     const addiTionalCharge = data?.additionalCharges
  //       ?.reduce((acc, curr) => {
  //         let value = curr?.finalValue === "" ? 0 : parseFloat(curr.finalValue);
  //         if (curr?.action === "add") {
  //           return acc + value;
  //         } else if (curr?.action === "sub") {
  //           return acc - value;
  //         }
  //         return acc;
  //       }, 0)

  //       ?.toFixed(2);
  //     setAdditinalCharge(addiTionalCharge);

  //     const finalAmount = data.finalAmount;

  //     setFinalAmount(finalAmount);

  //     const [integerPart, decimalPart] = finalAmount.toString().split(".");
  //     const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
  //     console.log(integerWords);

  //     const decimalWords = decimalPart
  //       ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
  //       : " and Zero ";

  //     console.log(decimalWords);

  //     const mergedWord = [
  //       ...integerWords,
  //       // " Rupees",
  //       ...decimalWords,
  //       // "Paisa",
  //     ].join("");

  //     setInWords(mergedWord);
  //   }
  // }, [data]);

  const { printTitle } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );


  return (
    <div className="flex">
      <div className="flex-1">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/sUsers/InvoiceDetails/${id}`}>
              <IoIosArrowRoundBack className="text-3xl" />
            </Link>
            <p>Share Your Order</p>
          </div>
          <div>
            {/* <MdPrint
              onClick={() => {
                handlePrint(null, () => contentToPrint.current);
              }}
              className="text-xl cursor-pointer "
            /> */}

            <div className="flex">
              <IoShareSocial
                className="text-xl cursor-pointer"
                onClick={() => setShowModal(true)}
              />
            </div>
          </div>
        </div>

        <ShareModal
          data={data}
          org={org}
          contentToPrint={contentToPrint}
          showModal={showModal}
          setShowModal={setShowModal}
        />
        <SalesOrderPdf
          printTitle={printTitle}
          contentToPrint={contentToPrint}
          data={data}
          org={org}
          bank={bank}
          // subTotal={subTotal}
          // additinalCharge={additinalCharge}
          // inWords={inWords}
          userType="secondaryUser"
        />
      </div>
    </div>
  );
}

export default ShareInvoiceSecondary;
