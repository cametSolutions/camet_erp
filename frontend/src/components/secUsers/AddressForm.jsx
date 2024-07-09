/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AddressForm({ getFormData, newBillToShipTo, partyDetails }) {
  const navigate = useNavigate();

 

  console.log(partyDetails);
  console.log(newBillToShipTo);
  console.log(Object.keys(partyDetails).length);

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
      });
    } else {
      if (partyDetails && Object.keys(partyDetails).length === 0) {
        console.log("haii");
        navigate(-1);
      }
      if (partyDetails && Object.keys(partyDetails).length > 0) {
        const {
          partyName,
          gstNo,
          emailID,
          state_reference,
          mobileNumber,
          pincode,
          billingAddress,
          shippingAddress,
        } = partyDetails;
        setFormData({
          ...formData,
          billToName: partyName,
          billToAddress: billingAddress,
          billToPin: pincode,
          billToGst: gstNo,
          billToMobile: mobileNumber,
          billToEmail: emailID,
          billToSupply: state_reference,
          shipToName: partyName,
          shipToAddress: shippingAddress,
          shipToPin: pincode,
          shipToGst: gstNo,
          shipToMobile: mobileNumber,
          shipToEmail: emailID,
          shipToSupply: state_reference,
        });
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
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    // Handle form submission, e.g., save to database
    console.log("Form Data:", formData);
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
      if (field.value === "" ) {
        toast.error(field.message);
        return;
      }
    }
  
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const mobileRegex = /^\d{10}$/;
    const gstRegex = /^[0-9A-Za-z]{15}$/;
    const pinRegex = /^\d{6}$/;
  
    const validations = [
      { value: billToEmail, regex: emailRegex, message: "Invalid Bill To Email" },
      { value: shipToEmail, regex: emailRegex, message: "Invalid Ship To Email" },
      { value: billToMobile, regex: mobileRegex, message: "Bill To Mobile must be 10 digits" },
      { value: shipToMobile, regex: mobileRegex, message: "Ship To Mobile must be 10 digits" },
      { value: billToGst, regex: gstRegex, message: "Invalid Bill To GST" },
      { value: shipToGst, regex: gstRegex, message: "Invalid Ship To GST" },
      { value: billToPin, regex: pinRegex, message: "Invalid Bill To Pin" },
      { value: shipToPin, regex: pinRegex, message: "Invalid Ship To Pin" },
    ];
  
    for (const validation of validations) {
      if (!validation.regex.test(validation.value)) {
        toast.error(validation.message);
        return;
      }
    }
    getFormData(formData);
  };

  return (
    <div className="px-3">
      <div className="flex h-screen bg-gray-100">
        <div className="m-auto ">
          <div className="mt-5 bg-white rounded-t-lg shadow">
            <div className="flex">
              <div className="flex-1 py-5 pl-5 overflow-hidden">
                <svg
                  className="inline align-text-top"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                >
                  <g>
                    <path
                      d="m4.88889,2.07407l14.22222,0l0,20l-14.22222,0l0,-20z"
                      fill="none"
                      id="svg_1"
                      stroke="null"
                    ></path>
                    <path
                      d="m7.07935,0.05664c-3.87,0 -7,3.13 -7,7c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zm-5,7c0,-2.76 2.24,-5 5,-5s5,2.24 5,5c0,2.88 -2.88,7.19 -5,9.88c-2.08,-2.67 -5,-7.03 -5,-9.88z"
                      id="svg_2"
                    ></path>
                    <circle
                      cx="7.04807"
                      cy="6.97256"
                      r="2.5"
                      id="svg_3"
                    ></circle>
                  </g>
                </svg>
                <h1 className="inline text-2xl font-semibold leading-none">
                  Bill To
                </h1>
              </div>
            </div>
            <div className="px-5 pb-5">
              <label
                htmlFor="billToName"
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
                className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
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
                className="text-black placeholder-gray-600 w-full px-4 py-5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
              />
              <div className="flex">
                <div className="flex-grow w-2/4 pr-2">
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
                    className="text-black input-number placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
                <div className="flex-grow">
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
                    className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
              </div>
              <div className="flex">
                <div className="flex-grow w-2/4 pr-2">
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
                    className="text-black input-number placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
                <div className="flex-grow">
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
                    className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
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
                className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
              />
            </div>
          </div>

          <div className=" bg-white rounded-b-lg shadow">
            <div className="flex">
              <div className="flex-1 py-5 pl-5 overflow-hidden">
                <svg
                  className="inline align-text-top"
                  height="24px"
                  viewBox="0 0 24 24"
                  width="24px"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#000000"
                >
                  <g>
                    <path
                      d="m4.88889,2.07407l14.22222,0l0,20l-14.22222,0l0,-20z"
                      fill="none"
                      id="svg_1"
                      stroke="null"
                    ></path>
                    <path
                      d="m7.07935,0.05664c-3.87,0 -7,3.13 -7,7c0,5.25 7,13 7,13s7,-7.75 7,-13c0,-3.87 -3.13,-7 -7,-7zm-5,7c0,-2.76 2.24,-5 5,-5s5,2.24 5,5c0,2.88 -2.88,7.19 -5,9.88c-2.08,-2.67 -5,-7.03 -5,-9.88z"
                      id="svg_2"
                    ></path>
                    <circle
                      cx="7.04807"
                      cy="6.97256"
                      r="2.5"
                      id="svg_3"
                    ></circle>
                  </g>
                </svg>
                <h1 className="inline text-2xl font-semibold leading-none">
                  Ship To
                </h1>
              </div>
            </div>
            <div className="px-5 pb-5">
              <label
                htmlFor="shipToName"
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
                className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
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
                className="text-black placeholder-gray-600 w-full px-4 py-5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
              />
              <div className="flex">
                <div className="flex-grow w-2/4 pr-2">
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
                    className="text-black input-number placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
                <div className="flex-grow">
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
                    className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
              </div>
              <div className="flex">
                <div className="flex-grow w-2/4 pr-2">
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
                    className="input-number input-number text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
                  />
                </div>
                <div className="flex-grow">
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
                    className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
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
                className="text-black placeholder-gray-600 w-full px-4 py-2.5 mt-2 text-base transition duration-500 ease-in-out transform border-transparent rounded-lg bg-gray-200 focus:border-blueGray-500 focus:bg-white dark:focus:bg-gray-800 focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
              />

              <div className="pt-4 flex items-center space-x-4">
                <button
                  onClick={() => {
                    navigate(-1);
                  }}
                  className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none"
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
                  className="bg-violet-500 flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
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
