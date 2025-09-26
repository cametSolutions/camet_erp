import React, { useState } from 'react';
import { Printer } from 'lucide-react';

const GuestRegistrationCard = () => {
  const [guestData, setGuestData] = useState({
    grcNumber: '1117',
    title: 'Mr.',
    surname: '',
    firstName: 'P G ANIL',
    gstNumber: 'GSTNO 32AABAT3079L1ZB',
    company: 'TRAVEL AGENT',
    address: 'CMD, Centre for Management Development,\nCV Raman Pillai Road, Thiruvananthapuram,',
    email: '',
    telephone: '9447341103',
    nationality: 'INDIAN',
    arrivalDate: '23/09/2025',
    departureDate: '24/09/2025',
    roomRate: '3,200.00/-',
    pax: '1.00',
    roomNumber: '103',
    purposeOfVisit: '',
    arrivedFrom: '',
    nextDestination: '',
    dateOfBirth: '',
    passportNumber: '',
    passportPlaceOfIssue: '',
    passportDateOfIssue: '',
    passportDateOfExpiry: '',
    visaNumber: '',
    visaPOI: '',
    visaDOI: '',
    visaExpiryDate: '',
    dateOfArrivalInIndia: '',
    proposedDuration: '',
    modeOfPayment: '',
    amount: '',
    receiptNumber: '',
    certOfRegistration: '',
    remarks: '',
    placeOfIssue: '',
    dateOfIssue: ''
  });

  const handlePrint = () => {
    window.print();
  };

  const handleInputChange = (field, value) => {
    setGuestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Print Button */}
      {/* <div className="text-center mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto transition-colors"
        >
          <Printer size={20} />
          Print Registration Card
        </button>
      </div> */}

      {/* Registration Card */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-black print:border-black print:max-w-none print:mx-0">
        
        {/* Header */}
        <div className="text-center py-4 px-4 border-b border-black">
          <div className="w-20 h-10 bg-black rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-lg">
            HT
          </div>
          <div className="text-xs mb-1">KGEES</div>
          <div className="text-2xl font-bold tracking-wider mb-1">HILLTOWN</div>
          <div className="text-sm mb-2">HOTEL</div>
          <div className="text-lg font-bold">GUEST REGISTRATION CARD</div>
        </div>

        {/* GRC Number */}
        <div className="absolute ml-4 mt-2 text-xs font-semibold">
          GRC NO. : {guestData.grcNumber}
        </div>

        {/* Form Fields */}
        <div className="mt-8">
          
          {/* Row 1 */}
          <div className="flex border-b border-black">
            <div className="w-25 border-r border-t border-black p-2">
              <div className="text-xs font-bold mb-1">MRS/MS/MR.</div>
              <input
                type="text"
                value={guestData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-t border-black p-2">
              <div className="text-xs font-bold mb-1">SURNAME</div>
              <input
                type="text"
                value={guestData.surname}
                onChange={(e) => handleInputChange('surname', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-t border-black p-2">
              <div className="text-xs font-bold mb-1">FIRST NAME</div>
              <div className="text-sm">
                <input
                  type="text"
                  value={guestData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full border-none outline-none print:border-none"
                />
                <div className="text-xs">{guestData.gstNumber}</div>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="text-xs font-bold border-t border-black mb-1">PURPOSE OF VISIT</div>
              <input
                type="text"
                value={guestData.purposeOfVisit}
                onChange={(e) => handleInputChange('purposeOfVisit', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">COMPANY</div>
              <input
                type="text"
                value={guestData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="w-40 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">ARRIVED FROM</div>
              <input
                type="text"
                value={guestData.arrivedFrom}
                onChange={(e) => handleInputChange('arrivedFrom', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="w-40 p-2">
              <div className="text-xs font-bold mb-1">NEXT DESTINATION</div>
              <input
                type="text"
                value={guestData.nextDestination}
                onChange={(e) => handleInputChange('nextDestination', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">ADDRESS</div>
              <textarea
                value={guestData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full text-sm border-none outline-none resize-none print:border-none"
                rows="3"
              />
            </div>
            <div className="w-40 p-2">
              <div className="text-xs font-bold mb-1">DATE OF BIRTH</div>
              <input
                type="text"
                value={guestData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Email</div>
              <input
                type="email"
                value={guestData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Tel. No.</div>
              <input
                type="text"
                value={guestData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 p-2">
              <div className="text-xs font-bold mb-1">NATIONALITY</div>
              <input
                type="text"
                value={guestData.nationality}
                onChange={(e) => handleInputChange('nationality', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 5 - Passport Details */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Passport No.</div>
              <input
                type="text"
                value={guestData.passportNumber}
                onChange={(e) => handleInputChange('passportNumber', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Place of Issue</div>
              <input
                type="text"
                value={guestData.passportPlaceOfIssue}
                onChange={(e) => handleInputChange('passportPlaceOfIssue', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Date of Issue</div>
              <input
                type="text"
                value={guestData.passportDateOfIssue}
                onChange={(e) => handleInputChange('passportDateOfIssue', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Date of Expiry</div>
              <input
                type="text"
                value={guestData.passportDateOfExpiry}
                onChange={(e) => handleInputChange('passportDateOfExpiry', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="w-32 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">ARR. DATE</div>
              <input
                type="text"
                value={guestData.arrivalDate}
                onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="w-32 p-2">
              <div className="text-xs font-bold mb-1">DEP. DATE</div>
              <input
                type="text"
                value={guestData.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 6 - Visa Details */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Visa No.</div>
              <input
                type="text"
                value={guestData.visaNumber}
                onChange={(e) => handleInputChange('visaNumber', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Visa POI</div>
              <input
                type="text"
                value={guestData.visaPOI}
                onChange={(e) => handleInputChange('visaPOI', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Visa DOI</div>
              <input
                type="text"
                value={guestData.visaDOI}
                onChange={(e) => handleInputChange('visaDOI', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">Visa Exp. Dt</div>
              <input
                type="text"
                value={guestData.visaExpiryDate}
                onChange={(e) => handleInputChange('visaExpiryDate', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 p-2">
              <div className="text-xs font-bold mb-1">DATE OF ARRIVAL IN INDIA</div>
              <input
                type="text"
                value={guestData.dateOfArrivalInIndia}
                onChange={(e) => handleInputChange('dateOfArrivalInIndia', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Advance Details Header */}
          <div className="bg-gray-200 text-center py-2 border-b border-black">
            <div className="text-sm font-bold">ADVANCE DETAILS</div>
          </div>

          {/* Row 7 */}
          <div className="flex border-b border-black">
            <div className="w-full p-2">
              <div className="text-xs font-bold mb-1">PROPOSED DURATION OF STAY IN INDIA</div>
              <input
                type="text"
                value={guestData.proposedDuration}
                onChange={(e) => handleInputChange('proposedDuration', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 8 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">MODE OF PAYMENT</div>
              <input
                type="text"
                value={guestData.modeOfPayment}
                onChange={(e) => handleInputChange('modeOfPayment', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">AMOUNT</div>
              <input
                type="text"
                value={guestData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">RECEIPT NO.</div>
              <input
                type="text"
                value={guestData.receiptNumber}
                onChange={(e) => handleInputChange('receiptNumber', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 p-2">
              <div className="text-xs font-bold mb-1">CERT. OF REGISTRATION NUMBER</div>
              <input
                type="text"
                value={guestData.certOfRegistration}
                onChange={(e) => handleInputChange('certOfRegistration', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 9 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">REMARKS</div>
              <textarea
                value={guestData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                className="w-full text-sm border-none outline-none resize-none print:border-none"
                rows="2"
              />
            </div>
            <div className="w-40 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">PLACE OF ISSUE</div>
              <input
                type="text"
                value={guestData.placeOfIssue}
                onChange={(e) => handleInputChange('placeOfIssue', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="w-40 p-2">
              <div className="text-xs font-bold mb-1">DATE OF ISSUE</div>
              <input
                type="text"
                value={guestData.dateOfIssue}
                onChange={(e) => handleInputChange('dateOfIssue', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Row 10 */}
          <div className="flex border-b border-black">
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">ROOM RATE</div>
              <input
                type="text"
                value={guestData.roomRate}
                onChange={(e) => handleInputChange('roomRate', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 border-r border-black p-2">
              <div className="text-xs font-bold mb-1">PAX</div>
              <input
                type="text"
                value={guestData.pax}
                onChange={(e) => handleInputChange('pax', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
            <div className="flex-1 p-2">
              <div className="text-xs font-bold mb-1">ROOM NUMBER</div>
              <input
                type="text"
                value={guestData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                className="w-full text-sm border-none outline-none print:border-none"
              />
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 text-xs leading-relaxed">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="font-bold mb-2">Terms & Conditions</div>
                <p className="mb-3">
                  The above rate is subject to CGST 6% SGST 6%. Taxes are subject to change as per Government regulations without prior.
                </p>
                <p className="mb-3">
                  For your safety and security, a maximum of three visitors are allowed in the guest room from 09.00 hrs to 22.00 hrs only on producing valid ID proof with photo and address. Group parties and celebrations shall happen strictly in one of our restaurants.
                </p>
                <p>
                  Key card if lost would be provided at an additional charge
                </p>
              </div>
              <div className="flex-1">
                <p className="mb-3">
                  I agree to release my room(s) by 12 noon on the date of departure. Should I fail to checkout, I authorise the management to pack and remove my belongings to the hotel cloak room so that my room(s) will be available for incoming guests with confirmed reservations.
                </p>
                <p>
                  I agree that I am responsible for the full payment of my stay, In the event it is not paid by the company, organisation or person indicated
                </p>
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex border-t border-black">
            <div className="flex-1 border-r border-black p-4 text-center">
              <div className="font-bold text-sm">Front Desk</div>
            </div>
            <div className="flex-1 border-r border-black p-4 text-center">
              <div className="font-bold text-sm">Duty Manager</div>
            </div>
            <div className="flex-1 p-4 text-center">
              <div className="font-bold text-sm">GUEST SIGNATURE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:mx-0 { margin-left: 0 !important; margin-right: 0 !important; }
          .print\\:border-black { border-color: #000 !important; }
          .print\\:border-none { border: none !important; }
          body { margin: 0; }
          input, textarea { -webkit-print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
};

export default GuestRegistrationCard;