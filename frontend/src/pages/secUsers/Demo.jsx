import React, { useRef, useState } from 'react';
import Barcode from 'react-barcode';
import QRCode from 'qrcode.react';
import { useReactToPrint } from 'react-to-print';
import header from '../assets/logo/header.jpeg';
import footer from '../assets/logo/footer.jpeg';
import dayjs from 'dayjs';

function ResultInvoiceForm({ data }) {
  const [displayData, setDisplayData] = useState([data]);
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: auto;
            }

            body {
              margin-top: 120;
               margin-bottom: 120;
            }

            .header, .footer {
              display: block;
              position: fixed;
              left: 0;
              width: 100%;
              z-index: 99;
            }

            .header {
              top: 0;
              height: 100px; /* Adjust based on the height of your header image */
            }

            .footer {
              bottom: 0;
              height: 100px; /* Adjust based on the height of your footer image */
            }

            .content {
              margin-top: 50px; /* Adjust based on the height of your header image */
              background-color: white;
              z-index: 98; /* Lower than header and footer */
              padding: 20px; /* Add padding to the content */
              page-break-inside: avoid; /* Avoid breaking inside the content */
            }

            .page-break {
              page-break-before: always;
            }
          }

          .header, .footer {
            display: block;
          }

          .header img, .footer img {
            width: 100%;
            height: auto;
          }

          .content {
            padding-top: 120px; /* Adjust based on the height of your header image */
            padding-bottom: 120px; /* Adjust based on the height of your footer image */
          }
        `}
      </style>

      {displayData && displayData.length > 0 ? (
        displayData.map((item, index) => (
          <div key={index} className="bg-white">
            <div ref={componentRef}>
              <div className="header">
                <img src={header} alt="Logo" />
              </div>
              <div className="content bg-white px-4">
                <div className="details">
                  <div className="flex p-6">
                    <div className="w-1/2 text-left font-bold">
                      <div className="flex">
                        <p className="w-32 font-bold">Name</p>
                        <p className="text-black-2">
                          : {item?.patientId?.patientName}
                        </p>
                      </div>
                      <div className="flex">
                        <p className="w-32 font-bold">Age/Gender</p>
                        <p className="text-black-2">
                          : {item?.age} years / {item?.patientId?.gender}
                        </p>
                      </div>
                      <div className="flex">
                        <p className="w-32 font-bold">INV No</p>
                        <p className="text-black-2">: {item?.invoiceNumber}</p>
                      </div>
                      <div className="flex">
                        <p className="w-32 font-bold">Ref By</p>
                        <p className="text-black-2">: {item?.referenceBy}</p>
                      </div>
                    </div>
                    <div className="w-1/2 text-left">
                      <div className="flex ml-8">
                        <p className="w-32 font-bold">Registration Date</p>
                        <p className="text-black-2">
                          :{' '}
                          {dayjs(item?.invoiceDate).format(
                            'DD-MM-YYYY HH:mm:ss',
                          )}
                        </p>
                      </div>
                      <div className="flex ml-8">
                        <p className="w-32 font-bold">Reported Date</p>
                        <p className="text-black-2">
                          :{' '}
                          {dayjs(item?.updatedAt).format('DD-MM-YYYY HH:mm:ss')}
                        </p>
                      </div>
                      <div className="flex ml-8">
                        <p className="w-32 font-bold">Dept</p>
                        <p className="text-black-2">: </p>
                      </div>
                      <div className="flex ml-8">
                        <Barcode
                          value={item?.invoiceNumber}
                          width={2}
                          height={30}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start border-t border-b border-black font-bold">
                    <div className="w-1/3 text-center">
                      <p>Investigation</p>
                    </div>
                    <div className="w-1/3 text-center">
                      <p>Observed Value</p>
                    </div>
                    <div className="w-1/3 text-center">
                      <p>Reference Range</p>
                    </div>
                  </div>
                  {item?.testTable
                    ?.filter((test) =>
                      item.result.some((result) => result.testId === test._id),
                    )
                    .map((data, index) => {
                      const result = item.result.find(
                        (result) => result.testId === data._id,
                      );
                      return (
                        <div key={index} className="testDetails m-8">
                          <div className="w-full text-lg text-black-2 p-4">
                            <p className="border-b border-black w-fit font-bold">
                              {data?.testMethod}
                            </p>
                          </div>
                          <div className="w-full text-sm text-black-2 p-4">
                            <p className="border-b border-black w-fit font-bold">
                              {data?.testType}
                            </p>
                          </div>
                          <div className="flex w-full text-center">
                            <div className="w-1/3">
                              <p className="text-black-2">{data?.testName}</p>
                            </div>
                            <div className="w-1/3">
                              {result && (
                                <p className="text-black-2">
                                  {result.result1} {data?.testUnit}
                                </p>
                              )}
                            </div>
                            <div className="w-1/3">
                              {data.range.map((range, index) => {
                                if (range.gender === item.patientId.gender) {
                                  return (
                                    <p key={index} className="text-black-2">
                                      {range.rangeStartAt} - {range.rangeEndAt}{' '}
                                      {data?.testUnit}
                                    </p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="">
                <div className="flex bg-white mb-4">
                  <div className="w-1/4 text-center">
                    <p className="text-black-2 font-bold text-xl mt-14 ">
                      {' '}
                      {item?.staffId?.staffName}
                    </p>
                    <p className="text-black-2">Lab Technician</p>
                  </div>
                  <div className="w-1/4 text-right ">
                    <p className="mt-18">Page 1 of 1</p>
                  </div>
                  <div className="w-1/4 flex gap-4 item-start ml-4">
                    <QRCode value={item?.invoiceNumber} size={100} />
                  </div>
                  <div className="w-1/4">
                    <p className="text-black-2 font-bold text-xl mt-14">
                      ANJALI RAJILAL
                    </p>
                    <p className="text-black-2">Senior Technician</p>
                  </div>
                </div>
                <div className="footer bg-white">
                  <img src={footer} alt="Logo" />
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div>No data available.</div>
      )}

      <div className="flex mt-4">
        <button
          className="ml-auto p-2 bg-black text-white rounded-sm hover:bg-secondary"
          onClick={handlePrint}
        >
          Print Result
        </button>
      </div>
    </>
  );
}

export default ResultInvoiceForm;