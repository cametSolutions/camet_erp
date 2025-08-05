/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import uploadImageToCloudinary from "../../../../../../../utils/uploadCloudinary";

export const WarrantyCardForm = ({
  initialData = null,
  onSubmit,
  isEditMode = false,
  loading = false,
}) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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
      image: null,
    },
  });


  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key]);
      });
      
      // If there's an existing image URL, set it as preview
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData, isEditMode, setValue]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setValue("image", null);
    // Reset file input
    const fileInput = document.getElementById("image");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      setUploadingImage(true);
      
      let imageData = null;
      
      // Upload image to Cloudinary if a new image is selected
      if (selectedImage) {
        const uploadResult = await uploadImageToCloudinary(selectedImage);
        imageData = {
          imageUrl: uploadResult.secure_url,
          imagePublicId: uploadResult.public_id,
        };
      } else if (isEditMode && initialData?.imageUrl) {
        // Keep existing image data if no new image is selected in edit mode
        imageData = {
          imageUrl: initialData.imageUrl,
          imagePublicId: initialData.imagePublicId,
        };
      }

      // Prepare final data with image information
      const finalData = {
        ...data,
        ...imageData,
      };

      // Remove the file object from data as we now have the URL and ID
      delete finalData.image;

      console.log("Final form data:", finalData);

      if (onSubmit) {
        await onSubmit(finalData);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      // You might want to show an error message to the user here
    } finally {
      setUploadingImage(false);
    }
  };

  const formTitle = isEditMode ? "Edit Warranty Card" : "Add Warranty Card";
  const submitButtonText = isEditMode
    ? "Update Warranty Card"
    : "Add Warranty Card";

  const isSubmitting = loading || uploadingImage;

  return (
    <div className="border mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{formTitle}</h2>

      <div className="space-y-6">
        {/* Name Field */}
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
            {...register("name", { required: "Name is required" })}
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter warranty card name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors?.name?.message}</p>
          )}
        </div>

        {/* Image Upload Field */}
        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Warranty Card Image
          </label>
          
          {!imagePreview ? (
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded-md border border-gray-300"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isSubmitting}
                className="absolute top-[-10px] left-52 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-500"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="mt-2">
                <label
                  htmlFor="image"
                  className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                >
                  Change Image
                  <input
                    id="image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
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
              })}
              className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={isSubmitting}
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
              className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={isSubmitting}
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
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2 Years Warranty"
            disabled={isSubmitting}
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
                if (value && value?.length > 5000) {
                  return "Terms and conditions should not exceed 5000 characters";
                }
              },
            })}
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter terms and conditions..."
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            className="no-focus-box w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer care number"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {uploadingImage
              ? "Uploading Image..."
              : loading
              ? "Processing..."
              : submitButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
