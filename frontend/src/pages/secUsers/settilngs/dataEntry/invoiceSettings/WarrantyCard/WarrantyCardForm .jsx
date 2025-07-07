/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export const WarrantyCardForm = ({
  initialData = null,
  onSubmit,
  isEditMode = false,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      warrantyYears: "0",
      warrantyMonths: "0",
      displayInput: "",
      termsAndConditions: "",
      customerCareInfo: "",
      customerCareNo: "",
    },
  });

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key]);
      });
    }
  }, [initialData, isEditMode, setValue]);

  const handleFormSubmit = (data) => {
    // Handle file upload - convert FileList to File object

    console.log(data);
    

    if (onSubmit) {
      onSubmit(data);
    }
  };

  const formTitle = isEditMode ? "Edit Warranty Card" : "Add Warranty Card";
  const submitButtonText = isEditMode
    ? "Update Warranty Card"
    : "Add Warranty Card";

  return (
    <div className="border mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{formTitle}</h2>

      <div className="space-y-6">
        {/* Type Field */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Type is required" })}
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter warranty card name"
            disabled={loading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors?.name?.message}</p>
          )}
        </div>

        {/* Warranty Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="warrantyYears"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Warranty Years *
            </label>
            <input
              type="number"
              id="warrantyYears"
              min="0"
              {...register("warrantyYears", {
                valueAsNumber: true,
                validate: (value) => {
                  if (value === undefined || value === null || value === "")
                    return true;
                  if (value < 0) return "Years must be 0 or greater";
                  return true;
                },
                // required: "Warranty years is required",
                // min: { value: 0, message: "Years must be 0 or greater" },
              })}
              className=" no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={loading}
            />
            {errors.warrantyYears && (
              <p className="mt-1 text-sm text-red-600">
                {errors.warrantyYears.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="warrantyMonths"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Warranty Months *
            </label>
            <input
              type="number"
              id="warrantyMonths"
              min="0"
              max="11"
              {...register("warrantyMonths", {
                valueAsNumber: true,
                validate: (value) => {
                  if (value === undefined || value === null || value === "")
                    return true;
                  if (value < 0) return "Months must be 0 or greater";
                  if (value > 11) return "Months must be less than 12";
                  return true;
                },
              })}
              className=" no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={loading}
            />
            {errors.warrantyMonths && (
              <p className="mt-1 text-sm text-red-600">
                {errors.warrantyMonths.message}
              </p>
            )}
          </div>
        </div>

        {/* Display Input */}
        <div>
          <label
            htmlFor="displayInput"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Display Input (What should be displayed as year) *
          </label>
          <input
            type="text"
            id="displayInput"
            {...register("displayInput")}
            className=" no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2 Years Warranty"
            disabled={loading}
          />
          {errors.displayInput && (
            <p className="mt-1 text-sm text-red-600">
              {errors.displayInput.message}
            </p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <label
            htmlFor="termsAndConditions"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Terms and Conditions *
          </label>
          <textarea
            id="termsAndConditions"
            rows="6"
            {...register("termsAndConditions", {
              validate: (value) => {
                if (value && value?.length > 10) {
                  return "Terms and conditions should not exceed 5000 characters";
                }
              },
            })}
            className=" no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter terms and conditions..."
            disabled={loading}
          />
          {errors.termsAndConditions && (
            <p className="mt-1 text-sm text-red-600">
              {errors.termsAndConditions.message}
            </p>
          )}
        </div>

        {/* Customer Care Info */}
        <div>
          <label
            htmlFor="customerCareInfo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Customer Care Info *
          </label>
          <textarea
            id="customerCareInfo"
            rows="4"
            {...register("customerCareInfo", {
              validate: (value) => {
                if (value && value?.length > 2000) {
                  return "Customer care info should not exceed 2000 characters";
                }
              },
            })}
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter customer care information..."
            disabled={loading}
          />
          {errors.customerCareInfo && (
            <p className="mt-1 text-sm text-red-600">
              {errors.customerCareInfo.message}
            </p>
          )}
        </div>

        {/* Customer Care Number */}
        <div>
          <label
            htmlFor="customerCareNo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Customer Care Number *
          </label>
          <input
            type="text"
            id="customerCareNo"
            {...register("customerCareNo", {
             validate: (value) => {
                if (value && value?.length > 50) {
                  return "Customer care number should not exceed 50 characters";
                }
              },
            })}
            className=" no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer care number"
            disabled={loading}
          />
          {errors.customerCareNo && (
            <p className="mt-1 text-sm text-red-600">
              {errors.customerCareNo.message}
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={loading}
            className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
