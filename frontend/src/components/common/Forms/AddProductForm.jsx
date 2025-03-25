/* eslint-disable no-prototype-builtins */
/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";

import { MdDelete } from "react-icons/md";

import { units } from "../../../../constants/units";
import { MdPlaylistAdd } from "react-icons/md";
import { toast } from "react-toastify";
import api from "../../../api/api";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

function AddProductForm({
  orgId,
  submitData,
  productData = {},
  userType,
  isBatchEnabledInCompany = false,
}) {
  const [hsn, setHsn] = useState([]);
  const [tab, setTab] = useState("priceLevel");
  const [unit, setUnit] = useState("");
  const [altUnit, setAltUnit] = useState("");
  const [product_name, setProduct_name] = useState("");
  const [product_code, setProduct_code] = useState("");
  const [balance_stock, setBalance_stock] = useState("");
  const [alt_unit_conversion, setAlt_unit_conversion] = useState("");
  const [unit_conversion, setUnit_conversion] = useState("");
  const [hsn_code, setHsn_code] = useState("");
  const [purchase_price, setPurchase_price] = useState("");
  const [purchase_stock, set_Purchase_stock] = useState("");
  const [brand, setBrand] = useState([]);
  const [category, setCategory] = useState([]);
  const [subcategory, setSubcategory] = useState([]);
  const [godown, setGodown] = useState("");
  const [priceLevel, setPriceLevel] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState();
  const [selectedCategory, setSelectedCategory] = useState();
  const [batchEnabled, setBatchEnabled] = useState(false);
  const [item_mrp, setItem_mrp] = useState(0);
  const [selectedSubcategory, setSelectedSubcategory] = useState();
  const [rows, setRows] = useState([{ pricelevel: "", pricerate: "" }]);
  const [locationRows, setLocationRows] = useState([]);
  const [defaultGodown, setDefaultGodown] = useState(null);


  useEffect(() => {
    const fetchAllSubDetails = async () => {
      try {
        let res;
        if (userType === "secondaryUser") {
          res = await api.get(`/api/sUsers/getAllSubDetails/${orgId}`, {
            withCredentials: true,
          });
        } else if (userType === "primaryUser") {
          res = await api.get(`/api/pUsers/getAllSubDetails/${orgId}`, {
            withCredentials: true,
          });
        }
        const { brands, categories, subcategories, godowns, priceLevels } =
          res.data.data;
        setBrand(brands);
        setCategory(categories);
        setSubcategory(subcategories);

        setGodown(godowns);
        const defaultGodown = godowns.find((g) => g?.defaultGodown === true);
        setDefaultGodown(defaultGodown._id);

        if (defaultGodown && locationRows?.length === 0 ) {
          
          setLocationRows([
            {
              godown: defaultGodown?._id || "",
              // godown: defaultGodown?.name,
              balance_stock: 0,
              // defaultGodown: true,
            },
          ]);
        } else {

          setLocationRows([
            {
              godown: "",
              balance_stock: "",
            },
          ]);
        }

        setPriceLevel(priceLevels);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    fetchAllSubDetails();
    fetchHsn();
  }, [orgId]);

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
        hsn: hsn_id,
        purchase_price,
        item_mrp,
        purchase_cost,
        Priceleveles,
        GodownList,
        batchEnabled,
      } = productData;

      setProduct_name(product_name);
      setProduct_code(product_code);
      setUnit(unit);
      setAltUnit(alt_unit);
      setUnit_conversion(unit_conversion);
      setAlt_unit_conversion(alt_unit_conversion);
      setBalance_stock(balance_stock);
      setPurchase_price(purchase_price);
      setItem_mrp(item_mrp);
      set_Purchase_stock(purchase_cost);
      setSelectedBrand(brand);
      setSelectedCategory(category);
      setSelectedSubcategory(sub_category);
      if (Priceleveles?.length > 0) {
        setRows(Priceleveles);
      } else {
        setRows(() => [...Priceleveles, { pricelevel: "", pricerate: "" }]);
      }

      console.log(GodownList);
      setLocationRows(GodownList);

   

      setHsn_code(hsn_id);
      if (isBatchEnabledInCompany) {
        setBatchEnabled(batchEnabled);
      }
    }
  }, [productData, isBatchEnabledInCompany]);

  const gdnEnabled = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.gdnEnabled
  );


  // useEffect(()=>{


  // }.[])





  console.log(locationRows);


  const fetchHsn = async () => {
    try {
      const res = await api.get(`/api/sUsers/fetchHsn/${orgId}`, {
        withCredentials: true,
      });

      setHsn(res.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddRow = () => {
    const lastRow = rows[rows?.length - 1];
    if (!lastRow?.pricelevel || !lastRow?.pricerate) {
      toast.error("Add Level name and Rate");
      return;
    }
    setRows([...rows, { pricelevel: "", pricerate: "" }]);
  };

  const handleDeleteRow = (id) => {
    if (rows?.length > 1) {
      setRows(rows.filter((row) => row?.pricelevel !== id));
    } else {
      setRows([{ pricelevel: "", pricerate: "" }]);
    }
  };

  const handleLevelChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].pricelevel = value;
    setRows(newRows);
  };

  const handleRateChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].pricerate = value === "" ? "" : Number(value);
    setRows(newRows);
  };

  ///////////// location table ///////////////////

  const handleAddLocationRow = () => {
    const lastRow = locationRows[locationRows?.length - 1];

    if (
      !lastRow?.godown ||
      lastRow?.balance_stock < 0 ||
      lastRow?.balance_stock === ""
    ) {
      toast.error("Add Location  and Stock");
      return;
    }

    setLocationRows([...locationRows, { balance_stock: "" }]);
  };

  const handleDeleteLocationRow = (id) => {
    const isDefaultGodown = godown.find((g) => g?._id === id)?.defaultGodown;

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

  const submitHandler = async () => {
    // Check required fields
    if (!product_name.trim() || !unit || hsn_code?.length === 0) {
      toast.error("Name, Unit, and HSN must be filled");
      return;
    }

    // Check unit conversion if altUnit is provided
    if (altUnit !== "") {
      if (!unit_conversion || !alt_unit_conversion) {
        toast.error("Unit and Alt unit conversion must be done");
        return;
      }
    }

    let isError = false;

    if (rows[0]?.pricelevel !== "" || rows[0]?.pricerate !== "") {
      rows.map((el) => {
        if (el?.pricerate === "") {
          toast.error("Rate must be filled");
          isError = true;
          return;
        }
        if (el?.pricelevel === "") {
          toast.error("Level name must be filled");
          isError = true;
          return;
        }
      });
      if (isError) {
        return;
      }
    }

    isError = false;

    if (
      locationRows[0]?.godown !== "" ||
      locationRows[0]?.balance_stock !== ""
    ) {
      locationRows.map((el) => {
        if (el?.balance_stock === "") {
          toast.error("stock must be filled");
          isError = true;
          return;
        }
        if (el?.godown === "") {
          toast.error("location name must be filled");
          isError = true;

          return;
        }
      });
      if (isError) {
        return;
      }
    }

    let locations;

    const godownListFirstItem = locationRows[0];
    if (
      Object.keys(godownListFirstItem).every(
        (key) => godownListFirstItem[key] === ""
      )
    ) {
      locations = [
        {
          balance_stock: 0,
        },
      ];
    } else {
      locations = locationRows;
    }

    let levelNames;

    const levelNameListFirstItem = rows[0];
    if (
      Object.keys(levelNameListFirstItem).every(
        (key) => levelNameListFirstItem[key] === ""
      )
    ) {
      levelNames = [];
    } else {
      levelNames = rows;
    }

    const getLocation = () => {
      if (!defaultGodown) {
        toast.error("Your Default Godown is not Enabled");
      }

      let noLocation;

      if (JSON.stringify(locations) === JSON.stringify(noLocation)) {
        noLocation = true;
      }

      if (noLocation) {
        return [
          {
            godown: defaultGodown,
            batch: "Primary Batch",
            balance_stock: 0,
          },
        ];
      } else {
        const updatedLocations = locations.map((location) => {
          return {
            ...location,
            batch: "Primary Batch",
          };
        });

        return updatedLocations;
      }
    };

    // Create form data
    const formData = {
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
      purchase_price,
      item_mrp,
      purchase_cost: purchase_stock,
      Priceleveles: levelNames,
      GodownList: getLocation(),
      batchEnabled,
      gdnEnabled,
    };

    console.log(formData);

    submitData(formData);
  };

  console.log(locationRows);

  return (
    <section className="  py-1 bg-blueGray-50">
      <div className="w-full lg:w-8/12 px-4 mx-auto mt-6">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
          <div className="rounded-t bg-white mb-0 px-6 py-6">
            <div className="text-center flex justify-between">
              <h6 className="text-blueGray-700 text-xl font-bold">
                Product Details
              </h6>
            </div>
          </div>
          <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
            <form>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlfor="grid-password"
                    >
                      Name
                    </label>
                    <input
                      onChange={(e) => setProduct_name(e.target.value)}
                      value={product_name}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Product Name"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlfor="grid-password"
                    >
                      code
                    </label>
                    <input
                      onChange={(e) => setProduct_code(e.target.value)}
                      value={product_code}
                      type="email"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="product code"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="brandSelect"
                    >
                      unit
                    </label>
                    <select
                      onChange={(e) => {
                        setUnit(e.target.value);
                      }}
                      value={unit}
                      id="brandSelect"
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

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="brandSelect"
                    >
                      Alt unit
                    </label>
                    <select
                      onChange={(e) => {
                        setAltUnit(e.target.value);
                      }}
                      value={altUnit}
                      id="brandSelect"
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

                {altUnit !== "" && unit !== "" && (
                  <div className="w-full  px-4 mt-7">
                    <div className="relative w-full mb-3 flex items-center gap-1 justify-center">
                      <div className=" flex flex-col justify-center  md:flex-row items-center gap-2">
                        <input
                          onChange={(e) =>
                            setAlt_unit_conversion(e.target.value)
                          }
                          value={alt_unit_conversion}
                          type="number"
                          min="0"
                          className="border-0 w-6/12 md:w-4/12 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring  ease-linear transition-all duration-150"
                          // placeholder="Product Name"
                        />
                        <label
                          className="block uppercase text-blueGray-600 text-[9px] md:text-xs font-semibold whitespace-nowrap"
                          htmlfor="grid-password"
                        >
                          {altUnit}
                        </label>
                      </div>

                      <div className=" flex flex-col   md:flex-row justify-center items-center gap-2">
                        <input
                          onChange={(e) => setUnit_conversion(e.target.value)}
                          value={unit_conversion}
                          type="number"
                          min="0"
                          className="border-0 w-6/12 md:w-4/12 px-3 py-2 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring  ease-linear transition-all duration-150"
                          // placeholder="Product Name"
                        />
                        <label
                          className="block uppercase text-blueGray-600 text-[9px] md:text-xs font-semibold whitespace-nowrap"
                          htmlfor="grid-password"
                        >
                          {unit}
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="brandSelect"
                    >
                      Hsn
                    </label>
                    <select
                      onChange={(e) => {
                        setHsn_code(e.target.value);
                      }}
                      value={hsn_code}
                      id="brandSelect"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    >
                      <option value="">Select Hsn</option>
                      {hsn?.length > 0 ? (
                        hsn?.map((el, index) => (
                          <option key={index} value={el?._id}>
                            {el?.hsn}
                          </option>
                        ))
                      ) : (
                        <option>No hsn were added</option>
                      )}
                      {/* {hsn.map((el, index) => (
                            <option key={index} value={el}>
                              {el.hsn}
                            </option>
                          ))} */}
                    </select>
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlfor="grid-password"
                    >
                      balance stock
                    </label>
                    <input
                      onChange={(e) => setBalance_stock(e.target.value)}
                      value={balance_stock}
                      type="number"
                      min="0"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Balance stock"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlfor="grid-password"
                    >
                      Purchase price
                    </label>
                    <input
                      onChange={(e) => setPurchase_price(e.target.value)}
                      value={purchase_price}
                      type="number"
                      min="0"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Purchase price"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4 mt-3">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlfor="grid-password"
                    >
                      MRP
                    </label>
                    <input
                      onChange={(e) => setItem_mrp(e.target.value)}
                      value={item_mrp}
                      type="number"
                      min="0"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="MRP"
                    />
                  </div>
                </div>
              </div>
            </form>

            <div className="text-center flex justify-between mt-4">
              <h6 className="text-blueGray-700 text-md font-bold">
                Product Sub Details
              </h6>
            </div>

            <div className="flex flex-wrap mt-8">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="brandSelect"
                  >
                    brand
                  </label>
                  <select
                    onChange={(e) => {
                      // const selectedBrandObj = brand.find(
                      //   (b) => b?._id === e?.target?.value
                      // );
                      setSelectedBrand(e.target.value); // Set the state with the entire brand object
                    }}
                    value={selectedBrand}
                    id="brandSelect"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="">Select a Brand</option>
                    {brand?.map((el, index) => (
                      <option key={index} value={el?._id}>
                        {el?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="brandSelect"
                  >
                    Category
                  </label>
                  <select
                    onChange={(e) => {
                      setSelectedCategory(e.target.value); // Set the state with the entire brand object
                    }}
                    value={selectedCategory}
                    id="brandSelect"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="">Select a Category</option>
                    {category?.map((el, index) => (
                      <option key={index} value={el?._id}>
                        {el?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                    htmlFor="brandSelect"
                  >
                    Sub Category
                  </label>
                  <select
                    onChange={(e) => {
                      // const selectedSubCategoryObj = subcategory?.find(
                      //   (c) => c?._id === e?.target?.value
                      // );
                      setSelectedSubcategory(e.target.value); // Set the state with the entire brand object
                    }}
                    value={selectedSubcategory}
                    id="brandSelect"
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="">Select a Sub Category</option>
                    {subcategory?.map((el, index) => (
                      <option key={index} value={el?._id}>
                        {el?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isBatchEnabledInCompany && (
                <div className="flex items-center mr-4 w-full mt-6 px-4">
                  <input
                    type="checkbox"
                    id="valueCheckbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                    checked={batchEnabled === true}
                    onChange={() => {
                      setBatchEnabled(!batchEnabled);
                    }}
                  />
                  <label htmlFor="valueCheckbox" className="ml-2 text-gray-700">
                    Batch Enabled
                  </label>
                </div>
              )}
            </div>

            {/* adding level name end **********************************************************************************/}
          </div>

          <div className="flex justify-center ">
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

          {tab === "priceLevel" && (
            <div className="p-2 md:p-6">
              <div className="container mx-auto mt-8">
                <table className="table-fixed w-full bg-white shadow-md rounded-lg ">
                  <thead className="bg-[#f7f7f7] border">
                    <tr>
                      <th className="w-1/2 px-4 py-1">Level Name</th>
                      <th className="w-1/2 px-4 py-1">Rate</th>
                      <th className="  w-2/12 px-4 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.map((row, index) => (
                      <tr key={row?.id} className="border-b bg-[#EFF6FF] ">
                        <td className="px-4 py-2">
                          <select
                            value={row?.pricelevel}
                            onChange={(e) => {
                              return handleLevelChange(index, e.target.value);
                            }}
                            className="  block w-full  px-4  rounded-md bg-[#EFF6FF] text-sm focus:outline-none border-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          >
                            {/* Options for dropdown */}
                            <option value="">Select Level</option>
                            {priceLevel?.map((el) => (
                              <option key={el?._id} value={el?._id}>
                                {el?.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 ">
                          <input
                            type="number"
                            value={row?.pricerate}
                            onChange={(e) =>
                              handleRateChange(index, e?.target?.value)
                            }
                            className="w-full  text-center py-1 px-4 border bg-[#EFF6FF] border-gray-400  border-x-0 border-t-0  text-sm focus:outline-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">
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
            </div>
          )}

          {tab === "location" && (
            <div className="p-2 md:p-6">
              <div className="container mx-auto mt-8">
                <table className="table-fixed w-full bg-white shadow-md rounded-lg ">
                  <thead className="bg-[#f7f7f7] border">
                    <tr>
                      <th className="w-1/2 px-4 py-1">Location</th>
                      <th className="w-1/2 px-4 py-1">Stock</th>
                      <th className="  w-2/12 px-4 py-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationRows?.map((row, index) => (
                      <tr key={row?.id} className="border-b bg-[#EFF6FF] ">
                        <td className="px-4 py-2">
                          <select
                            disabled={
                              row?.godown ===
                              godown.find((el) => el?.defaultGodown)?._id
                            }
                            value={row?.godown}
                            onChange={(e) =>
                              handleLocationChange(index, e?.target?.value)
                            }
                            className="block w-full  px-4  rounded-md bg-[#EFF6FF] text-sm focus:outline-none border-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          >
                            {/* Options for dropdown */}
                            <option value="">Select Location</option>
                            {godown?.map((el, index) => (
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
                        <td className="px-4 ">
                          <input
                            type="number"
                            // min="0"
                            value={row?.balance_stock}
                            onChange={(e) =>
                              handleLocationRateChange(index, e?.target.value)
                            }
                            className="w-full  text-center py-1 px-4 border bg-[#EFF6FF] border-gray-400  border-x-0 border-t-0  text-sm focus:outline-none"
                            style={{
                              boxShadow: "none",
                              borderColor: "#b6b6b6",
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">
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
                  className="mt-4 px-3 py-1 bg-green-500 text-white rounded"
                >
                  <MdPlaylistAdd />
                </button>
              </div>
            </div>
          )}
          <div className="p-2 pb-3 md:p-5 flex justify-end md:justify-start">
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
    </section>
  );
}

export default AddProductForm;
