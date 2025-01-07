import React from "react";
import TitleDiv from "../../../../../components/common/TitleDiv";

const DespatchForm = () => {
  const formFields = [
    { name: "challanNo", placeholder: "Challan No" },
    { name: "containerNo", placeholder: "Container No" },
    { name: "despatchThrough", placeholder: "Despatch Through" },
    { name: "destination", placeholder: "Destination" },
    { name: "vehicleNo", placeholder: "Vehicle No" },
    { name: "orderNo", placeholder: "Order No" },
    { name: "termsOfPay", placeholder: "Terms Of Pay" },
    { name: "termsOfDelivery", placeholder: "Terms Of Delivery" },
  ];

  return (
    <>
      <TitleDiv title="Custom Despatch Title" from="/sUsers/VoucherSettings" />
      <div className="max-w-4xl mx-auto p-6 shadow-lg border mt-2">
        <div className="mt-2">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Despatch Details</h2>
          <div className="space-y-4">
            {formFields.map((field) => (
              <div key={field.name} className="flex items-center">
                <label className="w-36 font-medium text-sm text-gray-700">
                  {field.placeholder}:
                </label>
                <input
                  type="text"
                  name={field.name}
                  placeholder={field.placeholder}
                  className=" outline-none border-none !border-b  no-focus-box flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DespatchForm;
