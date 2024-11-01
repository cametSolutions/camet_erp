/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import numberToWords from "number-to-words";

function SalesThreeInchPdf({
  contentToPrint,
  data,
  org,
  // subTotal,
  // additinalCharge,
  // inWords,
  userType,
  printTitle,
  voucherNumber,
  tab,
}) {
  const [subTotal, setSubTotal] = useState("");
  const [additinalCharge, setAdditinalCharge] = useState("");
  const [inWords, setInWords] = useState("");

  let title = "";
  let pdfNumber;

  switch (tab) {
    case "sales":
      title = "Tax Invoice";
      pdfNumber = data?.salesNumber;

      break;
    case "vanSale":
      title = "Tax Invoice";
      pdfNumber = data?.salesNumber;

      break;

    case "purchase":
      title = "Purchase Invoice";
      pdfNumber = data?.purchaseNumber;

      break;

    case "stockTransfer":
      title = "Stock Transfer";
      pdfNumber = data?.stockTransferNumber;

      break;

    default:
      title = "Tax Invoice";
      pdfNumber = "";

      break;
  }

  //used to fetch organization data form redux
  const primarySelectedOrg = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  const secondarySelectedOrg = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const selectedOrganization =
    userType === "primaryUser" ? primarySelectedOrg : secondarySelectedOrg;

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

      const [integerPart, decimalPart] = finalAmount.toString().split(".");
      const integerWords = numberToWords.toWords(parseInt(integerPart, 10));
      console.log(integerWords);
      const decimalWords = decimalPart
        ? ` and ${numberToWords.toWords(parseInt(decimalPart, 10))} `
        : " and Zero";
      console.log(decimalWords);

      const mergedWord = [
        ...(integerWords + " "),
        (selectedOrganization?.currencyName ?? "") + " ",
        ...decimalWords,
        (selectedOrganization?.subunit ?? "") + " ",
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

  const party = data?.party;
  let address;

  if (
    party?.newBillToShipTo &&
    Object.keys(party?.newBillToShipTo).length > 0
  ) {
    address = party?.newBillToShipTo;
  } else {
    if (party) {
      const {
        partyName,
        mobileNumber,
        emailID,
        gstNo,
        state_reference,
        billingAddress,
        shippingAddress,
        pincode,
      } = party;

      address = {
        billToName: partyName,
        billToAddress: billingAddress,
        billToPin: pincode,
        billToGst: gstNo,
        billToMobile: mobileNumber,
        billToEmail: emailID,
        billToSupply: state_reference,
        shipToName: partyName,
        shipToAddress: shippingAddress,
        shipToPin: pincode,
        shipToGst: gstNo,
        shipToMobile: mobileNumber,
        shipToEmail: emailID,
        shipToSupply: state_reference,
      };
    }
  }

  // console.log(address);
  return (
    <div
      ref={contentToPrint}
      style={{ width: "80mm", height: "auto" }}
      className="  rounded-lg   flex justify-center px-2.5 "
    >
      <div className=" print-container  max-w-3xl mx-auto  md:block w-full ">
        <div className="flex justify-center ">
          <div className="font-bold text-md  mt-6">{printTitle || title}</div>
        </div>
        <div>
          <div className="flex items-center justify-between flex-col leading-4   font-bold">
            <div className="text-[12px]  tracking-wide ">
              No: {voucherNumber || pdfNumber}{" "}
            </div>
            <div className="text-[12px] tracking-wide">
              Date:{new Date().toDateString()}{" "}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className=" flex flex-col  items-center">
            <div className=" flex justify-center ">
              <p className="text-black font-extrabold text-[15px] pb-1 text-center">
                {org?.name}
              </p>
            </div>
            <div className=" flex flex-col items-center leading-4 ">
              <div className="text-black  text-[12px] font-semibold text-center">
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
              <div className="text-black font-semibold   text-[12px] ">
                {org?.email}
              </div>

              {org?.website && (
                <div className="text-black font-semibold  text-[12px]">
                  Website: {org?.website}
                </div>
              )}

              {org?.gstNum && (
                <div className="text-black font-semibold  text-[12px]">
                  Tax No: {org?.gstNum}
                </div>
              )}

              {org?.pan && (
                <div className="text-black font-semibold   text-[12px]">
                  Pan No: {org?.pan}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* </div> */}

        <div className="leading-4">
          <p className="text-black   text-[13px] font-bold mt-6 tracking-wider">
            Name: {data?.party?.partyName}
          </p>
          <p className="text-black text-[12px] font-semibold">
            {[address?.billToAddress]
              .filter((item) => item != null && item !== "" && item !== "null")
              .join(", ") || ""}
          </p>
        </div>

        {/* <hr className="border-t-2 border-black mb-0.5" /> */}
        <table className="w-full text-left     mt-2 tracking-wider ">
          <thead className="border-b border-t-2 border-black text-[10px] text-right ">
            <tr>
              <th className="text-black font-bold uppercase  px-1 text-left">
                Items
              </th>
              <th className="text-black font-bold uppercase text-center p-2">
                Qty
              </th>
              <th className="text-black font-bold uppercase text-center p-2">
                Rate
              </th>
              {/* <th className="text-black font-bold uppercase p-2">Disc</th> */}
              {/* <th className="text-black font-bold uppercase p-2">Tax</th> */}
              <th className="text-black font-bold uppercase p-2 pr-0">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.items?.length > 0 &&
              data?.items.map((el, index) => {
                const total = el?.total || 0;
                // console.log("total", total);
                const count = el?.count || 0;
                // console.log("count", count);
                const rate = (total / count).toFixed(2) || 0;

                return (
                  <tr
                    key={index}
                    className="border-b  border-gray-500 border-t-2 text-[10px] bg-white  text-center  "
                  >
                    <td className="py-1 text-black  font-bold  pr-2 flex ">
                      {el.product_name} <br />
                      <p className="text-black ">({el.igst}%)</p>
                    </td>
                    <td className="py-1 text-black  font-bold text-right pr-2">
                      {el?.count}
                      <p className="text-[10px] font-semibold">{el?.unit}</p>
                    </td>
                    <td className="py-1 text-black font-bold  text-right pl-2 pr-1 text-nowrap">
                      {rate || 0}
                    </td>

                    <td className="py-1 text-black  font-bold text-right">
                      {el?.total}
                    </td>
                  </tr>
                );
              })}
            <tr className=" border-y-2 border-t-2 border-gray-500  font-bold  text-[12px] bg-white">
              <td className="py-1 text-black ">Total</td>
              <td className=" col-span-2 py-1 text-black text-center">
                {" "}
                {data?.items?.reduce(
                  (acc, curr) => (acc += Number(curr?.count)),
                  0
                )}
              </td>
              <td className="py-1 text-black "></td>
              <td className="py-1 text-black text-right "> {subTotal}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          {/* <div className="mt-3 w-1/2 ">
            {bank && Object.keys(bank).length > 0 ? (
              <>
          
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
              <div className="text-black font-semibold text-[10px] leading-5"></div>
            )}
          </div> */}

          <div className=" mt-1  ">
            <div className="  flex flex-col items-end ">
              {selectedOrganization?.country === "India" ? (
                <div className="flex flex-col items-end text-[12px] text-black font-bold gap-1">
                  <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                    CGST : {(calculateTotalTax() / 2).toFixed(2)}
                  </p>
                  <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                    SGST : {(calculateTotalTax() / 2).toFixed(2)}
                  </p>

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
              ) : (
                <div className="flex flex-col items-end text-[12px] text-black font-bold gap-1">
                  <p className={calculateTotalTax() > 0 ? "" : "hidden"}>
                    VAT : {Number(calculateTotalTax()).toFixed(2)}
                  </p>
                </div>
              )}

              {additinalCharge > 0 && (
                <div className="flex items-center mt-1 mb-1">
                  <div className="text-black mr-2 font-bold text-[12px] ">
                    Add on charges:
                  </div>
                  <div className="text-black font-bold text-[12px]">
                    {additinalCharge}
                  </div>
                </div>
              )}
            </div>
            {data?.additionalCharges?.map((el, index) => (
              <>
                <div
                  key={index}
                  className="text-black  text-right font-semibold text-[12px] "
                >
                  <span>({el?.action === "add" ? "+" : "-"})</span> {el?.option}
                  : ₹ {el?.finalValue}
                </div>
                {el?.taxPercentage && (
                  <div className="text-black  text-right font-semibold text-[8px] mb-2">
                    ( {el?.value} + {el?.taxPercentage}% )
                  </div>
                )}
              </>
            ))}

            <div className="flex justify-end  border-black  ">
              <div className="w-3/4"></div>

              <div className="  text-black  font-extrabold text-[11px] flex justify-end   ">
                <p className="text-nowrap border-y-2 py-1">
                  NET AMOUNT :&nbsp;{" "}
                </p>
                <div className="text-black  font-bold text-[11px] text-nowrap  border-y-2 py-1    ">
                  {selectedOrganization?.currency} {data?.finalAmount}
                </div>
              </div>
            </div>
            <div className="flex  justify-end border-black pb-3 w-full ">
              <div className="w-2/4"></div>

              <div className="text-black font-bold text-[12px] flex flex-col justify-end text-right mt-1">
                <p className="text-nowrap">Total Amount (in words)</p>
                <div className="text-black full font-bold text-[9px] text-nowrap uppercase mt-1   ">
                  <p className="whitespace-normal -">{inWords} </p>
                </div>
              </div>
            </div>
            {/* <div className="flex flex-col items-end mb-4">
          <p className="text-black text-[7.5px] ">
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

        {/* <div className="mt-3  flex justify-center ">
            {bank && Object.keys(bank).length > 0 ? (
              <>
          
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
              <div className="text-black font-semibold text-[10px] leading-5"></div>
            )}
          </div> */}

        {/* {org && org.configurations?.length > 0 && (
      <div className="border-gray-300 mb-5 mt-4">
        <div className="text-black mb-2 font-bold text-[10px]">
          Terms and Conditions
        </div>
        <div className="text-black text-[9px] leading-5">
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
  );
}

export default SalesThreeInchPdf;
