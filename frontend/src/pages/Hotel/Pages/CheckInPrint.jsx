import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../../api/api';

const GuestRegistrationCard = () => {
  const location = useLocation();
  const [checkinData, setCheckinData] = useState([]);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { _id: cmp_id } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // Get checkin data from location state (navigated from BookingList)
  useEffect(() => {
    if (location?.state?.selectedCheckOut && location.state.selectedCheckOut[0]) {
      setSelectedCheckin(location.state.selectedCheckOut[0]);
      setLoading(false);
    } else {
      setError('No checkin data received from BookingList');
      setLoading(false);
    }
  }, [location?.state?.selectedCheckOut]);

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
console.log(selectedCheckin)
  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-4xl mx-auto bg-white border-2 border-black">
        {/* Header */}
        <div className="text-center p-4 border-b-2 border-black relative">
          <div className="inline-block w-16 h-8 border-2 border-black rounded-full leading-6 font-bold mb-2">
            HT
          </div>
          <div className="text-xs tracking-widest">KGPCS</div>
          <div className="text-lg font-bold tracking-widest mb-1">HILLTOWN</div>
          <div className="text-xs tracking-widest mb-3">HOTEL</div>
          <div className="text-sm font-bold">GUEST REGISTRATION CARD</div>
          <div className="absolute left-5 top-32 text-xs">
            GRC NO. : {selectedCheckin?.voucherNumber || selectedCheckin?.voucherNumber || '1117'}
          </div>
        </div>

        {/* Main Form Table */}
        <div className="border-collapse">
          {/* Row 1 - Basic Info Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">MRS/MS/MR.</div>
            <div className="w-40 p-2 bg-gray-100 border-r border-black font-bold text-xs">SURNAME</div>
            <div className="flex-1 p-2 bg-gray-100 border-r border-black font-bold text-xs">FIRST NAME</div>
            <div className="w-40 p-2 bg-gray-100 font-bold text-xs">PURPOSE OF VISIT</div>
          </div>

          {/* Row 2 - Basic Info Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">{nameInfo.title}</div>
            <div className="w-40 p-2 border-r border-black text-xs">{nameInfo.surname}</div>
            <div className="flex-1 p-2 border-r border-black text-xs">
              {nameInfo.firstName || selectedCheckin?.customerName || selectedCheckin?.customerId?.partyName || ''}<br />
              {selectedCheckin?.customerId?.gstNumber && (
                <span className="text-xs text-gray-600">GSTNO: {selectedCheckin.customerId.gstNumber}</span>
              )}
            </div>
            <div className="w-40 p-2 font-bold text-xs bg-gray-50">
              {selectedCheckin?.visitOfPurpose?.purpose || 'BUSINESS'}
            </div>
          </div>

          {/* Row 3 - Company/Travel Agent Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">COMPANY</div>
            <div className="flex-1 p-2 bg-gray-100 border-r border-black font-bold text-xs">TRAVEL AGENT</div>
            <div className="w-40 p-2 bg-gray-100 font-bold text-xs">NEXT DESTINATION</div>
          </div>

          {/* Row 4 - Company/Travel Agent Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.companyName || ''}
            </div>
            <div className="flex-1 p-2 border-r border-black text-xs">
              {selectedCheckin?.agentId?.name || ''}
            </div>
            <div className="w-40 p-2 text-xs"></div>
          </div>

          {/* Row 5 - Address Header */}
          <div className="flex border-b border-black">
            <div className="flex-1 p-2 bg-gray-100 border-r border-black font-bold text-xs">ADDRESS</div>
            <div className="w-40 p-2 bg-gray-100 font-bold text-xs">DATE OF BIRTH</div>
          </div>

          {/* Row 6 - Address Value */}
          <div className="flex border-b border-black">
            <div className="flex-1 p-2 border-r border-black text-xs">
              {selectedCheckin?.detailedAddress || selectedCheckin?.customerId?.address || ''}
              {selectedCheckin?.state && <><br />{selectedCheckin.state}</>}
              {selectedCheckin?.country && `, ${selectedCheckin.country}`}
              {selectedCheckin?.pinCode && ` - ${selectedCheckin.pinCode}`}
            </div>
            <div className="w-40 p-2 text-xs">
              {selectedCheckin?.customerId?.dateOfBirth ? formatDate(selectedCheckin.customerId.dateOfBirth) : ''}
            </div>
          </div>

          {/* Row 7 - Contact Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Email</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Tel. No.</div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.mobileNumber || selectedCheckin?.customerId?.mobileNumber || ''}
            </div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">NATIONALITY</div>
          </div>

          {/* Row 8 - Contact Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.email || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs"></div>
            <div className="w-32 p-2 border-r border-black text-xs"></div>
            <div className="flex-1 p-2 text-xs">
              {selectedCheckin?.customerId?.nationality || selectedCheckin?.country || 'INDIAN'}
            </div>
          </div>

          {/* Row 9 - Passport Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Passport No.</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Place of Issue</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Date of Issue</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">Date of Expiry</div>
          </div>

          {/* Row 10 - Passport Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.passportNumber || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.passportPlaceOfIssue || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.passportDateOfIssue ? formatDate(selectedCheckin.customerId.passportDateOfIssue) : ''}
            </div>
            <div className="flex-1 p-2 text-xs">
              {selectedCheckin?.customerId?.passportExpiryDate ? formatDate(selectedCheckin.customerId.passportExpiryDate) : ''}
            </div>
          </div>

          {/* Row 11 - Arrival Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">ARR. DATE</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">DEP. DATE</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">DATE OF ARRIVAL IN INDIA</div>
          </div>

          {/* Row 12 - Arrival Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {formatDate(selectedCheckin?.arrivalDate)}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {formatDate(selectedCheckin?.checkOutDate)}
            </div>
            <div className="flex-1 p-2 text-xs">
              {selectedCheckin?.customerId?.arrivalInIndia ? formatDate(selectedCheckin.customerId.arrivalInIndia) : ''}
            </div>
          </div>

          {/* Row 13 - Visa Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Visa No.</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Visa POI</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">Visa DOI</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">Visa Exp. Dt</div>
          </div>

          {/* Row 14 - Visa Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.visaNumber || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.visaPlaceOfIssue || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.customerId?.visaDateOfIssue ? formatDate(selectedCheckin.customerId.visaDateOfIssue) : ''}
            </div>
            <div className="flex-1 p-2 text-xs">
              {selectedCheckin?.customerId?.visaExpiryDate ? formatDate(selectedCheckin.customerId.visaExpiryDate) : ''}
            </div>
          </div>

          {/* Row 15 - Advance Details Headers */}
          <div className="flex border-b border-black">
            <div className="w-64 p-2 bg-gray-100 border-r border-black font-bold text-xs">ADVANCE DETAILS</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">PROPOSED DURATION OF STAY IN INDIA</div>
          </div>

          {/* Row 16 - Payment Headers */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">MODE OF PAYMENT</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">AMOUNT</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">RECEIPT NO.</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">CERT. OF REGISTRATION NUMBER</div>
          </div>

          {/* Row 17 - Payment Values */}
          <div className="flex border-b border-black">
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.paymentMode || 'CASH'}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.advanceAmount || selectedCheckin?.totalAmount || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.receiptNumber || selectedCheckin?.voucherNumber || ''}
            </div>
            <div className="flex-1 p-2 text-xs">
              {selectedCheckin?.registrationNumber || ''}
            </div>
          </div>

          {/* Row 18 - Remarks Headers */}
          <div className="flex border-b border-black">
            <div className="w-64 p-2 bg-gray-100 border-r border-black font-bold text-xs">REMARKS</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">PLACE OF ISSUE</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">DATE OF ISSUE</div>
          </div>

          {/* Row 19 - Remarks Values */}
          <div className="flex border-b border-black">
            <div className="w-64 p-2 border-r border-black text-xs">
              {selectedCheckin?.remarks || selectedCheckin?.bookingType || ''}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedCheckin?.placeOfIssue || ''}
            </div>
            <div className="flex-1 p-2 text-xs">
              {formatDate(selectedCheckin?.bookingDate) || formatDate(selectedCheckin?.createdAt)}
            </div>
          </div>

          {/* Row 20 - Room Rate Headers */}
          <div className="flex border-b border-black bg-gray-50">
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">ROOM RATE</div>
            <div className="w-32 p-2 bg-gray-100 border-r border-black font-bold text-xs">PAX</div>
            <div className="flex-1 p-2 bg-gray-100 font-bold text-xs">ROOM NUMBER</div>
          </div>

          {/* Row 21 - Room Rate Values */}
          <div className="flex border-b-2 border-black bg-gray-50">
            <div className="w-32 p-2 border-r border-black text-xs">
              ₹{selectedRoom?.priceLevelRate || selectedCheckin?.selectedRooms?.[0]?.priceLevelRate || '0.00'}
            </div>
            <div className="w-32 p-2 border-r border-black text-xs">
              {selectedRoom?.pax || selectedCheckin?.selectedRooms?.[0]?.pax || '1.00'}
            </div>
            <div className="flex-1 p-2 text-xs">
              {selectedRoom?.roomName || selectedCheckin?.selectedRooms?.[0]?.roomName || 
               selectedCheckin?.selectedRoomId?.roomNumber || 
               selectedCheckin?.roomNumber || ''}
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="p-3 text-xs leading-relaxed">
          <div className="font-bold mb-2">Terms & Conditions</div>
          <p className="mb-2">
            The above rate is subject to CGST 6% SGST 6%. Taxes are subject to change as per Government regulations without prior notice.
          </p>
          <p className="mb-2">
            For your safety and security, a maximum of three visitors are allowed in the guest room from 09.00 hrs to 22.00 hrs only on producing valid ID proof with photo and address. Group parties and celebrations shall happen strictly in one of our restaurants.
          </p>
          <p className="mb-2">
            Key card if lost would be provided at an additional charge.
          </p>
          <p className="mb-2">
            I agree to release my room(s) by 12 noon on the date of departure. Should I fail to checkout, I authorise the management to pack and remove my belongings to the hotel cloak room so that my room(s) will be available for incoming guests with confirmed reservations.
          </p>
          <p>
            I agree that I am responsible for the full payment of my stay. In the event it is not paid by the company, organisation or person indicated.
          </p>
        </div>

        {/* Signature Section */}
        <div className="border-t-2 border-black p-4 flex justify-between items-center">
          <div className="font-bold text-sm">Front Desk</div>
          <div className="font-bold text-sm">Duty Manager</div>
          <div className="font-bold text-sm">GUEST SIGNATURE</div>
        </div>
      </div>
    </div>
  );
};

export default GuestRegistrationCard;