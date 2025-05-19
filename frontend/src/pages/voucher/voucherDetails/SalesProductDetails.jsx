/* eslint-disable react/prop-types */
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useState } from "react";

function SalesProductDetails({
  data,
  items = [],
  additionalCharges = [],
  paymentSplittingData = {},
}) {
  const [showItems, setShowItems] = useState(true);
  const [showCharges, setShowCharges] = useState(true);

  const subtotal = parseInt(
    data?.items?.reduce((acc, curr) => acc + curr?.total, 0) || 0
  ).toFixed(2);
  const additionalChargesTotal = parseInt(
    additionalCharges?.reduce((acc, curr) => acc + curr?.finalValue, 0) || 0
  ).toFixed(2);

  const getDiscountValue = (godown) => {
    const { discountType, discountAmount, discountPercentage } = godown;

    if (discountType === "amount") {
      return `₹ ${discountAmount}` || "0";
    } else {
      return `${discountPercentage} %` || "0 %";
    }
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm w-full max-w-full pb-5">
      {/* Summary Card */}

      {data?.voucherType !== "stockTransfer" && (
        <div className="p-3 sm:p-4 bg-white border-b">
          <h3 className="text-sm font-bold mb-3">Summary</h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-medium">₹ {subtotal}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-600">Additional Charges</p>
              <p className="font-medium">
                ₹ {additionalChargesTotal > 0 ? additionalChargesTotal : "0.00"}
              </p>
            </div>

            {paymentSplittingData?.totalSettledAmount && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Payment Received</p>
                <p className="font-medium">
                  ₹ {paymentSplittingData?.totalSettledAmount}
                </p>
              </div>
            )}

            {paymentSplittingData?.balanceAmount && (
              <div className="flex items-center justify-between">
                <p className="text-gray-600">Balance Amount</p>
                <p className="font-medium text-orange-600">
                  ₹ {paymentSplittingData?.balanceAmount}
                </p>
              </div>
            )}

            <div className="pt-2 mt-1 border-t border-gray-100">
              <div className="flex items-center justify-between font-bold">
                <p>Total Amount</p>
                <p className="text-sm sm:text-base">
                  ₹ {parseInt(data?.finalAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Section */}
      {items.length > 0 && (
        <div className="mt-2 bg-white rounded-lg overflow-hidden shadow-sm">
          <div
            className="flex justify-between p-2 sm:p-3 bg-gray-50 cursor-pointer"
            onClick={() => setShowItems(!showItems)}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-800">
              {showItems ? (
                <IoIosArrowUp size={14} />
              ) : (
                <IoIosArrowDown size={14} />
              )}
              <h3>Items ({items.length})</h3>
            </div>
          </div>

          {showItems && (
            <div className="divide-y divide-gray-100">
              {items.map((item, index) => (
                <div key={index} className="p-2 sm:p-3">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-medium text-xs">
                      {item?.product_name}
                    </h4>
                    <p className="font-medium text-xs">₹ {item.total ?? 0}</p>
                  </div>

                  <div className="text-xs text-gray-500">
                    <div className="flex justify-between mb-1">
                      <div className="flex gap-1">
                        <span>Tax</span>
                        <span>({item.igst}%)</span>
                      </div>
                      {!item?.hasGodownOrBatch && (
                        <div className="text-right">
                          {item?.GodownList?.[0]?.count} {item.unit} × ₹
                          {item?.GodownList?.[0]?.selectedPriceRate || 0}
                        </div>
                      )}
                    </div>

                    {item.hasGodownOrBatch ? (
                      <div className="mt-1 space-y-2">
                        {item.GodownList.filter((g) => g.added).map(
                          (godownOrBatch, idx) => (
                            <div
                              key={idx}
                              className="pl-2 border-l-2 border-violet-200"
                            >
                              {godownOrBatch.batch && (
                                <div className="flex flex-wrap justify-between mb-1">
                                  <p className="text-violet-600 font-medium">
                                    Batch: {godownOrBatch.batch}
                                  </p>
                                  <p className="w-full sm:w-auto text-right sm:text-left">
                                    {godownOrBatch.count} {item.unit} × ₹
                                    {godownOrBatch?.selectedPriceRate || 0}
                                  </p>
                                </div>
                              )}

                              {godownOrBatch.godown && (
                                <div className="flex flex-wrap justify-between mb-1">
                                  <p className="text-violet-600 font-medium">
                                    Godown: {godownOrBatch?.godown}
                                  </p>

                                  {!godownOrBatch.batch && (
                                    <p className="w-full sm:w-auto text-right sm:text-left">
                                      {godownOrBatch.count} {item.unit} × ₹
                                      {godownOrBatch?.selectedPriceRate || 0}
                                    </p>
                                  )}
                                </div>
                              )}

                              {(godownOrBatch.discount > 0 ||
                                godownOrBatch.discountPercentage > 0) && (
                                <div className="flex justify-between mb-1">
                                  <p>Discount</p>
                                  <p>{getDiscountValue(godownOrBatch)}</p>
                                </div>
                              )}

                              <div className="flex justify-between pt-1 font-medium">
                                <p>Total</p>
                                <p>₹ {godownOrBatch.individualTotal ?? 0}</p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      (item?.GodownList[0]?.discount > 0 ||
                        item?.GodownList[0]?.discountPercentage > 0) && (
                        <div className="flex justify-between">
                          <p>Discount</p>
                          <p>{getDiscountValue(item.GodownList[0])}</p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Additional Charges Section */}
      {additionalCharges?.length > 0 && (
        <div className="mt-2 bg-white rounded-lg overflow-hidden shadow-sm">
          <div
            className="flex justify-between p-2 sm:p-3 bg-gray-50 cursor-pointer"
            onClick={() => setShowCharges(!showCharges)}
          >
            <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-800">
              {showCharges ? (
                <IoIosArrowUp size={14} />
              ) : (
                <IoIosArrowDown size={14} />
              )}
              <h3>Additional Charges ({additionalCharges.length})</h3>
            </div>
          </div>

          {showCharges && (
            <div className="p-2 sm:p-3 divide-y divide-gray-100">
              {additionalCharges.map((charge, index) => (
                <div key={index} className="py-2 first:pt-0 last:pb-0">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium text-xs">{charge.option}</p>
                    <p className="text-xs">
                      ₹{charge.value} + ({charge.taxPercentage}%)
                    </p>
                  </div>
                  <div className="flex justify-between text-xs">
                    <p className="text-gray-500">Total</p>
                    <p className="font-medium">₹ {charge.finalValue}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SalesProductDetails;
