/* eslint-disable react/prop-types */
import { IoIosArrowDown } from "react-icons/io";

function SalesOrderProductDetails({
  data,
  items,
  additionalCharges,
  // tab = "sales",
}) {

  console.log(data.items);
  return (
    <div>
      <div className="p-4 bg-white mt-2 ">
        <div className="flex items-center justify-between">
          <p className="font-bold">Total Amount</p>
          <p className="font-bold">
            ₹ {parseInt(data?.finalAmount).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm ">
          <p className="font-semibold text-gray-500">Subtotal</p>
          <p className="font-semibold">
            ₹{" "}
            {parseInt(
              data?.items?.reduce((acc, curr) => acc + Number(curr?.total), 0) || 0
            ).toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2 text-sm">
          <p className="font-semibold text-gray-500">Additional Charge</p>
          <p className="font-semibold">
            ₹{" "}
            {parseInt(
              data?.additionalCharges?.reduce(
                (acc, curr) => acc + curr?.finalValue,
                0
              )
            ).toFixed(2)}
          </p>
        </div>
      </div>

      {items?.length > 0 && (
        <>
          <div>
            <div className="flex justify-between mt-2 bg-white p-3 px-4 w-full   ">
              <div className="flex  items-center gap-3 font-bold">
                <IoIosArrowDown className="font-bold" />
                <p>Items ({items.length})</p>
              </div>
            </div>
            {items.map((el, index) => (
              <>
                <div
                  key={index}
                  className="py-3 pb-5 mt-0 px-5 md:px-6 bg-white flex items-center gap-1.5 md:gap-4  "
                >
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-sm gap-10">
                      <div className="flex flex-col">
                        <p>{el?.product_name}</p>
                        <div className="flex gap-1 text-sm mt-2 font-normal">
                          <p className="text-nowrap ">Tax</p>
                          <p className="text-nowrap">({el?.igst} %)</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-nowrap text-end">
                          ₹ {el?.total ?? 0}
                        </p>
                        <div className="flex">
                          <p className="text-nowrap font-semibold mt-2 text-gray-500 text-end">
                            {el?.count} {el?.unit} X{" "}
                            {el?.selectedPriceRate || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end items-center mt-3 ">
                      <div className=" font-semibold text-gray-500 text-sm flex flex-col gap-2">
                        {(el?.discount > 0 || el?.discountPercentage > 0) && (
                          <div className="flex justify-between">
                            <p className="text-nowrap">Discount</p>
                            <div className="flex items-center ml-2">
                              <p className="text-nowrap">
                                {el.discount > 0
                                  ? `₹${el?.discount}`
                                  : `${el?.discountPercentage}%`}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="" />
              </>
            ))}
          </div>

          <div className=" flex gap-2 items-center font-bold text-md px-4 py-2 bg-white my-2">
            <IoIosArrowDown className="font-bold" />
            <p className=""> Additional Charges</p>
            <span>({additionalCharges?.length})</span>
          </div>
          <div className="p-4 bg-white text-gray-500 text-sm ">
            {additionalCharges?.map((values, index) => (
              <div key={index} className="mb-2">
                <div className="flex justify-between">
                  <p className="font-bold text-black">{values?.option}</p>
                  <p className="font-bold ">
                    {values?.value} + ({values?.taxPercentage}%)
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="mt-1">Total</p>
                  <p className="mt-1 text-black font-bold">
                    {" "}
                    ₹ {values?.finalValue}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SalesOrderProductDetails;
