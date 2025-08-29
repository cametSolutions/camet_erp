import { useRef, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
// import { FaFilePdf } from "react-icons/fa";
// import { BeatLoader } from "react-spinners"; // You can use any loader from react-spinners
import useFetch from "@/customHook/useFetch";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdPrint } from "react-icons/md";
import CustomBarLoader from "@/components/common/CustomBarLoader";
import VoucherThreeInchPdf from "./threeInchPdf/VoucherThreeInchPdf";

function VoucherPdfInitiatorThreeInch() {
  const [data, setData] = useState([]);
  const { id } = useParams();

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

  if (pathname.includes("/sUsers/sharesalesThreeInch/")) {
    voucherType = "sales";
  } else if (pathname.includes("/sUsers/sharepurchaseThreeInch/")) {
    voucherType = "purchase";
  } else if (pathname.includes("/sUsers/sharesaleOrderThreeInch/")) {
    voucherType = "saleOrder";
  } else if (pathname.includes("/sUsers/sharecreditNoteThreeInch/")) {
    voucherType = "creditNote";
  } else if (pathname.includes("/sUsers/sharedebitNoteThreeInch/")) {
    voucherType = "debitNote";
  } else if (pathname.includes("/sUsers/sharevanSaleThreeInch/")) {
    voucherType = "sales";
    params.vanSale = true;
  }

  // useEffect(() => {
  //   const getTransactionDetails = async () => {
  //     try {
  //       // Fetch invoice details
  //       const res = await api.get(
  //         `/api/sUsers/get${voucherType}Details/${id}`,

  //         {
  //           params,
  //           withCredentials: true,
  //         }
  //       );
  //       setData(res.data.data);

  //       // Set loading to false after data is fetched
  //       // setLoading(false);
  //     } catch (error) {
  //       console.log(error);
  //       toast.error(error.response.data.message);
  //       // setLoading(false);

  //       // Navigate back if there's an error
  //       setTimeout(() => {
  //         navigate(-1, { replace: true });
  //       }, 2000);
  //     }
  //   };

  //   getTransactionDetails();
  // }, [id, voucherType]);

  const { data: voucherData, loading } = useFetch(
    `/api/sUsers/get${voucherType}Details/${id}`,
    params,
    true
  );

  useEffect(() => {
    if (voucherData) {
      setData(voucherData.data);
    }
  }, [voucherData]);

const handlePrint = useReactToPrint({
  documentTitle: `Sale Order ${data?.salesNumber}`,
  pageStyle: `
    @page { 
      size: 80mm auto; 
      margin: 0mm;
    }
    @media print {
      body { 
        margin: 0;
        font-family: monospace !important;
        -webkit-print-color-adjust: exact;
      }
    }
  `,
  onBeforePrint: () => console.log("before printing..."),
  onAfterPrint: () => console.log("after printing..."),
  removeAfterPrint: true,
});
  return (
    <div>
      {/* <TitleDiv title="Voucher" loading={loading} /> */}

      <div className=" nonPrintable-content bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
        <div className="flex gap-2 ">
          <button
            onClick={() => navigate(-1, { replace: true })}
            className="cursor-pointer"
          >
            <IoIosArrowRoundBack className="text-3xl" />
          </button>
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
      {loading && <CustomBarLoader />}

      <div className="  ">
        <VoucherThreeInchPdf
          contentToPrint={contentToPrint}
          data={data}
          org={org}
          bank={bank}
          tab="sale"
        />
      </div>
    </div>
  );
}

export default VoucherPdfInitiatorThreeInch;
