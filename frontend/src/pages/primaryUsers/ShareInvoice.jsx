import { useRef, useEffect, useState } from "react";
import { useReactToPrint } from "react-to-print";
import Sidebar from "../../components/homePage/Sidebar";
import { IoIosArrowRoundBack } from "react-icons/io";
import api from "../../api/api";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function ShareInvoice() {
  const [data, setData] = useState([]);
  const [org, setOrg] = useState([]);
  const { id } = useParams();

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Print This Document",
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

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

  console.log(data);
  console.log(org);

  const sum = data?.additionalCharges
    ?.reduce((acc, curr) => acc + parseFloat(curr?.value || 0), 0)
    ?.toFixed(2);

  console.log(sum);
  return (
    <div className="flex">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#012a4a]   sticky top-0 p-3  text-white text-lg font-bold flex items-center gap-3  shadow-lg">
          <IoIosArrowRoundBack className="text-3xl" />
          <p>Share Your Order</p>
        </div>

        <button
          onClick={() => {
            handlePrint(null, () => contentToPrint.current);
          }}
        >
          PRINT
        </button>

        <div
          ref={contentToPrint}
          className="bg-white rounded-lg shadow-lg px-8 pb-6  max-w-3xl mx-auto"
        >
          <div className="flex justify-center">
            <div className="font-bold text-sm md:text-xl mb-2">QUOTATION</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-xs md:text-sm">
              Invoice #:{data?.orderNumber}{" "}
            </div>
            <div className="text-xs md:text-sm">
              Date:{new Date().toDateString()}{" "}
            </div>
          </div>

          <div className="flex mt-6 justify-between">
            <div className=" flex ">
              <img className="h-28 w-28 mr-2" src={org.logo} alt="Logo" />
              <div className="flex flex-col ">
                <div className="text-gray-700 font-semibold text-sm md:text-lg">
                  {org?.name}
                </div>
                <div className="">
                  <div className="text-gray-500 mb-0.5  md:text-xs text-[8px]  ">
                    {org?.flat}
                  </div>
                  <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                    {org?.landmark}
                  </div>
                  <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                    {org?.road}
                  </div>
                  <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                    {org?.place}
                  </div>
                  <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                    {org?.pin}
                  </div>
                </div>
              </div>
            </div>
            <div className="">
              <div className="mt-6">
                <div className="text-gray-500  mb-0.5 md:text-xs text-[8px]">
                  {org?.email}
                </div>
                <div className="text-gray-500 mb-0.5  md:text-xs text-[8px] ">
                  {org?.mobile}
                </div>
                <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                  Gst No: {org?.gstNum}
                </div>
                <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                  Pan No: {org?.pan}
                </div>
                <div className="text-gray-500 mb-0.5 md:text-xs text-[8px]">
                  {org?.website}
                </div>
              </div>
            </div>
          </div>

       
          <div className="flex md:gap-[130px] justify-between md:justify-normal text-[8px] md:text-xs mt-4">
            <div className=" border-gray-300 pb-8 mb-2">
              <h2 className="md:text-lg text-base font-bold mb-4">Bill To:</h2>
              <div className="text-gray-700 mb-0.5">
                {data?.party?.partyName}
              </div>
              {data?.party?.billingAddress
                ?.split(/[\n,]+/)
                .map((line, index) => (
                  <div key={index} className="text-gray-700 mb-0.5">
                    {line.trim()}
                  </div>
                ))}{" "}
              {/* <div className="text-gray-700 mb-0.5">Anytown, USA 12345</div> */}
              <div className="text-gray-700 mb-0.5">{data?.party?.emailID}</div>
              <div className="text-gray-700">{data?.party?.mobileNumber}</div>
            </div>
            <div className=" border-gray-300 pb-8 mb-0.5">
              <h2 className="md:text-lg text-base font-bold mb-4">Ship To:</h2>
              <div className="text-gray-700 mb-0.5">
                {data?.party?.partyName}
              </div>
              {data?.party?.shippingAddress
                ?.split(/[\n,]+/)
                .map((line, index) => (
                  <div key={index} className="text-gray-700 mb-0.5">
                    {line.trim()}
                  </div>
                ))}{" "}
              {/* <div className="text-gray-700 mb-0.5">Anytown, USA 12345</div> */}
              <div className="text-gray-700 mb-0.5">{data?.party?.emailID}</div>
              <div className="text-gray-700">{data?.party?.mobileNumber}</div>
            </div>
          </div>

          {/* <hr className="border-t-2 border-black mb-0.5" /> */}
          <table className="w-full text-left mb-8">
            <thead className="border-b-2 border-t-2 border-black text-[6px] md:text-xs    ">
              <tr>
                <th className="text-gray-700 font-bold uppercase py-2">
                  Items
                </th>

                <th className="text-gray-700 font-bold uppercase py-2">Hsn</th>
                <th className="text-gray-700 font-bold uppercase py-2">Qty</th>
                <th className="text-gray-700 font-bold uppercase py-2">Rate</th>
                <th className="text-gray-700 font-bold uppercase py-2">Disc</th>
                <th className="text-gray-700 font-bold uppercase py-2">Tax</th>
                <th className="text-gray-700 font-bold uppercase py-2">
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
                      className="border-b-2 border-t-1 text-[7.1px] md:text-xs"
                    >
                      <td className="py-4 text-gray-700">{el.product_name}</td>
                      <td className="py-4 text-gray-700">{el.hsn_code}</td>
                      <td className="py-4 text-gray-700">
                        {el?.count} {el?.unit}
                      </td>
                      <td className="py-4 text-gray-700">
                        ₹{" "}
                        {
                          el.Priceleveles.find(
                            (item) => item?.pricelevel === data?.priceLevel
                          )?.pricerate
                        }
                      </td>
                      <td className="py-4 text-gray-700">
                        {discountAmount > 0
                          ? ` ₹${discountAmount?.toFixed(2)} `
                          : "₹ 0"}
                        <br />
                        {el?.discountPercentage > 0 &&
                          `(${el?.discountPercentage}%)`}
                      </td>
                      <td className="py-4 text-gray-700">
                        {(
                          el?.total -
                          (el?.total * 100) / (parseFloat(el.igst) + 100)
                        )?.toFixed(2)}
                        <br /> ({el?.igst}%)
                      </td>
                      {/* <td className="py-4 text-gray-700">{el?.igst} %</td> */}
                      <td className="py-4 text-gray-700">₹ {el?.total}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <div className="flex justify-between mb-8 border-y-2 border-black py-2">
            <div className="text-gray-700 mr-2">Subtotal:</div>
            <div className="text-black font-bold ">
              ₹{" "}
              {data?.items
                ?.reduce((acc, curr) => acc + parseFloat(curr.total), 0)
                ?.toFixed(2)}
            </div>
          </div>
          <div className=" mb-8 flex justify-end">
            <div className="text-gray-700 mr-2">Add on charge:</div>
            <div className="text-gray-700">
              ₹{" "}
              {data?.additionalCharges
                ?.reduce((acc, curr) => acc + parseFloat(curr?.value || 0), 0)
                ?.toFixed(2)}
            </div>
          </div>
          <div className="flex justify-end mb-8">
            <div className="text-gray-700 mr-2">Total:</div>
            <div className="text-gray-700 font-bold text-xl">
              ₹ {data.finalAmount}
            </div>
          </div>
          <div className="border-t-2 border-gray-300 pt-8 mb-8">
            <div className="text-gray-700 mb-2">
              Payment is due within 30 days. Late payments are subject to fees.
            </div>
            <div className="text-gray-700 mb-2">
              Please make checks payable to Your Company Name and mail to:
            </div>
            <div className="text-gray-700">
              123 Main St., Anytown, USA 12345
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareInvoice;
