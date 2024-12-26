/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaLocationDot } from "react-icons/fa6";
import Select from "react-select"; // Import React Select
import { useLocation } from "react-router-dom";

function AddressForm({ getFormData, newBillToShipTo, partyDetails }) {
  const location = useLocation();
  let useCompanyAddress = false;

  if (location?.pathname.includes("billToPurchase")) {
    useCompanyAddress = true;
  }

  const partyList = useSelector((state) => state?.partySlice?.allParties);
  const {
    name: companyName,
    email: companyEmail,
    mobile: companyMobile,
    pin: companyPin,
    gstNum: companyGst,
    state: companyState,
    flat: companyFlat,
    landmark: companyLandmark,
    road: companyRoad,
  } = useSelector((state) => state?.secSelectedOrganization?.secSelectedOrg) ||
  {};

  const navigate = useNavigate();
  useEffect(() => {
    if (Object.keys(newBillToShipTo).length > 0) {
      const {
        billToName,
        billToAddress,
        billToPin,
        billToGst,
        billToMobile,
        billToEmail,
        billToSupply,
        shipToName,
        shipToAddress,
        shipToPin,
        shipToGst,
        shipToMobile,
        shipToEmail,
        shipToSupply,
        billToParty,
        shipToParty,
      } = newBillToShipTo;
      setFormData({
        ...formData,
        billToName,
        billToAddress,
        billToPin,
        billToGst,
        billToMobile,
        billToEmail,
        billToSupply,
        shipToName,
        shipToAddress,
        shipToPin,
        shipToGst,
        shipToMobile,
        shipToEmail,
        shipToSupply,
        billToParty,
        shipToParty,
      });
    } else {
      if (partyDetails && Object.keys(partyDetails).length === 0) {
        navigate(-1);
      }
      if (partyDetails && Object.keys(partyDetails).length > 0) {
        const {
          partyName,
          gstNo,
          emailID,
          // state_reference,
          mobileNumber,
          pin,
          billingAddress,
          shippingAddress,
          state,
        } = partyDetails;
        /// add company address as default ship to address for purchase

        if (useCompanyAddress) {
          setFormData({
            ...formData,
            billToName: partyName,
            billToAddress: billingAddress,
            billToPin: pin,
            billToGst: gstNo,
            billToMobile: mobileNumber,
            billToEmail: emailID,
            billToSupply: state,
            shipToName: companyName,
            shipToAddress:
              companyFlat + "," + companyLandmark + "," + companyRoad,
            shipToPin: companyPin,
            shipToGst: companyGst,
            shipToMobile: companyMobile,
            shipToEmail: companyEmail,
            shipToSupply: companyState,
          });
        } else {
          setFormData({
            ...formData,
            billToName: partyName,
            billToAddress: billingAddress,
            billToPin: pin,
            billToGst: gstNo,
            billToMobile: mobileNumber,
            billToEmail: emailID,
            billToSupply: state,
            shipToName: partyName,
            shipToAddress: shippingAddress,
            shipToPin: pin,
            shipToGst: gstNo,
            shipToMobile: mobileNumber,
            shipToEmail: emailID,
            shipToSupply: state,
          });
        }
      }
    }
  }, [partyDetails]);

  const [formData, setFormData] = useState({
    billToName: "",
    billToAddress: "",
    billToPin: "",
    billToGst: "",
    billToMobile: "",
    billToEmail: "",
    billToSupply: "",
    shipToName: "",
    shipToAddress: "",
    shipToPin: "",
    shipToGst: "",
    shipToMobile: "",
    shipToEmail: "",
    shipToSupply: "",
    billToParty: "",
    shipToParty: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    const commonData = {
      ...formData,
      [actionMeta.name]: selectedOption,
    };

    const selectedParty = partyList.find(
      (party) => party._id === selectedOption.value
    );
    if (selectedParty) {
      if (actionMeta.name === "billToParty") {
        setFormData({
          ...commonData,

          // billToParty: selectedParty._id,
          billToName: selectedParty.partyName,
          billToAddress: selectedParty.billingAddress,
          billToPin: selectedParty.pincode,
          billToGst: selectedParty.gstNo,
          billToMobile: selectedParty.mobileNumber,
          billToEmail: selectedParty.emailID,
          billToSupply: selectedParty.state_reference,
        });
      } else {
        setFormData({
          ...commonData,

          // shipToParty: selectedParty._id,
          shipToName: selectedParty.partyName,
          shipToAddress: selectedParty.shippingAddress,
          shipToPin: selectedParty.pincode,
          shipToGst: selectedParty.gstNo,
          shipToMobile: selectedParty.mobileNumber,
          shipToEmail: selectedParty.emailID,
          shipToSupply: selectedParty.state_reference,
        });
      }
    }
  };

  const partyOptions = partyList?.map((party) => ({
    value: party._id,
    label: party.partyName,
  }));

  console.log("partyList", partyList);
  console.log("partyOptions", partyOptions);

  const handleSubmit = () => {
    // Handle form submission, e.g., save to database
    const {
      billToName,
      billToAddress,
      billToPin,
      billToGst,
      billToMobile,
      billToEmail,
      billToSupply,
      shipToName,
      shipToAddress,
      shipToPin,
      shipToGst,
      shipToMobile,
      shipToEmail,
      shipToSupply,
      // billToParty,
      // shipToParty,
    } = formData;
    const requiredFields = [
      { value: billToName, message: "Bill To Name is required" },
      { value: billToAddress, message: "Bill To Address is required" },
      { value: billToPin, message: "Bill To Pin is required" },
      { value: billToGst, message: "Bill To GST is required" },
      { value: billToMobile, message: "Bill To Mobile is required" },
      { value: billToEmail, message: "Bill To Email is required" },
      { value: billToSupply, message: "Bill To Supply is required" },
      { value: shipToName, message: "Ship To Name is required" },
      { value: shipToAddress, message: "Ship To Address is required" },
      { value: shipToPin, message: "Ship To Pin is required" },
      { value: shipToGst, message: "Ship To GST is required" },
      { value: shipToMobile, message: "Ship To Mobile is required" },
      { value: shipToEmail, message: "Ship To Email is required" },
      { value: shipToSupply, message: "Ship To Supply is required" },
    ];

    for (const field of requiredFields) {
      if (field.value === null) {
        setFormData((prev) => ({
          ...prev,
          field: "",
        }));

        return;
      }
    }

    getFormData(formData);
  };

  // console.log("party",formData);

  return (
    <div className="md:px-6">
      <div className="flex    gap-6 ">
        <div className="w-full  ">
          <div className="mt-5 bg-gray-50 rounded-t-lg shadow p-3 sm:p-6">
            <div className="flex">
              <div className="flex gap-2 items-center py-5 pl-5 overflow-hidden">
                <FaLocationDot className="w-6 h-6 text-red-800" />
                <h1 className="inline text-2xl text-blue-400 font-bold  leading-none">
                  Bill To
                </h1>
              </div>
            </div>

            <div className="px-5 pb-5">
              <label className="block text-sm font-medium text-gray-700 ">
                Select Party
              </label>
              <Select
                name="billToParty"
                value={formData.billToParty}
                options={partyOptions}
                onChange={handleSelectChange}
                placeholder="Select a party"
                className="mt-2 mb-3 no-focus-box border-0 border-b"
              />
              <label
                htmlFor="billToParty"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="billToName"
                name="billToName"
                value={formData.billToName}
                onChange={handleInputChange}
                placeholder="Name"
                className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-b border-gray-400 rounded-none outline-none focus:border-b-black "
              />

              <label
                htmlFor="billToAddress"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Address
              </label>
              <textarea
                id="billToAddress"
                name="billToAddress"
                value={formData.billToAddress}
                onChange={handleInputChange}
                placeholder="Address"
                className="text-black no-focus-box placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base border-0 border-b border-gray-400 focus:border-b-black "
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <div className=" w-full sm:w-2/4  pr-2">
                  <label
                    htmlFor="billToPin"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Pin
                  </label>
                  <input
                    id="billToPin"
                    name="billToPin"
                    type="number"
                    value={formData.billToPin}
                    onChange={handleInputChange}
                    placeholder="Pin"
                    className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-0 border-b   no-focus-box border-gray-400 rounded-none outline-none focus:border-b-black "
                  />
                </div>
                <div className="flex-grow w-full sm:w-2/4">
                  <label
                    htmlFor="billToGst"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Gst No.
                  </label>
                  <input
                    id="billToGst"
                    name="billToGst"
                    value={formData.billToGst}
                    onChange={handleInputChange}
                    placeholder="Gst No."
                    className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform  no-focus-box   border-0 border-b outline-none "
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className=" w-full sm:w-2/4 pr-2">
                  <label
                    htmlFor="billToMobile"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Mobile
                  </label>
                  <input
                    id="billToMobile"
                    name="billToMobile"
                    value={formData.billToMobile}
                    onChange={handleInputChange}
                    placeholder="Mobile"
                    type="number"
                    className="text-black input-number placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none "
                  />
                </div>
                <div className="w-full sm:w-2/4">
                  <label
                    htmlFor="billToEmail"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Email
                  </label>
                  <input
                    id="billToEmail"
                    name="billToEmail"
                    value={formData.billToEmail}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
                  />
                </div>
              </div>
              <label
                htmlFor="billToSupply"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Place Of Supply
              </label>
              <input
                id="billToSupply"
                name="billToSupply"
                value={formData.billToSupply}
                onChange={handleInputChange}
                placeholder="Place Of Supply"
                className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
              />
            </div>
          </div>

          <div className=" mt-6 bg-gray-50 rounded-b-lg shadow p-3 sm:p-6">
            <div className="flex">
              <div className="flex gap-2 items-center py-5 pl-5 overflow-hidden  ">
                <FaLocationDot className="w-6 h-6 text-red-800" />
                <h1 className="inline text-2xl text-blue-400 font-bold  leading-none">
                  Ship To
                </h1>
              </div>
            </div>
            <div className="px-5 pb-5">
              <label className="block text-sm font-medium text-gray-700 ">
                Select Party
              </label>
              <Select
                name="shipToParty"
                value={formData.shipToParty}
                options={partyOptions}
                onChange={handleSelectChange}
                placeholder="Select a party"
                className="mt-2 mb-3 no-focus-box border-0 border-b"
              />
              <label
                htmlFor="shipToParty"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="shipToName"
                name="shipToName"
                value={formData.shipToName}
                onChange={handleInputChange}
                placeholder="Name"
                className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
              />
              <label
                htmlFor="shipToAddress"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Address
              </label>
              <textarea
                id="shipToAddress"
                name="shipToAddress"
                value={formData.shipToAddress}
                onChange={handleInputChange}
                placeholder="Address"
                className="text-black placeholder-gray-600 w-full px-2 py-5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="  w-full sm:w-2/4 pr-2">
                  <label
                    htmlFor="shipToPin"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Pin
                  </label>
                  <input
                    id="shipToPin"
                    name="shipToPin"
                    type="number"
                    value={formData.shipToPin}
                    onChange={handleInputChange}
                    placeholder="Pin"
                    className="text-black input-number placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
                  />
                </div>
                <div className=" w-full sm:w-2/4">
                  <label
                    htmlFor="shipToGst"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Gst No.
                  </label>
                  <input
                    id="shipToGst"
                    name="shipToGst"
                    value={formData.shipToGst}
                    onChange={handleInputChange}
                    placeholder="Gst No."
                    className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className=" w-full sm:w-2/4 pr-2">
                  <label
                    htmlFor="shipToMobile"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Mobile
                  </label>
                  <input
                    id="shipToMobile"
                    name="shipToMobile"
                    type="number"
                    value={formData.shipToMobile}
                    onChange={handleInputChange}
                    placeholder="Mobile"
                    className="input-number input-number text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
                  />
                </div>
                <div className="w-full sm:w-2/4 pr-2">
                  <label
                    htmlFor="shipToEmail"
                    className="block text-sm font-medium text-gray-700 mt-4"
                  >
                    Email
                  </label>
                  <input
                    id="shipToEmail"
                    name="shipToEmail"
                    value={formData.shipToEmail}
                    onChange={handleInputChange}
                    placeholder="Email"
                    className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
                  />
                </div>
              </div>
              <label
                htmlFor="shipToSupply"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Place Of Supply
              </label>
              <input
                id="shipToSupply"
                name="shipToSupply"
                value={formData.shipToSupply}
                onChange={handleInputChange}
                placeholder="Place Of Supply"
                className="text-black placeholder-gray-600 w-full px-2 py-2.5 mt-2 text-base no-focus-box border-0 border-b  outline-none"
              />

              <div className="pt-4 flex items-center space-x-4 mt-10">
                <button
                  onClick={() => {
                    navigate(-1);
                  }}
                  className="flex justify-center items-center w-full text-gray-900 px-2 py-3 rounded-md focus:outline-none "
                >
                  <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    ></path>
                  </svg>{" "}
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="bg-pink-500 flex justify-center items-center w-full text-white px-2 py-3 rounded-md focus:outline-none"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddressForm;
