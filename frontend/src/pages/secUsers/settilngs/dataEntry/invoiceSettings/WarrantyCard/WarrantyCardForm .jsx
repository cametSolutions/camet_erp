/* eslint-disable react/prop-types */
import  { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export const WarrantyCardForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel,
  isEditMode = false,
  isLoading = false 
}) => {
  const { register, handleSubmit,  setValue, formState: { errors } } = useForm({
    defaultValues: {
      type: '',
      warrantyYears: '',
      warrantyMonths: '',
      displayInput: '',
      termsAndConditions: '',
      customerCareInfo: '',
      customerCareNo: ''
    }
  });

  // Populate form with initial data when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      Object.keys(initialData).forEach(key => {
        // if (key !== 'logo') {
        //   setValue(key, initialData[key]);
        // }
      });
    }
  }, [initialData, isEditMode, setValue]);

  const handleFormSubmit = (data) => {
    // Handle file upload - convert FileList to File object
    const formData = {
      ...data,
    };
    
    if (onSubmit) {
      onSubmit(formData);
    }
  };



  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const formTitle = isEditMode ? 'Edit Warranty Card' : 'Add Warranty Card';
  const submitButtonText = isEditMode ? 'Update Warranty Card' : 'Add Warranty Card';

  return (
    
    <div className="border mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{formTitle}</h2>
      
      <div className="space-y-6">
        {/* Type Field */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <input
            type="text"
            id="type"
            {...register('type', { required: 'Type is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter warranty type"
            disabled={isLoading}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

   

        {/* Warranty Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="warrantyYears" className="block text-sm font-medium text-gray-700 mb-2">
              Warranty Years *
            </label>
            <input
              type="number"
              id="warrantyYears"
              min="0"
              {...register('warrantyYears', { 
                required: 'Warranty years is required',
                min: { value: 0, message: 'Years must be 0 or greater' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={isLoading}
            />
            {errors.warrantyYears && (
              <p className="mt-1 text-sm text-red-600">{errors.warrantyYears.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="warrantyMonths" className="block text-sm font-medium text-gray-700 mb-2">
              Warranty Months *
            </label>
            <input
              type="number"
              id="warrantyMonths"
              min="0"
              max="11"
              {...register('warrantyMonths', { 
                required: 'Warranty months is required',
                min: { value: 0, message: 'Months must be 0 or greater' },
                max: { value: 11, message: 'Months must be less than 12' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              disabled={isLoading}
            />
            {errors.warrantyMonths && (
              <p className="mt-1 text-sm text-red-600">{errors.warrantyMonths.message}</p>
            )}
          </div>
        </div>

        {/* Display Input */}
        <div>
          <label htmlFor="displayInput" className="block text-sm font-medium text-gray-700 mb-2">
            Display Input (What should be displayed as year) *
          </label>
          <input
            type="text"
            id="displayInput"
            {...register('displayInput', { required: 'Display input is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2 Years Warranty"
            disabled={isLoading}
          />
          {errors.displayInput && (
            <p className="mt-1 text-sm text-red-600">{errors.displayInput.message}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div>
          <label htmlFor="termsAndConditions" className="block text-sm font-medium text-gray-700 mb-2">
            Terms and Conditions *
          </label>
          <textarea
            id="termsAndConditions"
            rows="6"
            {...register('termsAndConditions', { required: 'Terms and conditions are required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter terms and conditions..."
            disabled={isLoading}
          />
          {errors.termsAndConditions && (
            <p className="mt-1 text-sm text-red-600">{errors.termsAndConditions.message}</p>
          )}
        </div>

        {/* Customer Care Info */}
        <div>
          <label htmlFor="customerCareInfo" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Care Info *
          </label>
          <textarea
            id="customerCareInfo"
            rows="4"
            {...register('customerCareInfo', { required: 'Customer care info is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Enter customer care information..."
            disabled={isLoading}
          />
          {errors.customerCareInfo && (
            <p className="mt-1 text-sm text-red-600">{errors.customerCareInfo.message}</p>
          )}
        </div>

        {/* Customer Care Number */}
        <div>
          <label htmlFor="customerCareNo" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Care Number *
          </label>
          <input
            type="text"
            id="customerCareNo"
            {...register('customerCareNo', { required: 'Customer care number is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter customer care number"
            disabled={isLoading}
          />
          {errors.customerCareNo && (
            <p className="mt-1 text-sm text-red-600">{errors.customerCareNo.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleSubmit(handleFormSubmit)}
            disabled={isLoading}
            className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : submitButtonText}
          </button>
          
          

          {onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 disabled:bg-red-400 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
