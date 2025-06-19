/* eslint-disable no-prototype-builtins */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect, useCallback } from "react";
import { MdDelete, MdPlaylistAdd } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import { units } from "../../../../constants/units";
import api from "../../../api/api";

function AddProductForm({
  orgId,
  submitData,
  productData = {},
  setLoading = () => {},
  loading,
  process = "add",
  formState,
  setFormState = () => {},
}) {
  // State management
  const [tab, setTab] = useState("priceLevel");
  // const [formState, setFormState] = useState({
  //   product_name: "",
  //   product_code: "",
  //   unit: "",
  //   altUnit: "",
  //   balance_stock: "",
  //   alt_unit_conversion: "",
  //   unit_conversion: "",
  //   hsn_code: "",
  //   cgst: 0,
  //   sgst: 0,
  //   igst: 0,
  //   cess: 0,
  //   addl_cess: 0,
  //   purchase_price: "",
  //   purchase_cost: "",
  //   item_mrp: 0,
  //   selectedBrand: null,
  //   selectedCategory: null,
  //   selectedSubcategory: null,
  //   batchEnabled: false,
  // });

  // Options data
  const [optionsData, setOptionsData] = useState({
    hsn: [],
    brand: [],
    category: [],
    subcategory: [],
    godown: "",
    priceLevel: [],
  });

  // Dynamic table priceLevelRows
  const [priceLevelRows, setPriceLevelRows] = useState([
    { pricelevel: "", pricerate: "" },
  ]);
  const [locationRows, setLocationRows] = useState([]);
  const [defaultGodown, setDefaultGodown] = useState(null);

  // Get godown enable status from Redux store
  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const { batchEnabled: isBatchEnabledInCompany = false, gdnEnabled = false } =
    configurations[0] || {};

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "hsn_code") {
      const hsnDetails = optionsData.hsn.find((hsn) => hsn?.hsn === value);

      if (hsnDetails) {
        const igst = Number(hsnDetails?.igstRate) || 0;
        const cgst = Number(hsnDetails?.cgstRate) || 0;
        const sgst = Number(hsnDetails?.sgstUtgstRate) || 0;
        const cess = Number(hsnDetails?.onValue) || 0;
        const addl_cess = Number(hsnDetails?.onQuantity) || 0;

        setFormState((prev) => ({
          ...prev,
          [name]: value,
          igst,
          cgst,
          sgst,
          cess,
          addl_cess,
        }));
      }
    } else {
      const processedValue =
        type === "number" ? (value === "" ? "" : Number(value)) : value;

      setFormState((prev) => ({
        ...prev,
        [name]: processedValue,
      }));
    }
  };

  /// handle hsn input

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Initialize form data from productData
  useEffect(() => {
    if (Object.keys(productData)?.length > 0) {
      const {
        product_name,
        product_code,
        balance_stock,
        brand,
        category,
        sub_category,
        unit,
        alt_unit,
        unit_conversion,
        alt_unit_conversion,
        hsn_code,
        cgst,
        sgst,
        igst,
        cess,
        addl_cess,
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled,
      } = productData;

      setFormState({
        product_name: product_name || "",
        product_code: product_code || "",
        unit: unit || "",
        altUnit: alt_unit || "",
        balance_stock: balance_stock || "",
        alt_unit_conversion: alt_unit_conversion || "",
        unit_conversion: unit_conversion || "",
        hsn_code: hsn_code || "",
        cgst: cgst || 0,
        sgst: sgst || 0,
        igst: igst || 0,
        cess: cess || 0,
        addl_cess: addl_cess || 0,
        purchase_price: purchase_price || "",
        purchase_cost: purchase_cost || "",
        item_mrp: item_mrp || 0,
        selectedBrand: brand || null,
        selectedCategory: category || null,
        selectedSubcategory: sub_category || null,
        batchEnabled: isBatchEnabledInCompany ? batchEnabled : false,
      });

      // Initialize price level priceLevelRows
      if (Priceleveles?.length > 0) {
        setPriceLevelRows(Priceleveles);
      } else {
        setPriceLevelRows([{ pricelevel: "", pricerate: "" }]);
      }
      if (GodownList.length > 0) {
        setLocationRows(GodownList);
      } else {
        setLocationRows([
          {
            godown: defaultGodown,
            batch: "Primary Batch",
            balance_stock: 0,
          },
        ]);
      }
    }
  }, [productData, isBatchEnabledInCompany]);

  // Fetch all required data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      const subDetailsPromise = api.get(
        `/api/sUsers/getAllSubDetails/${orgId}`,
        {
          withCredentials: true,
        }
      );

      const hsnResPromise = api.get(`/api/sUsers/fetchHsn/${orgId}`, {
        withCredentials: true,
      });

      const [subDetailsRes, hsnRes] = await Promise.all([
        subDetailsPromise,
        hsnResPromise,
      ]);

      const { brands, categories, subcategories, godowns, priceLevels } =
        subDetailsRes.data.data;

      setOptionsData((prev) => ({
        ...prev,
        brand: brands,
        category: categories,
        subcategory: subcategories,
        godown: godowns,
        priceLevel: priceLevels,
      }));

      // Set default godown
      const defaultGodown = godowns.find((g) => g?.defaultGodown === true);
      if (defaultGodown) {
        setDefaultGodown(defaultGodown._id);

        // Initialize location rows with default godown if empty
        if (locationRows?.length === 0 && process == "add") {
          console.log("here");

          setLocationRows([
            {
              godown: defaultGodown?._id || "",
              balance_stock: 0,
            },
          ]);
        }
      } else {
        console.log("here");

        setLocationRows([{ godown: "", balance_stock: "" }]);
      }

      setOptionsData((prev) => ({
        ...prev,
        hsn: hsnRes.data.data,
      }));
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Price level table handlers
  const handleAddRow = () => {
    const lastRow = priceLevelRows[priceLevelRows?.length - 1];
    if (!lastRow?.pricelevel || !lastRow?.pricerate) {
      toast.error("Add Level name and Rate");
      return;
    }
    setPriceLevelRows([...priceLevelRows, { pricelevel: "", pricerate: "" }]);
  };

  const handleDeleteRow = (id) => {
    if (priceLevelRows?.length > 1) {
      setPriceLevelRows(priceLevelRows.filter((row) => row?.pricelevel !== id));
    } else {
      setPriceLevelRows([{ pricelevel: "", pricerate: "" }]);
    }
  };

  const handleLevelChange = (index, value) => {
    const newRows = [...priceLevelRows];
    newRows[index].pricelevel = value;
    setPriceLevelRows(newRows);
  };

  const handleRateChange = (index, value) => {
    const newRows = [...priceLevelRows];
    newRows[index].pricerate = value === "" ? "" : Number(value);
    setPriceLevelRows(newRows);
  };

  // Location table handlers
  const handleAddLocationRow = () => {
    if (!gdnEnabled) {
      return;
    }
    const lastRow = locationRows[locationRows?.length - 1];
    if (
      !lastRow?.godown ||
      lastRow?.balance_stock < 0 ||
      lastRow?.balance_stock === ""
    ) {
      toast.error("Add Location and Stock");
      return;
    }
    setLocationRows([...locationRows, { godown: "", balance_stock: "" }]);
  };

  const handleDeleteLocationRow = (id) => {
    const isDefaultGodown = optionsData.godown.find(
      (g) => g?._id === id
    )?.defaultGodown;

    if (isDefaultGodown) {
      Swal.fire({
        title: "Cannot Delete",
        text: "Cannot delete default godown",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (locationRows?.length > 1) {
      setLocationRows(locationRows.filter((row) => row?.godown !== id));
    } else {
      setLocationRows([{ godown: "", balance_stock: "" }]);
    }
  };

  const handleLocationChange = (index, value) => {
    const newRows = [...locationRows];
    newRows[index].godown = value;
    setLocationRows(newRows);
  };

  const handleLocationRateChange = (index, value) => {
    const newRows = [...locationRows];
    newRows[index].balance_stock = value === "" ? "" : Number(value);
    setLocationRows(newRows);
  };

  // Form validation and submission
  const validateForm = () => {
    const {
      product_name,
      unit,
      hsn_code,
      alt_unit_conversion,
      unit_conversion,
      altUnit,
    } = formState;

    if (!product_name.trim() || !unit || !hsn_code) {
      toast.error("Name, Unit, and HSN must be filled");
      return false;
    }

    // Validate unit conversion if alt unit is provided
    if (altUnit !== "") {
      if (!unit_conversion || !alt_unit_conversion) {
        toast.error("Unit and Alt unit conversion must be done");
        return false;
      }
    }

    // Validate price levels
    if (
      priceLevelRows[0]?.pricelevel !== "" ||
      priceLevelRows[0]?.pricerate !== ""
    ) {
      for (const row of priceLevelRows) {
        if (row?.pricerate === "") {
          toast.error("Rate must be filled");
          return false;
        }
        if (row?.pricelevel === "") {
          toast.error("Level name must be filled");
          return false;
        }
      }
    }

    // Validate locations
    if (
      locationRows[0]?.godown !== "" ||
      locationRows[0]?.balance_stock !== ""
    ) {
      for (const row of locationRows) {
        if (row?.balance_stock === "") {
          toast.error("Stock must be filled");
          return false;
        }
        if (row?.godown === "") {
          toast.error("Location name must be filled");
          return false;
        }
      }
    }

    return true;
  };

  const prepareFormData = () => {
    const {
      product_name,
      product_code,
      balance_stock,
      selectedBrand,
      selectedCategory,
      selectedSubcategory,
      unit,
      altUnit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      purchase_price,
      item_mrp,
      purchase_cost,
      batchEnabled,
    } = formState;

    // Process price levels
    let levelNames;
    const firstPriceLevel = priceLevelRows[0];
    if (Object.values(firstPriceLevel).every((val) => val === "")) {
      levelNames = [];
    } else {
      levelNames = priceLevelRows;
    }

    // Process locations
    const processedLocations = (() => {
      const firstLocationItem = locationRows[0];

      // If all fields in first location are empty
      if (Object.values(firstLocationItem).every((val) => val === "")) {
        return [
          {
            godown: defaultGodown,
            batch: "Primary Batch",
            balance_stock: 0,
          },
        ];
      } else {
        // Add batch to all locations
        return locationRows.map((location) => ({
          ...location,
          batch: "Primary Batch",
        }));
      }
    })();

    return {
      cmp_id: orgId,
      product_name,
      product_code,
      balance_stock: balance_stock || 0,
      brand: selectedBrand,
      category: selectedCategory,
      sub_category: selectedSubcategory,
      unit,
      alt_unit: altUnit,
      unit_conversion,
      alt_unit_conversion,
      hsn_code,
      cgst,
      sgst,
      igst,
      cess,
      addl_cess,
      purchase_price,
      item_mrp,
      purchase_cost: purchase_cost,
      Priceleveles: levelNames,
      GodownList: processedLocations,
      batchEnabled,
      gdnEnabled,
    };
  };

  const submitHandler = async () => {
    if (!validateForm()) return;

    const formData = prepareFormData();

    // Uncomment to actually submit the data
    submitData(formData);
  };

  // Render form inputs with common styling
  const renderFormInput = (
    label,
    name,
    type = "text",
    placeholder = "",
    options = null,
    isRequired = false
  ) => {
    return (
      <div className="w-full lg:w-6/12 px-4">
        <div className="relative w-full mb-3">
          <label
            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
            htmlFor={name}
          >
            {label} {isRequired && <span className="text-red-500">*</span>}
          </label>

          {options ? (
            <select
              id={name}
              name={name}
              value={formState[name]}
              onChange={handleInputChange}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            >
              <option value="">Select {label}</option>
              {options.map((option, index) => (
                <option
                  key={index}
                  value={option.value || option._id || option.shortForm}
                  disabled={option.disabled}
                >
                  {option.label || option.name || option.fullForm || option.hsn}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              name={name}
              type={type}
              min={type === "number" ? "0" : undefined}
              value={formState[name]}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      className={` ${
        loading && "opacity-50 pointer-events-none"
      }  py-1 mb-5 border bg-blueGray-50 shadow-xl  flex flex-col items-center justify-center mx-auto  w-[calc(100%-2rem)] `}
    >
      <div className=" mx-auto mt-6    ">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6  rounded-lg bg-blueGray-100 border-0">
          <div className="rounded-t bg-white mb-0 px-6 py-6">
            <div className="text-center flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold">
                Product Details
              </h6>
            </div>
          </div>

          <div className="flex-auto px-4 lg:px-10  pt-0">
            <form>
              <div className="flex flex-wrap">
                {/* Product Name */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="product_name"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="product_name"
                      name="product_name"
                      type="text"
                      value={formState.product_name}
                      onChange={handleInputChange}
                      placeholder="Product Name"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Product Code */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="product_code"
                    >
                      code
                    </label>
                    <input
                      id="product_code"
                      name="product_code"
                      type="text"
                      value={formState.product_code}
                      onChange={handleInputChange}
                      placeholder="Product Code"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Unit */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="unit"
                    >
                      unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="unit"
                      name="unit"
                      value={formState.unit}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="">Select a unit</option>
                      {units.map((el, index) => (
                        <option key={index} value={el?.shortForm}>
                          {el?.fullForm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Alt Unit */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="altUnit"
                    >
                      Alt unit
                    </label>
                    <select
                      id="altUnit"
                      name="altUnit"
                      value={formState.altUnit}
                      onChange={handleInputChange}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="">Select an Alt.unit</option>
                      {units.map((el, index) => (
                        <option key={index} value={el?.shortForm}>
                          {el?.fullForm}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Unit Conversion Section */}
                {formState.altUnit !== "" && formState.unit !== "" && (
                  <div className="w-full px-4 mt-7">
                    <div className="relative w-full mb-3 flex items-center gap-1 justify-center">
                      <div className="flex flex-col justify-center md:flex-row items-center gap-2">
                        <input
                          name="alt_unit_conversion"
                          type="number"
                          min="0"
                          value={formState.alt_unit_conversion}
                          onChange={handleInputChange}
                          className="border-0 w-6/12 md:w-4/12 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring ease-linear transition-all duration-150"
                        />
                        <label className="block uppercase text-blueGray-600 text-[9px] md:text-xs font-semibold whitespace-nowrap">
                          {formState.altUnit}
                        </label>
                      </div>

                      <div className="flex flex-col md:flex-row justify-center items-center gap-2">
                        <input
                          name="unit_conversion"
                          type="number"
                          min="0"
                          value={formState.unit_conversion}
                          onChange={handleInputChange}
                          className="border-0 w-6/12 md:w-4/12 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring ease-linear transition-all duration-150"
                        />
                        <label className="block uppercase text-blueGray-600 text-[9px] md:text-xs font-semibold whitespace-nowrap">
                          {formState.unit}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* HSN */}
                {renderFormInput(
                  "Hsn",
                  "hsn_code",
                  "select",
                  "",
                  optionsData.hsn.map((hsn) => ({
                    value: hsn.hsn,
                    label: hsn.hsn,
                  })),
                  true // isRequired
                )}

                {/* Balance Stock */}
                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="balance_stock"
                    >
                      balance stock
                    </label>
                    <input
                      id="balance_stock"
                      name="balance_stock"
                      type="number"
                      min="0"
                      value={formState.balance_stock}
                      onChange={handleInputChange}
                      placeholder="Balance stock"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Purchase Price */}
                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="purchase_price"
                    >
                      Purchase price
                    </label>
                    <input
                      id="purchase_price"
                      name="purchase_price"
                      type="number"
                      min="0"
                      value={formState.purchase_price}
                      onChange={handleInputChange}
                      placeholder="Purchase price"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Purchase Cost */}
                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="purchase_cost"
                    >
                      Purchase cost
                    </label>
                    <input
                      id="purchase_cost"
                      name="purchase_cost"
                      type="number"
                      min="0"
                      value={formState.purchase_cost}
                      onChange={handleInputChange}
                      placeholder="Purchase Cost"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* Mrp*/}
                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="item_mrp"
                    >
                      MRP
                    </label>
                    <input
                      id="item_mrp"
                      name="item_mrp"
                      type="number"
                      min="0"
                      value={formState.item_mrp}
                      onChange={handleInputChange}
                      placeholder="Purchase price"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    />
                  </div>
                </div>

                {/* brand */}
                {renderFormInput(
                  "Brand",
                  "selectedBrand",
                  "select",
                  "",
                  optionsData.brand.map((brand) => ({
                    value: brand._id,
                    label: brand.name,
                  }))
                )}

                {/* category */}
                {renderFormInput(
                  "Category",
                  "selectedCategory",
                  "select",
                  "",
                  optionsData.category.map((category) => ({
                    value: category._id,
                    label: category.name,
                  }))
                )}

                {/* Subcategory */}
                {renderFormInput(
                  "Subcategory",
                  "selectedSubcategory",
                  "select",
                  "",
                  optionsData.subcategory.map((subcategory) => ({
                    value: subcategory._id,
                    label: subcategory.name,
                  }))
                )}
              </div>

              {isBatchEnabledInCompany && (
                <div className="flex items-center mr-4 w-full mt-6 px-4">
                  <input
                    type="checkbox"
                    name="batchEnabled"
                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                    checked={formState.batchEnabled === true}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="valueCheckbox" className="ml-2 text-gray-700">
                    Batch Enabled
                  </label>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Price Level and Location Tabs */}
      <div className={` ${loading && "opacity-50 pointer-events-none "} `}>
        <div className="relative flex flex-col min-w-0 break-words w-full  pb-3 rounded-lg bg-blueGray-100 border-0">
          <div className="flex start mx-10 ">
            <div className="mt-[10px]  border-b border-solid border-[#0066ff43]  ">
              <button
                type="button"
                onClick={() => setTab("priceLevel")}
                className={` ${
                  tab === "priceLevel" && "border-b border-solid border-black"
                } py-2 px-5 mr-10   text-[16px] leading-7 text-headingColor font-semibold `}
              >
                Price Level
              </button>
              <button
                type="button"
                onClick={() => setTab("location")}
                className={` ${
                  tab === "location" && "border-b border-solid border-black"
                } py-2 px-5  text-[16px] leading-7 text-headingColor font-semibold `}
              >
                Location
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-auto px-4 lg:px-10 pt-0">
            {tab === "priceLevel" && (
              <div className="container mx-auto mt-2">
                <table className="table-fixed w-full bg-white shadow-md  ">
                  <thead className="bg-[#EFF6FF] border">
                    <tr>
                      <th className="w-1/2 px-4 py-1 border-r">Level Name</th>
                      <th className="w-1/2 px-4 py-1 border-r">Rate</th>
                      <th className="  w-2/12 px-4 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceLevelRows?.map((row, index) => (
                      <tr key={row?.id} className="border w-full ">
                        <td className="px-4 py-2 border-r w-4/5">
                          <select
                            value={row?.pricelevel}
                            onChange={(e) => {
                              return handleLevelChange(index, e.target.value);
                            }}
                            className="  block w-full  px-4  rounded-md  text-sm focus:outline-none border-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          >
                            {/* Options for dropdown */}
                            <option value="">Select Level</option>
                            {optionsData.priceLevel?.map((el) => (
                              <option key={el?._id} value={el?._id}>
                                {el?.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 border-r w-2/5 ">
                          <input
                            type="number"
                            value={row?.pricerate}
                            onChange={(e) =>
                              handleRateChange(index, e?.target?.value)
                            }
                            className="w-full  text-center py-1 px-4 border  border-gray-400  border-x-0 border-t-0  text-sm focus:outline-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          />
                        </td>
                        <td className="px-4 sm:px-10  py-2  w-1/5">
                          <button
                            onClick={() => handleDeleteRow(row?.pricelevel)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={handleAddRow}
                  className="mt-4 px-3  py-1 bg-green-500 text-white rounded"
                >
                  <MdPlaylistAdd />
                </button>
              </div>
            )}

            {tab === "location" && (
              <div className="container mx-auto mt-2">
                <table className="table-fixed w-full bg-white shadow-md rounded-lg ">
                  <thead className="bg-[#EFF6FF] border">
                    <tr>
                      <th className="w-1/2 px-4 py-1 border-r">Location</th>
                      <th className="w-1/2 px-4 py-1 border-r">Stock</th>
                      <th className="  w-2/12 px-4 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationRows?.map((row, index) => (
                      <tr key={row?.id} className="border-b  ">
                        <td className="px-4 py-2 border-r">
                          <select
                            disabled={
                              row?.godown ===
                              optionsData.godown.find((el) => el?.defaultGodown)
                                ?._id
                            }
                            value={row?.godown}
                            onChange={(e) =>
                              handleLocationChange(index, e?.target?.value)
                            }
                            className="block w-full  px-4  rounded-md  text-sm focus:outline-none border-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          >
                            {/* Options for dropdown */}
                            <option value="">Select Location</option>
                            {optionsData.godown?.map((el, index) => (
                              <option
                                disabled={el?.defaultGodown}
                                key={index}
                                value={el?._id}
                              >
                                {el?.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4  border-r">
                          <input
                            type="number"
                            // min="0"
                            value={row?.balance_stock}
                            onChange={(e) =>
                              handleLocationRateChange(index, e?.target.value)
                            }
                            className="w-full  text-center py-1 px-4 border  border-gray-400  border-x-0 border-t-0  text-sm focus:outline-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          />
                        </td>
                        <td className="px-4 sm:px-10 py-2 border-r">
                          <button
                            onClick={() => handleDeleteLocationRow(row?.godown)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button
                  onClick={handleAddLocationRow}
                  className={`${
                    !gdnEnabled && "pointer-events-none opacity-55"
                  }   mt-4 px-3 py-1 bg-green-500 text-white rounded`}
                >
                  <MdPlaylistAdd />
                </button>
              </div>
            )}

            <div className="py-3 flex justify-end ">
              <button
                onClick={submitHandler}
                className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                type="button"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AddProductForm;
