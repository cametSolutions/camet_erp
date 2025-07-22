/* eslint-disable react/prop-types */
// import QRCode from "react-qr-code";
import useFetch from "@/customHook/useFetch";
import TaxTable from "../../../../components/common/table/TaxTable";
import { useEffect } from "react";
import { useState } from "react";
import QRCode from "react-qr-code";

function VoucherPdfFooter({
  bank,
  org,
  data,
  additinalCharge,
  inWords,
  selectedOrganization,
  calculateTotalTax = () => {},
  configurations,
  party,
  configVoucherType,
}) {
  const [selectedBank, setSelectedBank] = useState({});
  const termsAndConditions = org?.configurations?.[0]?.termsAndConditions?.find(
    (el) => el?.voucher === configVoucherType
  )?.terms;

  const { data: bankData } = useFetch(`/api/sUsers/fetchBanks/${org?._id}`);

  useEffect(() => {
    if (bankData) {
      setSelectedBank(bankData?.data?.find((bankApi) => bankApi?._id === bank));
    }
  }, [bankData, bank]);

  // Generate proper UPI payment URL
  const generateUPIQRValue = () => {
    if (!selectedBank?.upi_id || !data?.finalAmount) {
      return ""; // Return empty if required data is missing
    }

    const amount = parseFloat(data.finalAmount);
    if (isNaN(amount) || amount <= 0) {
      return ""; // Invalid amount
    }

    // Proper UPI payment URL format
    const upiUrl = new URL('upi://pay');
    upiUrl.searchParams.append('pa', selectedBank.upi_id); // Payee Address
    upiUrl.searchParams.append('am', amount.toFixed(2)); // Amount (2 decimal places)
    
    // Optional parameters you might want to add
    if (org?.name) {
      upiUrl.searchParams.append('pn', org.name); // Payee Name
    }
    
    if (data?.voucherNumber) {
      upiUrl.searchParams.append('tn', `Invoice: ${data.voucherNumber}`); // Transaction Note
    }
    
    upiUrl.searchParams.append('cu', 'INR'); // Currency
    
    return upiUrl.toString();
  };

  const qrValue = generateUPIQRValue();
 // Debug log

  return (
    <div className="mb-5">
      {/*  tax table and total */}
      <div className="flex justify-between items-start mt-3 ">
        {/* Left Div: Tax Table */}

        {configurations?.showTaxAnalysis ? (
          <TaxTable products={data?.items} org={org} party={party} />
        ) : (
          <div></div>
        )}

        {/* Right Div */}
        <div className="w-1/2">
          {additinalCharge > 0 && (
            <div className="">
              <div className="flex justify-end">
                <div className="text-gray-700 mr-2 font-bold text-[10px] mb-1">
                  Add on charges:
                </div>
                <div className="text-gray-700 font-bold text-[10px]">
                  {additinalCharge}
                </div>
              </div>
              {data?.additionalCharges?.map((el, index) => (
                <>
                  <div
                    key={index}
                    className="text-gray-700 text-right font-semibold text-[10px]"
                  >
                    <span>({el?.action === "add" ? "+" : "-"})</span>{" "}
                    {el?.option}: ₹ {el?.finalValue}
                  </div>
                  {el?.taxPercentage && (
                    <div className="text-gray-700 text-right font-semibold text-[8px] mb-2">
                      ({el?.value} + {el?.taxPercentage}%)
                    </div>
                  )}
                </>
              ))}
            </div>
          )}

          {configurations?.showTaxAmount &&
            (() => {
              const totalTax = Number(calculateTotalTax()) || 0; // Validate total tax
              const isSameState = org?.state === party?.state || !party?.state;

              return isSameState ? (
                <div className="flex flex-col items-end text-[9px] text-black font-bold gap-1 mt-3">
                  {totalTax > 0 && (
                    <>
                      <p>CGST : {(totalTax / 2).toFixed(2)}</p>
                      <p>SGST : {(totalTax / 2).toFixed(2)}</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-end text-[9px] text-black font-bold gap-1 mt-3">
                  {totalTax > 0 && <p>IGST : {totalTax.toFixed(2)}</p>}
                </div>
              );
            })()}

          <div className="flex justify-end border-black py-3">
            <div className="w-3/4"></div>
            {configurations?.showNetAmount && (
              <div className="w-2/4 text-gray-700 font-bold text-[10px] flex justify-end">
                <p className="text-nowrap border-y-2 py-2">Net Amt :&nbsp;</p>
                <div className="text-gray-700 font-bold text-[10px] text-nowrap border-y-2 py-2">
                  {` ${selectedOrganization?.currency ?? ""} ${
                    data?.finalAmount
                  }`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* <hr /> */}

      {/* in words */}

      {configurations?.showNetAmount && (
        <div className="flex justify-start py-2 w-full gap-3 items-start  mt-2 border-y border-gray-100">
          <p className="text-nowrap font-bold text-[10px]">
            Net Amount(in words) :
          </p>
          <div className="text-gray-700 full font-semibold text-[10px] text-nowrap uppercase ">
            <p className="whitespace-normal"> {inWords} </p>
          </div>
        </div>
      )}
      {/* bank details */}
      <div className="flex justify-between my-1 ">
        <div className=" w-1/2">
          {configurations?.showBankDetails &&
          bank &&
          Object?.keys(selectedBank)?.length > 0 ? (
            <>
              <div className="text-gray-500 font-semibold text-[10px] ">
                Bank Name: {selectedBank?.bank_name}
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-4">
                IFSC Code: {selectedBank?.ifsc}
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-4">
                Account Number: {selectedBank?.ac_no}
              </div>
              <div className="text-gray-500 font-semibold text-[10px] leading-4">
                Branch: {selectedBank?.branch}
              </div>
              
              {/* Fixed QR Code Section */}
              {selectedBank?.upi_id && qrValue && (
                <div
                  style={{
                    height: "auto",
                    margin: "0",
                    marginTop: "10px",
                    maxWidth: 64,
                    width: "100%",
                  }}
                >
                  <QRCode
                    size={256} // Fixed size for better scanning
                    style={{
                      height: "auto",
                      maxWidth: "100%",
                      width: "100%",
                    }}
                    value={qrValue}
                    viewBox="0 0 256 256"
                    level="M" // Error correction level (L, M, Q, H)
                  />
          
                </div>
              )}
            </>
          ) : (
            <div className="text-gray-500 font-semibold text-[10px] leading-5"></div>
          )}
        </div>{" "}
        <div className="flex flex-col justify-between text-[10px] font-semibold text-right">
          <p className="mb-8">{org?.name}</p>
          <p>Authorized Signatory</p>
        </div>
      </div>

      <hr />

      {/* terms and conditions */}
      {configurations?.showTeamsAndConditions &&
        termsAndConditions?.length > 0 && (
          <div className="border-gray-300 mb-5 mt-2">
            <div className="text-gray-700 mb-1 font-bold text-[10px]">
              Terms and Conditions
            </div>
            <div className="text-gray-700 text-[9px] leading-4">
              {termsAndConditions?.map((term, index) => (
                <p key={index}>
                  <span className="font-bold">{index + 1}.</span> {term}
                </p>
                ))}
            </div>
          </div>
        )}
    </div>
  );
}

export default VoucherPdfFooter;