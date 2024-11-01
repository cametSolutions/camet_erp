import { useRef, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ReceiptPrintOutForm from "../../components/common/ReceiptPrintOutForm";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdPrint } from "react-icons/md";
import { Link } from "react-router-dom";
import numberToWords from "number-to-words";

function PaymentPrintOut() {
  const contentToPrint = useRef(null);
  const companyData = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const location = useLocation();
  const receiptData = location.state.receiptData;

  // ///since we are using same receipt page as component it is named it as receiptData

  const [inWords, setInWords] = useState("");
  const [subTotal, setSubTotal] = useState("");
  const [finalAmount, setFinalAmount] = useState("");

  const handlePrint = useReactToPrint({
    documentTitle: `Sale Order`,
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (receiptData && receiptData.billData) {
      const subTotal = receiptData.billData
        .reduce((acc, curr) => acc + parseFloat(curr?.settledAmount), 0)
        .toFixed(2);

      console.log(subTotal);
      setSubTotal(subTotal);

      const finalAmount = receiptData.enteredAmount;
      console.log(finalAmount);

      setFinalAmount(finalAmount);

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      console.log(integerWords);
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";

      console.log(decimalWords);

      const mergedWord = [...integerWords,...decimalWords].join("");

      setInWords(mergedWord);
    }
  }, [receiptData]);

  return (
    <>
      <div className=" nonPrintable-content bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
        <div className="flex gap-2 ">
          <Link to={-1}>
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
      <ReceiptPrintOutForm
        title="Payment"
        voucherNumber={receiptData.paymentNumber}
        receiptData={receiptData}
        org={companyData}
        contentToPrint={contentToPrint}
        inWords={inWords}
      />
    </>
  );
}

export default PaymentPrintOut;
