import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Sidebar from "../../components/homePage/Sidebar";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { MdPrint } from "react-icons/md";
import numberToWords from "number-to-words";
import { Link } from "react-router-dom";

function ShareInvoice() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [finalAmount, setFinalAmount] = useState("");
  const [inWords, setInWords] = useState("");
  const { id } = useParams();

  const contentToPrint = useRef(null);

  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  useEffect(() => {
    const getTransactionDetails = async () => {
      try {
        const [res, companyDetails] = await Promise.all([
          api.get(`/api/pUsers/getInvoiceDetails/${id}`, {
            withCredentials: true,
          }),
          api.get(`/api/pUsers/getSingleOrganization/${cmp_id}`, {
            withCredentials: true,
          }),
        ]);

        setData(res.data.data);
        setOrg(companyDetails.data.organizationData);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    getTransactionDetails();
  }, []);



  useEffect(() => {
    if (data && data.items) {
      const subTotal = data.items
        .reduce((acc, curr) => acc + parseFloat(curr?.total), 0)
        .toFixed(2);
      setSubTotal(subTotal);

      const addiTionalCharge = data?.additionalCharges
        ?.reduce((acc, curr) => acc + parseFloat(curr?.value || 0), 0)
        ?.toFixed(2);
      setAdditinalCharge(addiTionalCharge);

      const finalAmount = parseFloat(subTotal) + parseFloat(addiTionalCharge);

      setFinalAmount(finalAmount);

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : "";

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
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });




  return (
    <div className="flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
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

        <div
          ref={contentToPrint}
          className="rounded-lg  px-3 max-w-3xl mx-auto  md:block"
        >
          <div className="flex ">
            <div className="font-bold text-sm md:text-xl mb-2 mt-6">
              QUOTATION
            </div>
          </div>
          <div>
            <div className="bg-gray-500 h-2 w-full mt-1"></div>
            <div className="flex items-center justify-between  bg-gray-300 px-3 py-1 ">
              <div className="text-xs md:text-sm">
                Invoice #:{data?.orderNumber}{" "}
              </div>
              <div className="text-xs md:text-sm">
                Date:{new Date().toDateString()}{" "}
              </div>
            </div>
          </div>

          <div className="flex mt-2 border-t-2 py-3">
            <div className="w-0.5/5">
              <img className="h-16 w-16 mr-2 mt-1 " src={org.logo} alt="Logo" />
            </div>
            <div className="w-4/5 flex flex-col mt-1">
              <div className="">
                <p className="text-gray-700 font-semibold text-base pb-1">
                  {org?.name}
                </p>
              </div>
              <div className="">
                <div className="text-gray-500 md:text-xs text-[10px] mt-1">
                  {[
                    org?.flat,
                    org?.landmark,
                    org?.road,
                    org?.place,
                    org?.pin,
                    org?.mobile,
                  ]
                    .filter(Boolean) // Remove any falsy values (e.g., undefined or null)
                    .join(", ")}
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between px-5 gap-6 mt-2  bg-slate-100 py-2">
            <div className="">
              <div className="text-gray-500  mb-0.5 md:text-xs text-[9px]">
                Pan No: {org?.pan}
              </div>
              <div className="text-gray-500 mb-0.5 md:text-xs text-[9px]">
                Gst No: {org?.gstNum}
              </div>
            </div>
            <div className="flex  flex-col ">
              <div className="text-gray-500  mb-0.5 md:text-xs text-[9px] text-right">
                {org?.email}
              </div>
              <div className="text-gray-500 mb-0.5 md:text-xs text-[9px] text-right">
                {org?.website}
              </div>
            </div>
          </div>

          <div className="flex md:gap-[130px] justify-between  text-[9px] md:text-xs mt-4 px-5 border-t-2 pt-4">
            <div className=" border-gray-300 pb-4 mb-2">
              <h2 className=" text-xs font-bold mb-1">Bill To:</h2>
              <div className="text-gray-700 ">{data?.party?.partyName}</div>
              {data?.party?.billingAddress
                ?.split(/[\n,]+/)
                .map((line, index) => (
                  <div key={index} className="text-gray-700 ">
                    {line.trim()}
                  </div>
                ))}{" "}
              {/* <div className="text-gray-700 mb-0.5">Anytown, USA 12345</div> */}
              <div className="text-gray-700   ">{data?.party?.emailID}</div>
              <div className="text-gray-700">{data?.party?.mobileNumber}</div>
            </div>
            <div className=" border-gray-300 pb-4 mb-0.5">
              <h2 className="text-xs font-bold mb-1">Ship To:</h2>
              <div className="text-gray-700 ">{data?.party?.partyName}</div>
              {data?.party?.shippingAddress
                ?.split(/[\n,]+/)
                .map((line, index) => (
                  <div key={index} className="text-gray-700 ">
                    {line.trim()}
                  </div>
                ))}{" "}
              {/* <div className="text-gray-700 mb-0.5">Anytown, USA 12345</div> */}
              <div className="text-gray-700 ">{data?.party?.emailID}</div>
              <div className="text-gray-700">{data?.party?.mobileNumber}</div>
            </div>
          </div>

          {/* <hr className="border-t-2 border-black mb-0.5" /> */}
          <table className="w-full text-left  bg-slate-200">
            <thead className="border-b-2 border-t-2 border-black text-[10px] text-right">
              <tr>
                <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                  Items
                </th>
                <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
                <th className="text-gray-700 font-bold uppercase p-2">Rate</th>
                <th className="text-gray-700 font-bold uppercase p-2">Disc</th>
                <th className="text-gray-700 font-bold uppercase p-2">Tax</th>
                <th className="text-gray-700 font-bold uppercase p-2 pr-0">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {data?.items?.length > 0 &&
                data?.items.map((el, index) => {
                  const discountAmount =
                    el?.discountPercentage > 0
                      ? (el.Priceleveles.find(
                          (item) => item?.pricelevel === data?.priceLevel
                        )?.pricerate *
                          el.discountPercentage) /
                        100
                      : el?.discount;
                  return (
                    <tr
                      key={index}
                      className="border-b-2 border-t-1 text-[9px] bg-white"
                    >
                      <td className="py-4 text-black pr-2">
                        {el.product_name} <br />
                        <p className="text-gray-400 mt-1">HSN: {el?.hsn_code} ({el.igst}%)</p>
                      </td>
                      <td className="py-4 text-black text-right pr-2">
                        {el?.count} {el?.unit}
                      </td>
                      <td className="py-4 text-black text-right pr-2 text-nowrap">
                        ₹{" "}
                        {
                          el.Priceleveles.find(
                            (item) => item?.pricelevel === data?.priceLevel
                          )?.pricerate
                        }
                      </td>
                      <td className="py-4 text-black text-right pr-2 ">
                        {discountAmount > 0
                          ? ` ₹${discountAmount?.toFixed(2)} `
                          : "₹ 0"}
                        {/* <br />
                        {el?.discountPercentage > 0 &&
                          `(${el?.discountPercentage}%)`} */}
                      </td>
                      <td className="py-4 text-black text-right pr-2">
                        {(
                          el?.total -
                          (el?.total * 100) / (parseFloat(el.igst) + 100)
                        )?.toFixed(2)}
                        {/* <br /> ({el?.igst}%) */}
                      </td>
                      <td className="py-4 text-black text-right">
                        ₹ {el?.total}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>

          <div className="flex justify-between  border-y-2 border-black py-2">
            <div className="text-gray-700 text-[10px] font-bold mr-2 uppercase">
              Subtotal:
            </div>
            <div className="text-black font-bold text-[10px]  ">
              ₹ {subTotal}
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="mt-3">
              <div className="text-gray-500 font-semibold text-[10px] leading-5">
                Bank Name: Dummy Bank
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-5">
                IFSC Code: DUMMY1234567
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-5">
                Account Number: 1234567890
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-5">
                Branch: Dummy Branch
              </div>
            </div>

            <div>
              <div className=" py-3 ">
                <div className="  flex justify-end ">
                  <div className="text-gray-700 mr-2 font-bold text-[10px] mb-1">
                    Add on charges:
                  </div>
                  <div className="text-gray-700 font-bold text-[10px]">
                    ₹ {additinalCharge}
                  </div>
                </div>
                {data?.additionalCharges?.map((el, index) => (
                  <div
                    key={index}
                    className="text-gray-700  text-right font-semibold text-[9px]  leading-5  "
                  >
                    {el?.option}: ₹ {el?.value}
                  </div>
                ))}
              </div>

              <div className="flex justify-end  border-black py-3 ">
                <div className="w-3/4"></div>

                <div className=" w-2/4 text-gray-700  font-bold text-[10px] flex justify-end   ">
                  <p className="text-nowrap border-y-2 py-2">TOTAL AMOUNT:</p>
                  <div className="text-gray-700  font-bold text-[10px] text-nowrap  border-y-2 py-2   ">
                    ₹ {data.finalAmount}
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-black pb-3 w-full ">
                <div className="w-2/4"></div>

                <div className="  text-gray-700  font-bold text-[10px] flex flex-col justify-end text-right   ">
                  <p className="text-nowrap ">Total Amount(in words)</p>
                  <div className="text-gray-700  font-bold text-[7.5px] text-nowrap uppercase mt-1 ">
                    ₹ {inWords}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-gray-300 mb-5 mt-4">
            <div className="text-gray-700 mb-2 font-bold text-[10px]">
              Terms and Conditions
            </div>
            <div className="text-gray-700 text-[9px] leading-5">
              <p>
                1. <strong>Payment Terms:</strong> Payment is due within 30 days
                of the invoice date. Late payment will result in a 5% late fee
                per month.
              </p>
              <p>
                2. <strong>Delivery:</strong> Delivery will be made within 10
                business days of receipt of payment. Delivery outside the
                specified area may incur additional charges.
              </p>
              <p>
                3. <strong>Returns and Refunds:</strong> Returns must be made
                within 30 days of delivery. Products must be returned in their
                original condition, with all packaging and accessories. Refunds
                will be processed within 14 days of receipt of the returned
                product.
              </p>
              <p>
                4. <strong>Warranty:</strong> All products come with a 1-year
                warranty. Warranty claims must be made within 30 days of
                purchase.
              </p>
              <p>
                5. <strong>Intellectual Property:</strong> All products and
                designs are the property of [Your Company Name]. Unauthorized
                use or reproduction of our products is strictly prohibited.
              </p>
              <p>
                6. <strong>Dispute Resolution:</strong> Any disputes arising
                from this agreement will be resolved through mediation. Failure
                to reach a resolution through mediation will result in the
                dispute being submitted to arbitration.
              </p>
              <p>
                7. <strong>Force Majeure:</strong> Neither party will be liable
                for any failure to perform its obligations under this agreement
                if such failure is due to events beyond the reasonable control
                of the party, including but not limited to acts of God, war,
                terrorism, civil unrest, or natural disaster.
              </p>
              <p>
                8. <strong>Governing Law:</strong> This agreement shall be
                governed by and construed in accordance with the laws of [Your
                Country].
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareInvoice;
