import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api/api';
import TitleDiv from '@/components/common/TitleDiv'; 
import jsPDF from "jspdf";
import html2canvas from "html2canvas";


const GuestRegistrationCard = () => {
  const location = useLocation();
  const [checkinData, setCheckinData] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Get checkin data from location state
  useEffect(() => {
    if (location?.state?.selectedCheckOut && location.state.selectedCheckOut[0]) {
      setSelectedCheckin(location.state.selectedCheckOut[0]);
      setLoading(false);
    } else {
      setError('No checkin data received from BookingList');
      setLoading(false);
    }
  }, [location?.state?.selectedCheckOut]);

  // Print function
const handlePrint = async () => {
  const element = document.getElementById("printable-area");
  if (!element) return;

  const pdf = new jsPDF("p", "mm", "a4");

  const canvas = await html2canvas(element, {
    scale: 2,            // High quality
    useCORS: true,       // Allow logo image
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  // Extra pages if content overflows
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }

  // Open print dialog
  pdf.autoPrint();
  window.open(pdf.output("bloburl"), "_blank");
};



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <div className="text-lg">Loading checkin data...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <div className="text-red-500 text-lg">Error: {error}</div>
      </div>
    );
  }

  // No data state
  if (!selectedCheckin) {
    return (
      <div className="min-h-screen bg-gray-100 p-5 flex items-center justify-center">
        <div className="text-lg">No checkin data found</div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  // Helper function to get selected room details
  const getSelectedRoomDetails = () => {
    if (selectedCheckin?.selectedRooms && selectedCheckin.selectedRooms.length > 0) {
      return selectedCheckin.selectedRooms[0];
    }
    return null;
  };

  const selectedRoom = getSelectedRoomDetails();

  // Helper function to extract name parts
  const getNameParts = (fullName) => {
    if (!fullName) return { title: 'Mr.', surname: '', firstName: '' };
    
    const parts = fullName.split(' ');
    const title = ['Mr.', 'Mrs.', 'Ms.', 'Dr.'].includes(parts[0]) ? parts[0] : 'Mr.';
    const firstName = parts.slice(0, -1).join(' ');
    const surname = parts[parts.length - 1];
    
    return { title, surname, firstName };
  };

  const nameInfo = getNameParts(selectedCheckin?.customerName || selectedCheckin?.customerId?.partyName);

  return (
    <>
     <div className="sticky top-0 z-20 no-print">
        <TitleDiv
          loading={false}
          title={`Guest Registration Card - ${selectedCheckin?.grcno || selectedCheckin?.voucherNumber || 'GRC'}`}
          dropdownContents={[
            {
              title: "Print GRC",
              onClick: handlePrint,
            },
            {
              title: "Back to Checkins",
              to: "/sUsers/checkInList",
            },
          ]}
        />
      </div>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          
          @page {
            size: A4;
            margin: 8mm;
          }
        }
        
        @media screen {
          .print-container {
            min-height: 100vh;
            background-color: #f3f4f6;
            padding: 1rem;
          }
        }
      `}</style>
      
      <div className="print-container">
        {/* Print Button */}
       

        {/* Printable Area */}
        <div id="printable-area" className="max-w-4xl mx-auto bg-white border-2 border-black">
          {/* Header with Logo */}
          <div className="border-b-2 border-black">
            <div className="flex">
              {/* Left: GRC NO */}
              <div className="w-40 p-2 flex items-start text-xs">
                GRC NO. : <span className="ml-1">{selectedCheckin?.grcno || ''}</span>
              </div>
              
              {/* Center: Logo */}
              <div className="flex-1 flex justify-center items-center p-2">
                <img
                  src={org?.logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: "60mm",
                    maxHeight: "25mm",
                    height: "auto",
                    objectFit: "contain",
                  }}
                />
              </div>
              
              {/* Right: Empty space for balance */}
              <div className="w-40"></div>
            </div>
            
            {/* Title */}
            <div className="text-center text-sm font-bold pb-2">
              GUEST REGISTRATION CARD
            </div>
          </div>

          {/* Row 1: Title, Surname, First Name, Purpose */}
          <div className="flex border-b border-black">
            <div className="w-24 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">MRS./MS./MR.</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">SURNAME</div>
            <div className="flex-1 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">FIRST NAME</div>
            <div className="w-36 p-1.5 bg-gray-100 text-xs font-semibold">PURPOSE OF VISIT</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-24 p-1.5 border-r border-black text-xs">{nameInfo.title}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">{nameInfo.surname}</div>
            <div className="flex-1 p-1.5 border-r border-black text-xs">
              {nameInfo.firstName || selectedCheckin?.customerName || selectedCheckin?.customerId?.partyName || ''}
              {selectedCheckin?.customerId?.gstNumber && (
                <div className="text-xs text-gray-600 mt-0.5">GSTNO: {selectedCheckin.customerId.gstNumber}</div>
              )}
            </div>
            <div className="w-36 p-1.5 text-xs">{selectedCheckin?.visitOfPurpose?.purpose || 'BUSINESS'}</div>
          </div>

          {/* Row 2: Company, Travel Agent, Next Destination */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">COMPANY</div>
            <div className="flex-1 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">TRAVEL AGENT</div>
            <div className="w-40 p-1.5 bg-gray-100 text-xs font-semibold">NEXT DESTINATION</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.company || ''}</div>
            <div className="flex-1 p-1.5 border-r border-black text-xs">{selectedCheckin?.agentId?.name || ''}</div>
            <div className="w-40 p-1.5 text-xs">{selectedCheckin?.nextDestination || ''}</div>
          </div>

          {/* Row 3: Address, Date of Birth */}
          <div className="flex border-b border-black">
            <div className="flex-1 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">ADDRESS</div>
            <div className="w-32 p-1.5 bg-gray-100 text-xs font-semibold">DATE OF BIRTH</div>
          </div>
          <div className="flex border-b border-black">
            <div className="flex-1 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.detailedAddress || selectedCheckin?.customerId?.address || ''}
              {selectedCheckin?.state && <>, {selectedCheckin.state}</>}
              {selectedCheckin?.country && `, ${selectedCheckin.country}`}
              {selectedCheckin?.pinCode && ` - ${selectedCheckin.pinCode}`}
            </div>
            <div className="w-32 p-1.5 text-xs">
              {selectedCheckin?.dateOfBirth ? formatDate(selectedCheckin.dateOfBirth) : ''}
            </div>
          </div>

          {/* Row 4: Email, Tel No, Mobile, Nationality */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Email</div>
            <div className="w-24 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Tel. No.</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">MOBILE NO.</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">NATIONALITY</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.customerId?.email || ''}</div>
            <div className="w-24 p-1.5 border-r border-black text-xs"></div>
            <div className="w-32 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.mobileNumber || selectedCheckin?.customerId?.mobileNumber || ''}
            </div>
            <div className="flex-1 p-1.5 text-xs">
              {selectedCheckin?.customerId?.nationality || selectedCheckin?.country || 'INDIAN'}
            </div>
          </div>

          {/* Row 5: Passport Details */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Passport No.</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Place of Issue</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Date of Issue</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">Date of Expiry</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.passportNo || ''}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.placeOfIssue || ''}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.dateOfIssue ? formatDate(selectedCheckin.dateOfIssue) : ''}
            </div>
            <div className="flex-1 p-1.5 text-xs">
              {selectedCheckin?.dateOfExpiry ? formatDate(selectedCheckin.dateOfExpiry) : ''}
            </div>
          </div>

          {/* Row 6: Arrival Dates */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">ARR. DATE</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">DEP. DATE</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">DATE OF ARRIVAL IN INDIA</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">{formatDate(selectedCheckin?.arrivalDate)}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">{formatDate(selectedCheckin?.checkOutDate)}</div>
            <div className="flex-1 p-1.5 text-xs">
              {selectedCheckin?.dateOfArrivalInIndia ? formatDate(selectedCheckin.dateOfArrivalInIndia) : ''}
            </div>
          </div>

          {/* Row 7: Visa Details */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Visa No.</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Visa POI</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">Visa DOI</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">Visa Exp. Dt</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.visaNo || ''}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.visaPOI || ''}</div>
            <div className="w-32 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.visaDOI ? formatDate(selectedCheckin.visaDOI) : ''}
            </div>
            <div className="flex-1 p-1.5 text-xs">
              {selectedCheckin?.visaExpDt ? formatDate(selectedCheckin.visaExpDt) : ''}
            </div>
          </div>

          {/* Row 8: Advance Details Header */}
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">ADVANCE DETAILS</div>
            <div className="w-1/2 p-1.5 bg-gray-100 text-xs font-semibold">PROPOSED DURATION OF STAY IN INDIA</div>
          </div>

          {/* Row 9: Payment Details */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">MODE OF PAYMENT</div>
            <div className="w-24 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">AMOUNT</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">RECEIPT NO.</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">CERT. OF REGISTRATION NUMBER</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.paymentMode || selectedCheckin?.bookingId?.paymentMode || ''}
            </div>
            <div className="w-24 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.bookingId?.advanceAmount || selectedCheckin?.totalAmount || '0'}
            </div>
            <div className="w-32 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.receiptNumber || selectedCheckin?.voucherNumber || ''}
            </div>
            <div className="flex-1 p-1.5 text-xs">{selectedCheckin?.certOfRegistrationNumber || ''}</div>
          </div>

          {/* Row 10: Remarks */}
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">REMARKS</div>
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">PLACE OF ISSUE</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">DATE OF ISSUE</div>
          </div>
          <div className="flex border-b border-black">
            <div className="w-1/2 p-1.5 border-r border-black text-xs">
              {selectedCheckin?.remarks || selectedCheckin?.bookingType || ''}
            </div>
            <div className="w-32 p-1.5 border-r border-black text-xs">{selectedCheckin?.placeOfIssue || ''}</div>
            <div className="flex-1 p-1.5 text-xs">
              {formatDate(selectedCheckin?.bookingDate) || formatDate(selectedCheckin?.createdAt)}
            </div>
          </div>

          {/* Row 11: Room Details */}
          <div className="flex border-b border-black">
            <div className="w-32 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">ROOM RATE</div>
            <div className="w-24 p-1.5 bg-gray-100 border-r border-black text-xs font-semibold">PAX</div>
            <div className="flex-1 p-1.5 bg-gray-100 text-xs font-semibold">ROOM NUMBER</div>
          </div>
          <div className="flex border-b-2 border-black">
            <div className="w-32 p-1.5 border-r border-black text-xs">
              ₹{selectedRoom?.priceLevelRate || selectedCheckin?.selectedRooms?.[0]?.priceLevelRate || '0.00'}
            </div>
            <div className="w-24 p-1.5 border-r border-black text-xs">
              {selectedRoom?.pax || selectedCheckin?.selectedRooms?.[0]?.pax || '1'}
            </div>
            <div className="flex-1 p-1.5 text-xs">
              {selectedRoom?.roomName || selectedCheckin?.selectedRooms?.[0]?.roomName || 
               selectedCheckin?.selectedRoomId?.roomNumber || 
               selectedCheckin?.roomNumber || ''}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-2">
            <div className="text-xs font-bold mb-1.5">Terms & Conditions</div>
            <div className="text-xs leading-relaxed space-y-1.5">
              <p>The above rate is subject to CGST 6% SGST 6%. Taxes are subject to change as per Government regulations without prior notice.</p>
              <p>For your safety and security, a maximum of three visitors are allowed in the guest room from 09.00 hrs to 22.00 hrs only on producing valid ID proof with photo and address. Group parties and celebrations shall happen strictly in one of our restaurants.</p>
              <p>Key card if lost would be provided at an additional charge.</p>
              <p>I agree to release my room(s) by 12 noon on the date of departure. Should I fail to checkout, I authorise the management to pack and remove my belongings to the hotel cloak room so that my room(s) will be available for incoming guests with confirmed reservations.</p>
              <p>I agree that I am responsible for the full payment of my stay. In the event it is not paid by the company, organisation or person indicated.</p>
            </div>
          </div>

          {/* Signature Section */}
          <div className="border-t-2 border-black p-3 flex justify-between items-end">
            <div className="text-xs font-bold">Front Desk</div>
            <div className="text-xs font-bold">Duty Manager</div>
            <div className="text-xs font-bold">GUEST SIGNATURE</div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-4 flex justify-end">
          <button
            onClick={handlePrint}
            className="bg-black hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded shadow"
          >
            🖨️ Print 
          </button>
        </div> 
      </div>
       
    </>
  );
};

export default GuestRegistrationCard;