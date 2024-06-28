/* eslint-disable react/no-unknown-property */
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";

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
      {/* <div
        onClick={() => setOpen(!open)}
        className="bg-white mt-2 flex gap-2 items-center p-4 cursor-pointer"
      >
        <p className="text-sm font-bold">Despatch Details</p>
        {open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </div> */}
      <div className="p-4 bg-white mt-3 shadow-lg">
        <div className="flex items-center mb-2 gap-2 ">
          <p className="font-bold uppercase text-xs">Details</p>
          <span className="text-red-500 font-bold"> *</span>
        </div>

        <div className=" py-6 border  bg-white h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 ">
          <div
            onClick={() => setOpen(!open)}
            className="flex justify-center gap-2   hover_scale items-center  "
          >
            <IoMdAdd className="text-2xl" />
            <p className="text-md font-semibold">Despatch Details</p>
          </div>
        </div>
      </div>

      {open && (
        <div className="py-3 px-3 ">
          <div className="bg-white p-10  mx-auto">
            <form action="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-xs">
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
                    className=" input-field py-2 border-b-2 border-x-0 border-t-0 border-gray-400 outline-none shadow-none text-gray-600 placeholder-gray-400"
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field  py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field  py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col mb-5 col">
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field  py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field  py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className="input-field py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col col md:col-span-2 mb-5">
                  <label
                    htmlFor="termsOfPay"
                    className=" input-field mb-2 font-bold text-gray-600"
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
                  />
                </div>

                <div className="flex flex-col md:col-span-2 mb-5">
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
                    style={{
                      boxShadow: "none",
                      borderColor: "#b6b6b6",
                    }}
                    className=" input-field py-2 border-b-2 border-x-0 border-t-0 border-gray-400  text-gray-600 placeholder-gray-400 outline-none"
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
