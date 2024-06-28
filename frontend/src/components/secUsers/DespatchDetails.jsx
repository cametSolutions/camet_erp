/* eslint-disable react/no-unknown-property */
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { useState } from "react";

function DespatchDetails() {
  const [open, setOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    challanNo: "",
    containerNo: "",
    despatchThrough: "",
    destination: "",
    vehicleNo: "",
    orderNo: "",
    termsOfPay: "",
    termsOfDelivery: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  return (
    <div>
      <div
        onClick={() => setOpen(!open)}
        className="bg-white mt-2 flex gap-2 items-center p-4 cursor-pointer"
      >
        <p className="text-sm font-bold">Despatch Details</p>
        {open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </div>

      {open && (
        <div className="py-3 px-3 min-h-screen">
          <div className="bg-white p-10 md:w-3/4 lg:w-1/2 mx-auto">
            <form action="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="challanNo"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Challan No
                  </label>
                  <input
                    type="text"
                    id="challanNo"
                    name="challanNo"
                    placeholder="Challan No"
                    value={formValues.challanNo}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="containerNo"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Container No
                  </label>
                  <input
                    type="text"
                    id="containerNo"
                    name="containerNo"
                    placeholder="Container No"
                    value={formValues.containerNo}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="despatchThrough"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Despatch Through
                  </label>
                  <input
                    type="text"
                    id="despatchThrough"
                    name="despatchThrough"
                    placeholder="Despatch Through"
                    value={formValues.despatchThrough}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="destination"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Destination
                  </label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    placeholder="Destination"
                    value={formValues.destination}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="vehicleNo"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Vehicle No
                  </label>
                  <input
                    type="text"
                    id="vehicleNo"
                    name="vehicleNo"
                    placeholder="Vehicle No"
                    value={formValues.vehicleNo}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="orderNo"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Order No
                  </label>
                  <input
                    type="text"
                    id="orderNo"
                    name="orderNo"
                    placeholder="Order No"
                    value={formValues.orderNo}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="termsOfPay"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Terms of Pay
                  </label>
                  <input
                    type="text"
                    id="termsOfPay"
                    name="termsOfPay"
                    placeholder="Terms of Pay"
                    value={formValues.termsOfPay}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5">
                  <label
                    htmlFor="termsOfDelivery"
                    className="mb-2 font-bold text-gray-600"
                  >
                    Terms of Delivery
                  </label>
                  <input
                    type="text"
                    id="termsOfDelivery"
                    name="termsOfDelivery"
                    placeholder="Terms of Delivery"
                    value={formValues.termsOfDelivery}
                    onChange={handleInputChange}
                    className="py-2 border-b-2 border-gray-400 focus:border-green-400 text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DespatchDetails;
