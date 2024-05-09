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
import QRCode from "react-qr-code";
import SidebarSec from "../../components/secUsers/SidebarSec";


function ThreeInchInvoiceSec() {
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

  const calculateTotalTax = () => {
    const individualTax = data?.items?.map(
      (el) => el?.total - (el?.total * 100) / (parseFloat(el.igst) + 100)
    );
    const totalTax = individualTax
      ?.reduce((acc, curr) => (acc += curr), 0)
      .toFixed(2);

    console.log(individualTax);
    console.log(totalTax);
    return totalTax;
  };

  const calculateAddCess = () => {
    return data?.items?.reduce((acc, curr) => {
      // Ensure curr.cess is a number, defaulting to 0 if not
      curr.addl_cess = Number(curr?.addl_cess) || 0;
      // Add curr.cess to the accumulator
      return acc + curr?.addl_cess;
    }, 0); // Initialize the accumulator with 0
  };
  const calculateStateTax = () => {
    return data?.items?.reduce((acc, curr) => {
      // Ensure curr.cess is a number, defaulting to 0 if not
      curr.state_cess = Number(curr?.state_cess) || 0;
      // Add curr.cess to the accumulator?
      return acc + curr?.state_cess;
    }, 0); // Initialize the accumulator with 0
  };
  const calculateCess = () => {
    return data?.items?.reduce((acc, curr) => {
      // Ensure curr.cess is a number, defaulting to 0 if not
      curr.cess = Number(curr?.cess) || 0;
      // Add curr.cess to the accumulator
      return acc + curr?.cess;
    }, 0); // Initialize the accumulator with 0
  };

  const handlePrint = useReactToPrint({
    documentTitle: `Sale Order ${data.orderNumber}`,
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  return (
    <div className="flex">
      <div className="">
        <SidebarSec />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#012a4a]   sticky top-0 p-3 px-5 text-white text-lg font-bold flex items-center gap-3  shadow-lg justify-between">
          <div className="flex gap-2 ">
            <Link to={`/sUsers/InvoiceDetails/${id}`}>
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
          className="rounded-lg  px-3 max-w-3xl mx-auto  md:block w-[18rem]"
        >
          <div className="flex justify-center ">
            <div className="font-bold text-md  mb-2 mt-6">INVOICE</div>
          </div>
          <div>
            <div className="bg-gray-500 h-2 w-full mt-1"></div>
            <div className="flex items-center justify-between  bg-gray-300 px-3 py-1 ">
              <div className="text-[7px] ">Invoice #:{data?.orderNumber} </div>
              <div className="text-[7px]">
                Date:{new Date().toDateString()}{" "}
              </div>
            </div>
          </div>

          {/* <div className="flex mt-2 border-t-2 py-3"> */}
          {/* <div className="w-0.5/5">
              {org.logo && (
                <img
                  className="h-16 w-16 mr-2 mt-1 "
                  src={org.logo}
                  alt="Logo"
                />
              )}
            </div> */}
          <div className="flex justify-center">
            <div className="w-4/5 flex flex-col mt-1 ml-2">
              <div className=" flex justify-center">
                <p className="text-gray-700 font-semibold text-[12px] pb-1">
                  {org?.name}
                </p>
              </div>
              <div className=" flex flex-col items-center ">
                <div className="text-gray-500  text-[7px] text-center">
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
                <div className="text-gray-500   text-[7px] ">{org?.email}</div>
                <div className="text-gray-500  text-[7px] ">{org?.website}</div>
                <div className="text-gray-500  text-[7px]">
                  Gst No: {org?.gstNum}
                </div>
                <div className="text-gray-500   text-[7px]">
                  Pan No: {org?.pan}
                </div>
              </div>
            </div>
          </div>
          {/* </div> */}

          <div className="">
            <p className="text-gray-500  mt-3 text-[7.5px]">
              Name: {data?.party?.partyName}
            </p>
          </div>

          {/* <hr className="border-t-2 border-black mb-0.5" /> */}
          <table className="w-full text-left  bg-slate-200  mt-1 ">
            <thead className="border-b-2 border-t-2 border-black text-[10px] text-right">
              <tr>
                <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                  Items
                </th>
                <th className="text-gray-700 font-bold uppercase p-2">Qty</th>
                <th className="text-gray-700 font-bold uppercase p-2">Rate</th>
                {/* <th className="text-gray-700 font-bold uppercase p-2">Disc</th> */}
                {/* <th className="text-gray-700 font-bold uppercase p-2">Tax</th> */}
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
                      <td className="py-2 text-black pr-2">
                        {el.product_name} <br />
                        <p className="text-gray-400 mt-1">
                          HSN: {el?.hsn_code} ({el.igst}%)
                        </p>
                      </td>
                      <td className="py-2 text-black text-right pr-2">
                        {el?.count} {el?.unit}
                      </td>
                      <td className="py-2 text-black text-right pr-2 text-nowrap">
                        ₹{" "}
                        {
                          el.Priceleveles.find(
                            (item) => item?.pricelevel === data?.priceLevel
                          )?.pricerate
                        }
                      </td>

                      <td className="py-4 text-black text-right">
                        ₹ {el?.total}
                      </td>
                    </tr>
                  );
                })}
              <tr className=" border-y-4 border-t-4 border-gray-500  text-[9px] bg-white">
                <td className="py-1 text-black ">Total</td>
                <td className=" col-span-2 py-1 text-black text-center">
                  {" "}
                  {data?.items?.reduce(
                    (acc, curr) => (acc += Number(curr?.count)),
                    0
                  )}
                </td>
                <td className="py-1 text-black "></td>
                <td className="py-1 text-black text-right "> ₹ {subTotal}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="mt-3 w-1/2 ">
              {bank && Object.keys(bank).length > 0 ? (
                <>
                  {/* <div className="text-gray-500 font-semibold text-[10px] leading-5">
                    Bank Name: {bank?.bank_name}
                  </div>
                  <div className="text-gray-500 font-semibold text-[10px] leading-5">
                    IFSC Code: {bank?.ifsc}
                  </div>
                  <div className="text-gray-500 font-semibold text-[10px] leading-5">
                    Account Number: {bank?.ac_no}
                  </div>
                  <div className="text-gray-500 font-semibold text-[10px] leading-5">
                    Branch: {bank?.branch}
                  </div> */}
                  <div
                    style={{
                      height: "auto",
                      margin: "0 ",
                      marginTop: "10px",
                      maxWidth: 90,
                      width: "100%",
                    }}
                  >
                    <QRCode
                      size={300}
                      style={{
                        height: "auto",
                        maxWidth: "100%",
                        width: "100%",
                      }}
                      value={`upi://pay?pa=${bank?.upi_id}&am=${data?.finalAmount}`}
                      viewBox={`0 0 256 256`}
                    />
                  </div>
                </>
              ) : (
                <div className="text-gray-500 font-semibold text-[10px] leading-5"></div>
              )}
            </div>

            <div className="w-1/2">
              <div className=" mt-3  ">
                <div className="  flex flex-col items-end ">
                  <div className="flex flex-col items-end text-[7px] text-gray-700 font-bold gap-1">
                    <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                      CGST : {(calculateTotalTax() / 2).toFixed(2)}
                    </p>
                    <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                      SGST : {(calculateTotalTax() / 2).toFixed(2)}
                    </p>
                    {/* <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                      IGST : {calculateTotalTax()}
                    </p> */}
                    <p className={calculateCess() > 0 ? "" : "hidden"}>
                      CESS : {calculateCess()}
                    </p>
                    <p className={calculateAddCess() > 0 ? "" : "hidden"}>
                      ADD.CESS : {calculateAddCess()}
                    </p>
                    <p className={calculateStateTax() > 0 ? "" : "hidden"}>
                      STATE TAX : {calculateStateTax()}
                    </p>
                  </div>

                  <div className="flex items-center mt-2 mb-1">
                    <div className="text-gray-700 mr-2 font-semibold text-[9px]">
                      Add on charges:
                    </div>
                    <div className="text-gray-700 font-semibold text-[9px]">
                      ₹ {additinalCharge}
                    </div>
                  </div>
                </div>
                {data?.additionalCharges?.map((el, index) => (
                  <>
                    <div
                      key={index}
                      className="text-gray-700  text-right font-semibold text-[7px] "
                    >
                      <span>({el?.action === "add" ? "+" : "-"})</span>{" "}
                      {el?.option}: ₹ {el?.finalValue}
                    </div>
                    {el?.taxPercentage && (
                      <div className="text-gray-700  text-right font-semibold text-[8px] mb-2">
                        ( {el?.value} + {el?.taxPercentage}% )
                      </div>
                    )}
                  </>
                ))}
              </div>

              <div className="flex justify-end  border-black  ">
                <div className="w-3/4"></div>

                <div className=" w-2/4 text-gray-700  font-extrabold text-[11px] flex justify-end   ">
                  <p className="text-nowrap border-y-2 py-2">NET AMOUNT : </p>
                  <div className="text-gray-700  font-bold text-[11px] text-nowrap  border-y-2 py-2    ">
                    ₹ {data?.finalAmount}
                  </div>
                </div>
              </div>
              <div className="flex  justify-end border-black pb-3 w-full ">
                <div className="w-2/4"></div>

                <div className="  text-gray-700  font-bold text-[10px] flex flex-col justify-end text-right mt-3  ">
                  <p className="text-nowrap ">Total Amount(in words)</p>
                  <div className="text-gray-700  font-bold text-[7.5px] text-nowrap uppercase mt-1 ">
                    ₹ {inWords}
                  </div>
                </div>
              </div>
              {/* <div className="flex flex-col items-end mb-4">
                <p className="text-gray-700 text-[7.5px] ">
                  Scan here for payment
                </p>
                <div
                  style={{
                    height: "auto",
                    margin: "0 ",
                    marginTop: "2px",
                    maxWidth: 64,
                    width: "100%",
                  }}
                >
                  <QRCode
                    size={250}
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    value={`upi://pay?pa=${bank?.upi_id}&am=${data?.finalAmount}`}
                    viewBox={`0 0 256 256`}
                  />
                </div>
              </div> */}
            </div>
          </div>

          {/* {org && org.configurations?.length > 0 && (
            <div className="border-gray-300 mb-5 mt-4">
              <div className="text-gray-700 mb-2 font-bold text-[10px]">
                Terms and Conditions
              </div>
              <div className="text-gray-700 text-[9px] leading-5">
                {org?.configurations[0]?.terms?.map((el, index) => (
                  <p key={index}>
                    {" "}
                    <span className="font-bold">{index + 1}.</span> {el}
                  </p>
                ))}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

export default ThreeInchInvoiceSec;
