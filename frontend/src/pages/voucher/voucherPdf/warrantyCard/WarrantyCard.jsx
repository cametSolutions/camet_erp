import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MobilePdfViewer from "../MobilePdfViewer";

const WarrantyCard = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [voucherDetails, setVoucherDetails] = useState({});

  const { data, loading } = useFetch(`/api/sUsers/getsalesDetails/${id}`);

  useEffect(() => {
    if (data) {
      const { party = {}, items = [], date = "", salesNumber = "" } = data.data;

      setCustomerData(party);
      setVoucherDetails(data.data);
      const products = [];

      items?.forEach((el) => {
        if (el?.batchEnabled) {
          // Filter GodownList items that have 'added: true' and have a batch name
          const addedBatches = el?.GodownList?.filter(
            (godown) =>
              godown?.added === true && godown?.batch && godown?.warrantyCardNo
          );

          // Create a separate product entry for each batch
          addedBatches?.forEach((godown) => {
            products?.push({
              modelNo: el?.product_name,
              purchaseNO: salesNumber,
              purchaseDate: date,
              serialNO: godown?.batch,
              Warrantyto: godown?.expdt,
            });
          });
        }
      });

      setProductData(products);
    }
  }, [data?.data]);

  const logo = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?.logo
  );

  return (
    <div>
      <TitleDiv title="Warranty Card" loading={loading} />
      <MobilePdfViewer
        loading={loading}
        showControls={true}
        containerHeight="75vh"
        initialScale={0.476}
      >
        {productData.length > 0
          ? productData?.map((item, index) => (
              <div
                key={index}
                className=" mt-12 max-w-4xl mx-auto bg-white border border-gray-200 shadow-xl p-10   text-sm my-10"
              >
                {/* Header with Logo */}
                {logo && (
                  <div className=" flex justify-center text-center mb-6 ">
                    <img src={logo} className="w-20 h-20" />
                  </div>
                )}

                {/* WARRANTY CARD Title */}
                <div className="text-center mb-8 font-semibold">
                  <h className="text-xl font-bold  tracking-tight">
                    WARRANTY CARD
                  </h>
                  <hr className="border mt-4" />
                </div>

                <div className="flex justify-between">
                  {/* Left Column - Customer Details */}
                  <div className="flex-1 pr-8">
                    <div className="space-y-1">
                      {[
                        {
                          label: "Customer Name",
                          value: customerData?.partyName || "",
                        },
                        {
                          label: "Address",
                          value: (
                            <>
                              {customerData?.billingAddress
                                ?.split(/[\n,]+/)
                                .map((line, index) => (
                                  <div key={index} className="text-gray-700">
                                    {line.trim()}
                                  </div>
                                ))}
                            </>
                          ),
                        },
                        {
                          label: "Contact",
                          value: customerData?.mobileNumber || "",
                        },
                        { label: "Model No", value: item?.modelNo || "" },
                        { label: "Serial No", value: item?.serialNO || "" },
                        { label: "Purchase No", value: item?.purchaseNO || "" },
                        {
                          label: "Purchase Date",
                          value: new Date(item?.purchaseDate)
                            .toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })
                            .replace(/ /g, "-"),
                        },
                        {
                          label: "Warranty Period",
                          value: `${new Date(
                            voucherDetails?.date
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })} to  ${new Date(
                            item?.Warrantyto
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}`,
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start text-xs">
                          {item?.value && item?.value !== "" && (
                            <div className="w-36 flex-shrink-0 flex">
                              <span className="font-normal w-full text-left pr-2">
                                {item.label}
                              </span>
                              <span className="pr-2">:</span>
                            </div>
                          )}

                          <div className="font-bold">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Warranty Year Box */}
                  <div className="flex flex-col items-center">
                    <div className="p-1 border border-yellow-700 mb-3 ">
                      <div className="border-2 border-black w-20 h-20 flex items-center justify-center ">
                        <span className="text-4xl font-bold molle-regular-italic">
                          2
                        </span>
                      </div>
                    </div>
                    <div className="text-center font-semibold ">
                      <div>YEAR WARRANTY</div>
                    </div>
                  </div>
                </div>

                {/* Dealer Signature Box */}
                <div className="mt-14 mb-8 flex justify-end w-full ">
                  <div className="border w-2/5 border-black h-24 flex items-start justify-center pb-2">
                    <span className="text-xs mt-2">
                      Dealer Signature (Stamp)
                    </span>
                  </div>
                </div>

                {/* Terms & Conditions */}

                <div className="mt-8">
                  <hr className="border my-4" />
                  <h3 className="font-bold mb-2">Terms & Conditions</h3>
                  <p className="text-xs ">
                    This warranty is valid for manufacturing defects and repair
                    of your appliance within warranty period at the date of
                    purchase. Service will be provided within 15 days once the
                    product goes to dysfunctional. The warranty stand void if
                    the product, is tampered with or not used in accordance with
                    the operating terms specified by the manufacturer. Warranty
                    does not cover any physical or liquid damage (including any
                    damage caused due to natural calamities like earth quake,
                    cyclone, voltage fluctuations, lighting natural pouring)
                    wear & tear 1-3 month warranty for TV remote typically
                    covers (physical damage not covered under warranty).The
                    accessories are not covered in this warranty. If the Product
                    Serial number is altered or removed, warranty is void.
                  </p>
                </div>

                {/* Customer Care */}
                <div className="mt-6 text-center">
                  <hr className="border my-2" />

                  <p className="text-xs font-semibold">
                    To register a service or repair request, please call our
                    customer care number
                    <br />
                    <span className="font-bold">8129081503, 8714624330</span>
                  </p>
                </div>
              </div>
            ))
          : !loading && (
              <div className="text-center text-gray-500 py-8 flex items-center justify-center h-screen">
                ! Oops... No data found
              </div>
            )}
      </MobilePdfViewer>
    </div>
  );
};

export default WarrantyCard;
