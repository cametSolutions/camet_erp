/* eslint-disable react/prop-types */
import PdfHeader from "../pdfComponents/PdfHeader";
import PdfFooter from "../pdfComponents/PdfFooter";
import { useSelector } from "react-redux";

function SaleOrderPdf({
  data,
  org,
  contentToPrint,
  bank,
  inWords,
  subTotal,
  additinalCharge,
  userType,
  printTitle,
}) {
  const party = data?.party;
  const despatchDetails = data?.despatchDetails;

  const primarySelectedOrg = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg
  );
  const secondarySelectedOrg = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const selectedOrganization = 
  userType === "primaryUser" ? primarySelectedOrg : secondarySelectedOrg;

  const calculateTotalTax = () => {
    const individualTax = data?.items?.map(
      (el) => el?.total - (el?.total * 100) / (parseFloat(el.igst) + 100)
    );
    const totalTax = individualTax
      ?.reduce((acc, curr) => (acc += curr), 0)
      .toFixed(2);
    return totalTax;
  };

  const calculateTotalQunatity = () => {
    return data?.items?.reduce((acc, curr) => {
      // Ensure curr.count is a number, defaulting to 0 if not
      curr.count = Number(curr?.count) || 0;
      // Add curr.count to the accumulator
      return acc + curr?.count;
    }, 0);
  };


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

  return (
    <div>
      <div
        ref={contentToPrint}
        className="rounded-lg  px-3 max-w-3xl mx-auto  md:block"
      >
        <div className="flex ">
          <div className="font-bold text-sm md:text-xl mb-2 mt-6">
            {printTitle || "Quotation"}
          </div>
        </div>

        <PdfHeader
          data={data}
          org={org}
          address={address}
          despatchDetails={despatchDetails}
          tab={"salesOrder"}

        />

        {/* <hr className="border-t-2 border-black mb-0.5" /> */}
        <table className="w-full text-left  bg-slate-200">
          <thead className="border-b-2 border-t-2 border-black text-[10px] text-right">
            <tr>
              <th className="text-gray-700 font-bold uppercase py-2 px-1 text-left">
                No
              </th>
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
                const rate = el?.selectedPriceRate || 0;
                const taxAmt =
                  Number(
                    (
                      el?.total -
                      (el?.total * 100) / (parseFloat(el.igst) + 100)
                    )?.toFixed(2)
                  ) || 0;
                const count = el?.count || 0;
                const finalAmt = Number(el?.total) || 0;

                const discountAmount =
                  rate * count + taxAmt - Number(finalAmt) || 0;
                return (
                  <tr
                    key={index}
                    className="border-b-2 border-t-1 text-[9px] bg-white"
                  >
                    <td className="w-2  ">{index + 1}</td>

                    <td className="py-4 text-black pr-2">
                      {el.product_name} <br />
                      <p className="text-gray-400 mt-1">
                        HSN: {el?.hsn_code} ({el.igst}%)
                      </p>
                    </td>
                    <td className="py-4 text-black text-right pr-2">
                      {count} {el?.unit}
                    </td>
                    <td className="py-4 text-black text-right pr-2 text-nowrap">
                       {rate}
                    </td>
                    <td className="py-4 text-black text-right pr-2 ">
                      {discountAmount > 0
                        ? ` ${discountAmount?.toFixed(2)} `
                        : " 0"}
                      {/* <br />
                        {el?.discountPercentage > 0 &&
                          `(${el?.discountPercentage}%)`} */}
                    </td>
                    <td className="py-4 text-black text-right pr-2">
                      {taxAmt}
                    </td>
                    <td className="py-4 text-black text-right"> {finalAmt}</td>
                  </tr>
                );
              })}
          </tbody>

          <tfoot className="">
            <tr className="bg-white border-y-2 ">
              <td className="font-bold"></td>
              <td className="font-bold text-[9px] p-2">Subtotal</td>
              <td className="text-black text-[9px] ">
                <p className="text-right pr-1 font-bold">
                  {calculateTotalQunatity()}/unit
                </p>{" "}
              </td>
              <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
              <td className="text-right pr-1 text-black font-bold text-[9px]"></td>
              <td className="text-right pr-1 text-black font-bold text-[9px]">
                 {calculateTotalTax()}
              </td>
              <td className="text-right pr-1 text-black font-bold text-[9px]">
                 {subTotal}
              </td>
            </tr>
          </tfoot>
        </table>
        

        <PdfFooter
              bank={bank}
              org={org}
              data={data}
              additinalCharge={additinalCharge}
              inWords={inWords}
              selectedOrganization={selectedOrganization}
            />
      </div>
    </div>
  );
}

export default SaleOrderPdf;
