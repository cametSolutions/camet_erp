/* eslint-disable react/prop-types */
import QRCode from "react-qr-code";

function PdfFooter({bank,org,data,additinalCharge,inWords,selectedOrganization}) {
  return (
    <div>
          <div className="flex justify-between">
              <div className="mt-3 w-1/2">
                {bank && Object.keys(bank).length > 0 ? (
                  <>
                    <div className="text-gray-500 font-semibold text-[10px] leading-4">
                      Bank Name: {bank?.bank_name}
                    </div>
                    <div className="text-gray-500 font-semibold text-[10px] leading-4">
                      IFSC Code: {bank?.ifsc}
                    </div>
                    <div className="text-gray-500 font-semibold text-[10px] leading-4">
                      Account Number: {bank?.ac_no}
                    </div>
                    <div className="text-gray-500 font-semibold text-[10px] leading-4">
                      Branch: {bank?.branch}
                    </div>
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
                  </>
                ) : (
                  <div className="text-gray-500 font-semibold text-[10px] leading-5"></div>
                )}
              </div>
              <div className="w-1/2">
                <div className="py-3">
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
                <div className="flex justify-end border-black py-3">
                  <div className="w-3/4"></div>
                  <div className="w-2/4 text-gray-700 font-bold text-[10px] flex justify-end">
                    <p className="text-nowrap border-y-2 py-2">TOTAL AMOUNT :&nbsp;</p>
                    <div className="text-gray-700 font-bold text-[10px] text-nowrap border-y-2 py-2">
                    {` ${selectedOrganization.currency} ${data?.finalAmount}`}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end border-black pb-3 w-full">
                  <div className="w-2/4"></div>
                  <div className="text-gray-700 font-bold text-[10px] flex flex-col justify-end text-right mt-1">
                    <p className="text-nowrap">Total Amount(in words)</p>
                    <div className="text-gray-700 full font-bold text-[7.5px] text-nowrap uppercase mt-1">
                      <p className="whitespace-normal">  {inWords} {selectedOrganization.currencyName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {org && org.configurations?.length > 0 && (
              <div className="border-gray-300 mb-5 mt-4">
                <div className="text-gray-700 mb-1 font-bold text-[10px]">
                  Terms and Conditions
                </div>
                <div className="text-gray-700 text-[9px] leading-4">
                  {org?.configurations[0]?.terms?.map((el, index) => (
                    <p key={index}>
                      <span className="font-bold">{index + 1}.</span> {el}
                    </p>
                  ))}
                </div>
              </div>
            )}
    </div>
  )
}

export default PdfFooter