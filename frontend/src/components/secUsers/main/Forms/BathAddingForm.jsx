/* eslint-disable no-prototype-builtins */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import api from "../../../../api/api";

const schema = z.object({
  batchName: z.string().min(1, "Batch name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Price must be a positive number"
    ),
  expDate: z
    .date()
    .refine(
      (date) => date > new Date(),
      "Expiration date must be in the future"
    ),
  manufDate: z
    .date()
    .refine(
      (date) => date <= new Date(),
      "Manufacture date cannot be in the future"
    ),
  openingStock: z
    .string()
    .min(1, "Opening stock is required")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) >= 0,
      "Opening stock cannot be negative"
    ),
  quantity: z
    .string()
    .min(1, "Quantity is required")
    .refine(
      (val) => !isNaN(parseInt(val)) && parseInt(val) > 0,
      "Quantity must be a positive number"
    ),
  godown: z.string()
  // godown_id can be added here if you need to validate it
});

function BathAddingForm({ onSave }) {
  const [formData, setFormData] = useState({
    batchName: "",
    price: "",
    expDate: new Date(),
    manufDate: new Date(),
    openingStock: "0",
    quantity: "",
    godown: "",
    godown_id: "",
  });

  const [godowns, setGodowns] = useState([]);

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const getSubDetails = async () => {
    try {
      const res = await api.get(
        `/api/pUsers/getProductSubDetails/${orgId}?type=${"godown"}`,
        {
          withCredentials: true,
        }
      );

      setGodowns(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getSubDetails();
  }, [orgId]);

  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    try {
      const fieldSchema = schema.shape[name];
      fieldSchema.parse(value);
      return "";
    } catch (error) {
      return error.errors[0].message;
    }
  };

  // console.log(godowns);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "godown") {
      const selectedGodown = godowns?.find((g) => g?._id === value);

      setFormData((prev) => ({
        ...prev,
        godown: selectedGodown?.godown,
        godown_id: selectedGodown?._id || "", // Avoid errors by defaulting to empty string
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Only validate if the field exists in the schema
    if (schema.shape.hasOwnProperty(name)) {
      const errorMessage = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: errorMessage,
      }));
    }
  };


  const handleDateChange = (date, name) => {
    setFormData((prev) => ({ ...prev, [name]: date }));

    const errorMessage = validateField(name, date);
    setErrors((prev) => ({
      ...prev,
      [name]: errorMessage,
    }));
  };

  const validate = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (schema.shape.hasOwnProperty(key)) {
        const errorMessage = validateField(key, formData[key]);
        if (errorMessage) {
          newErrors[key] = errorMessage;
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:w-[500px] sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-3 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-5">
              <div className="h-14 w-14 bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">
                i
              </div>
              <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                <h2 className="leading-relaxed">Add Inventory Batch</h2>
                <p className="text-sm text-gray-500 font-normal leading-relaxed">
                  Please enter the item details.
                </p>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              <form
                onSubmit={handleSubmit}
                className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7"
              >
                <div className="flex flex-col">
                  <label className="leading-loose">Batch Name</label>
                  <input
                    type="text"
                    name="batchName"
                    value={formData.batchName}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Batch name"
                  />
                  {errors.batchName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.batchName}
                    </p>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="leading-loose">Select Godown</label>
                  <select
                    name="godown"
                    value={formData.godown_id}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                  >
                    <option value="">Select Godown</option>
                    {godowns.map((godown) => (
                      <option key={godown._id} value={godown._id}>
                        {godown.godown}
                      </option>
                    ))}
                  </select>
                  {errors.godown && (
                    <p className="text-red-500 text-sm mt-1">{errors.godown}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Price"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-3">
                  <div className="flex flex-col sm:w-1/2">
                    <label className="leading-loose">Expiration Date</label>
                    <DatePicker
                      selected={formData.expDate}
                      onChange={(date) => handleDateChange(date, "expDate")}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                    {errors.expDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.expDate}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:w-1/2">
                    <label className="leading-loose">Manufacture Date</label>
                    <DatePicker
                      selected={formData.manufDate}
                      onChange={(date) => handleDateChange(date, "manufDate")}
                      className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    />
                    {errors.manufDate && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.manufDate}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Opening Stock</label>
                  <input
                  disabled
                    type="number"
                    name="openingStock"
                    value={formData.openingStock}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Opening stock"
                  />
                  {errors.openingStock && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.openingStock}
                    </p>
                  )}
                </div>
                <div className="flex flex-col">
                  <label className="leading-loose">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600"
                    placeholder="Quantity"
                  />
                  {errors.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.quantity}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex items-center space-x-4">
                  <button
                    type="submit"
                    className="flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none"
                    style={{ background: "rgb(34 197 94)" }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BathAddingForm;
