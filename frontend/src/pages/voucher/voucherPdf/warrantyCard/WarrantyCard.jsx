import TitleDiv from "@/components/common/TitleDiv";
import useFetch from "@/customHook/useFetch";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import MobilePdfViewer from "../MobilePdfViewer";
import { getFutureDate } from "../../../../../../backend/utils/dateHelpers";
import { SharingMethodSelector } from "../../voucherDetails/actionButtons/SharingMethodSelector";
import { FaShareAlt } from "react-icons/fa";
import html2pdf from "html2pdf.js";

const WarrantyCard = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const contentToPrint = useRef(null);

  const { data, loading } = useFetch(`/api/sUsers/getsalesDetails/${id}`);

  useEffect(() => {
    if (data) {
      const { party = {}, items = [], date = "", salesNumber = "" } = data.data;

      setCustomerData(party);
      const products = [];

      items?.forEach((el) => {
        // Filter GodownList items that have 'added: true' and have a batch name
        const addedBatches = el?.GodownList?.filter(
          (godown) =>
            godown?.added === true && godown?.batch && godown?.warrantyCard
        );

        

        // Create a separate product entry for each batch
        addedBatches?.forEach((godown) => {
                  
          const {
            warrantyYears,
            warrantyMonths,
            displayInput,
            termsAndConditions,
            customerCareInfo,
            customerCareNo,
            imageUrl,
            
          } = godown.warrantyCard;

          products?.push({
            modelNo: el?.product_name,
            purchaseNO: salesNumber,
            purchaseDate: date,
            serialNO: godown?.batch,
            Warrantyto: godown?.expdt,
            warrantyYears,
            warrantyMonths,
            displayInput,
            termsAndConditions,
            customerCareInfo,
            customerCareNo,
            imageUrl,
            warrantyPeriodFrom: date,
            warrantyPeriodTo: getFutureDate({
              years: warrantyYears,
              months: warrantyMonths,
            }),
          });
        });
      });

      setProductData(products);
    }
  }, [data?.data]);

  const logo = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg?.logo
  );

  /////////////////////////////////////////////// handle download ///////////////////////////////////////////////
  const handleDownload = () => {
    const element = contentToPrint.current;
    if (!element) return;

    // Detect mobile devices
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Store original styles
    const originalTransform = element.style.transform;
    const originalTransition = element.style.transition;

    if (isMobile) {
      element.style.transform = "none";
      element.style.transition = "none";
    }

    const options = {
      margin: [1, 1, 10, 1],
      filename: `Warranty_Card_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 5,
        useCORS: true,
        letterRendering: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight + 50,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf()
      .from(element)
      .set(options)
      .outputPdf("blob")
      .then((pdfBlob) => {
        const blobUrl = URL.createObjectURL(pdfBlob);

        // Restore styles
        if (isMobile) {
          element.style.transform = originalTransform;
          element.style.transition = originalTransition;
        }

        if (isMobile) {
          // ✅ Mobile: trigger direct download
          const downloadLink = document.createElement("a");
          downloadLink.href = blobUrl;
          downloadLink.download = `Warranty_Card_${id}.pdf`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        } else {
          // ✅ Desktop: trigger print
          const iframe = document.createElement("iframe");
          iframe.style.display = "none";
          iframe.src = blobUrl;
          document.body.appendChild(iframe);

          iframe.onload = () => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          };
        }
      })
      .catch((error) => {
        console.error("PDF generation failed:", error);

        if (isMobile) {
          element.style.transform = originalTransform;
          element.style.transition = originalTransition;
        }
      });
  };

  console.log("productData", productData);
  

  return (
    <div>
      <TitleDiv
        loading={loading}
        title="Warranty Card"
        rightSideContent={<FaShareAlt size={15} />}
        rightSideModalComponent={({ setShowModal }) => (
          <SharingMethodSelector
            open={true}
            setOpen={setShowModal}
            handleDownload={handleDownload}
          />
        )}
      />
      
      <MobilePdfViewer
        loading={loading}
        showControls={true}
        containerHeight="75vh"
        initialScale={0.476}
        enableScroll={true}
        scrollDirection="vertical"
      >
        <div ref={contentToPrint} style={{ 
          '@media print': {
            pageBreakInside: 'avoid'
          }
        }}>
          {productData.length > 0
            ? productData?.map((item, index) => (
                <div
                  key={index}
                  className="mt-12 max-w-4xl mx-auto bg-white border border-gray-200 shadow-xl p-10 text-sm my-10"
                  style={{ 
                    pageBreakAfter: index < productData.length - 1 ? 'always' : 'auto',
                    minHeight: '297mm' // A4 height
                  }}
                >
                  {/* Header with Logo */}
                  {( item.imageUrl  || logo) && (
                    <div className=" flex justify-center text-center mb-6 ">
                      <img src={item.imageUrl || logo} className="w-20 h-20" />
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
                            value: (() => {
                              const from = new Date(item?.warrantyPeriodFrom);
                              const to = new Date(item?.warrantyPeriodTo);

                              const formattedFrom = from.toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              );

                              const formattedTo = to.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              });

                              return to.setHours(0, 0, 0, 0) >
                                from.setHours(0, 0, 0, 0)
                                ? `${formattedFrom} to ${formattedTo}`
                                : formattedFrom;
                            })(),
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
                      <div className="p-1 border border-yellow-700 mb-3">
                        <div className="border-2 border-black w-20 h-20 flex items-center justify-center">
                          <span className="text-4xl font-bold molle-regular-italic">
                            {item?.displayInput}
                          </span>
                        </div>
                      </div>
                      <div className="text-center font-semibold">
                        {(item?.warrantyYears > 0 ||
                          item?.warrantyMonths > 0) && (
                          <div>
                            {item?.warrantyYears > 0
                              ? "YEAR WARRANTY"
                              : item?.warrantyMonths > 0
                              ? "MONTH WARRANTY"
                              : ""}
                          </div>
                        )}
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
                  {item?.termsAndConditions && (
                    <div className="mt-8">
                      <hr className="border my-4" />
                      <h3 className="font-bold mb-2">Terms & Conditions</h3>
                      <p className="text-xs ">{item?.termsAndConditions}</p>
                    </div>
                  )}

                  {/* Customer Care */}
                  <div className="mt-6 text-center">
                    <hr className="border my-2" />

                    <p className="text-xs font-semibold">
                      {item?.customerCareInfo}
                      <br />
                      <span className="font-bold">{item?.customerCareNo}</span>
                    </p>
                  </div>
                </div>
              ))
            : !loading && (
                <div className="text-center text-gray-500 py-8 flex items-center justify-center h-screen">
                  ! Oops... No data found
                </div>
              )}
        </div>
      </MobilePdfViewer>
    </div>
  );
};

export default WarrantyCard;