/* eslint-disable react/no-unknown-property */
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { MdOutlinePlaylistAdd } from "react-icons/md";
import { MdDeleteSweep } from "react-icons/md";
import { RiArrowRightSFill } from "react-icons/ri";
import { toast } from "react-toastify";
import api from "../../api/api";
import { set } from "mongoose";

// import "./hsn.css";

function Hsn() {
  const [tab, setTab] = useState("onValue");
  const [hsn, setHsn] = useState("");
  const [description, setDescription] = useState("");
  const [taxabilityType, setTaxabilityType] = useState("");
  const [igstRate, setIgstRate] = useState("");
  const [cgstRate, setCgstRate] = useState("");
  const [sgstUtgstRate, setSgstUtgstRate] = useState("");
  const [onValue, setOnValue] = useState("");
  const [onQuantity, setOnQuantity] = useState("");
  const [cpm_id, setCmp_id] = useState("");
  const [Primary_user_id, setPrimary_user_id] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [isRevisedChargeApplicable, setIsRevisedChargeApplicable] =
    useState(false);

  console.log(taxabilityType);
  console.log(hsn);
  console.log(description);
  console.log(igstRate);
  console.log(cgstRate);
  console.log(sgstUtgstRate);
  console.log(onValue);
  console.log(onQuantity);

  //   table    ///////////////////////////

  const [rows, setRows] = useState([
    {
      greaterThan: "0",
      upto: "",
      taxabilityType: "",
      igstRate: "",
      cgstRate: "",
      sgstUtgstRate: "",
      basedOnValue: "",
      basedOnQuantity: "",
    },
  ]);
  console.log(rows);

  const handleAddRow = () => {
    let hasEmptyField = false;

    rows.forEach((row, ) => {
    
      if (row.taxabilityType === "") {
        // toast.error("Select taxability type");
        hasEmptyField = true; // Set the flag to true to indicate an error
        return; // Exit the loop if the condition is met
      }
      if (row.taxabilityType === "Taxable") {
        const nonEmptyFields = Object.keys(row).filter((key) => {
          return key !== "basedOnValue" && key !== "basedOnQuantity";
        });

        const isEmpty = nonEmptyFields.some((key) => row[key] === "");

        if (isEmpty) {
          hasEmptyField = true;
          return; // Exit the loop if the condition is met
        }
      }
    });

    if (hasEmptyField) {
      toast.error("All required fields must be filled");
      return; // Exit the function if there's an error
    }

    setRows([
      ...rows,
      {
        greaterThan: rows[rows.length - 1].upto,
        upto: "",
        taxabilityType: "",
        igstRate: "",
        cgstRate: "",
        sgstUtgstRate: "",
        basedOnValue: "",
        basedOnQuantity: "",
      },
    ]);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newRows = [...rows];
    newRows[index][name] = value;

    // Automatically calculate CGST and SGST/UTGST rates if taxability type is Taxable
    if (name === "igstRate" && newRows[index].taxabilityType === "Taxable") {
      newRows[index].cgstRate = (parseFloat(value) / 2).toString();
      newRows[index].sgstUtgstRate = (parseFloat(value) / 2).toString();
    }

    setRows(newRows);
  };

  const isExemptOrNilRatedOrNonGST = (taxabilityType) => {
    return (
      taxabilityType === "Exempt" ||
      taxabilityType === "Nil Rated" ||
      taxabilityType === "Non GST" ||
      taxabilityType === ""
    );
  };

  const handleDeleteRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1)); // Remove the last element from the rows array
    }
  };

  //   table    ///////////////////////////

  useEffect(() => {
    if (igstRate !== "") {
      setCgstRate(parseFloat(igstRate / 2).toString());
      setSgstUtgstRate(parseFloat(igstRate / 2).toString());
    }
  }, [igstRate]);

  const [checkedValue, setCheckedValue] = useState("onValue");
  const handleChangeCheck = (value) => {
    setCheckedValue(value);
  };

  const handleRevisedChargeChange = (e) => {
    setIsRevisedChargeApplicable(e.target.checked);
  };

  const companyId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );
  const user = JSON.parse(localStorage.getItem("pUserData"));
  const userId = user._id;
  useEffect(() => {
    setCmp_id(companyId);
    setPrimary_user_id(userId);
  }, []);

  const submitHandler = async () => {
    if (tab == "onValue") {
      if (
        [hsn, description, taxabilityType].some((field) => field.trim() === "")
      ) {
        toast.error("All gene fields are required");
        return;
      }

      if (taxabilityType === "taxable") {
        if (igstRate === "" || cgstRate === "" || sgstUtgstRate === "") {
          toast.error("All tax fields are required");
          return;
        }
      }
    } else {
      if ([hsn, description].some((field) => field.trim() === "")) {
        toast.error("All fields are required");
        return;
      }
      if (rows.length === 1) {
        if (rows[0].upto === "") {
          toast.error("Upto fied must be filled");
          return;
        }
        if (rows[0].taxabilityType === "") {
          toast.error("Taxability Type must be filled");
          return;
        }
        if (rows[0].taxabilityType === "Taxable") {
          if (rows[0].igstRate === "") {
            toast.error("IgstRate Type must be filled");
            return;
          }

          if (rows[0].cgstRate === "") {
            toast.error("CgstRate Type must be filled");
            return;
          }

          if (rows[0].sgstUtgstRate === "") {
            toast.error("sgstUtgstRate Type must be filled");
            return;
          }
        }
      } else {
       

        const lastRow = rows[rows.length - 1];

        if (lastRow.taxabilityType === "") {
          toast.error("Taxability Type must be filled");
          return;
        }

        // console.log(lastRow.taxabilityType);

        if (lastRow.taxabilityType === "Taxable") {
          if (lastRow.igstRate === "") {
            toast.error("IgstRate Type must be filled");
            return;
          }

          if (lastRow.cgstRate === "") {
            toast.error("CgstRate Type must be filled");
            return;
          }

          if (lastRow.sgstUtgstRate === "") {
            toast.error("sgstUtgstRate Type must be filled");
            return;
          }
        }
      }
    }

    let formData;

    if (tab == "onValue") {
      formData = {
        cpm_id,
        Primary_user_id,
        hsn,
        description,
        tab,
        taxabilityType,
        igstRate,
        cgstRate,
        sgstUtgstRate,
        onValue,
        onQuantity,
        isRevisedChargeApplicable,
      };
    } else {
      formData = {
        cpm_id,
        Primary_user_id,
        hsn,
        description,
        tab,
        rows,
        isRevisedChargeApplicable,
      };
    }

    console.log(formData);

    //     console.log(formData);

    try {
      const res = await api.post("/api/pUsers/addHsn", formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      toast.success(res.data.message);
      
      // Resetting individual state variables
  
      setHsn("");
      setDescription("");
      // setTab("");
      setTaxabilityType("");
      setIgstRate("");
      setCgstRate("");
      setSgstUtgstRate("");
      setOnQuantity("");
      setOnValue("");
      setIsRevisedChargeApplicable("");
    
      // Resetting the rows state
      setRows(rows.map((row) => ({
        greaterThan: "",
        upto: "",
        taxabilityType: "",
        igstRate: "",
        cgstRate: "",
        sgstUtgstRate: "",
        basedOnValue: "",
        basedOnQuantity: "",
      })));
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  return (
    <div className="flex">
      <div>
        <Sidebar TAB={"hsn"} showBar={showSidebar} />
      </div>
      <div className="flex-1 flex flex-col h-screen overflow-y-scroll">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl"
          />
          <p>Tax classification</p>
        </div>
        <section className=" bg-blueGray-50 h-screen overflow-y-scroll ">
          <div className="w-full lg:w-8/12 px-4 mx-auto  pb-[30px] mt-5  ">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-2">
                <div className="text-center flex justify-between">
                  {/* <h6 className="text-blueGray-700 text-xl font-bold">
                    Organization Information
                  </h6> */}
                  {/* <button
                    className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Add
                  </button> */}
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form encType="multipart/form-data">
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    HSN / SAC Creation
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          HSN & SAC
                        </label>
                        <input
                          value={hsn}
                          onChange={(e) => setHsn(e.target.value)}
                          type="text"
                          placeholder="HSN & SAC"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Description
                        </label>
                        <input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          type="email"
                          placeholder="Description"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-8">
                    <div className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        id="valueCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={checkedValue === "onValue"}
                        onChange={() => {
                          handleChangeCheck("onValue");
                          setTab("onValue");
                        }}
                      />
                      <label
                        htmlFor="valueCheckbox"
                        className="ml-2 text-gray-700"
                      >
                        On Value
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="itemRateCheckbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                        checked={checkedValue === "onItemRate"}
                        onChange={() => {
                          handleChangeCheck("onItemRate");
                          setTab("onItemRate");
                        }}
                      />
                      <label
                        htmlFor="itemRateCheckbox"
                        className="ml-2 text-gray-700"
                      >
                        On Item Rate
                      </label>
                    </div>
                  </div>

                  {tab === "onValue" && (
                    <>
                      <div className="flex flex-wrap mt-12">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="dr-cr"
                            >
                              Taxability Type
                            </label>
                            <select
                              value={taxabilityType}
                              onChange={(e) =>
                                setTaxabilityType(e.target.value)
                              }
                              id="dr-cr"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            >
                              <option value="">Select Taxability Type</option>
                              <option value="exempt">Exempt </option>
                              <option value="nilRated">Nil Rated </option>
                              <option value="nonGst">Non GST</option>
                              <option value="taxable">Taxable </option>
                            </select>
                          </div>
                        </div>

                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              IGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              value={igstRate}
                              onChange={(e) => setIgstRate(e.target.value)}
                              placeholder=" IGST Rate"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              CGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              value={cgstRate}
                              onChange={(e) => setCgstRate(e.target.value)}
                              placeholder="CGST Rate"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              SGST/UTGST Rate
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              type="text"
                              className={`${
                                taxabilityType !== "taxable"
                                  ? "pointer-events-none"
                                  : ""
                              }border-0  px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                              value={sgstUtgstRate}
                              onChange={(e) => setSgstUtgstRate(e.target.value)}
                              placeholder="SGST/UTGST Rate"
                            />
                          </div>
                        </div>
                      </div>
                      <hr className="mt-2 mb-4 border-b-1 border-blueGray-300" />
                      <h3 className="text-blueGray-400 text-xs px-4 mt-3 mb-6 font-bold uppercase">
                        Cess Rate Details
                      </h3>
                      <div className="flex flex-wrap mt-2">
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Based On Value
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              value={onValue}
                              onChange={(e) => setOnValue(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="0%"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-6/12 px-4">
                          <div className="relative w-full mb-3">
                            <label
                              className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                              htmlFor="grid-password"
                            >
                              Based on Quantity
                            </label>
                            <input
                              disabled={taxabilityType !== "taxable"}
                              value={onQuantity}
                              onChange={(e) => setOnQuantity(e.target.value)}
                              type="number"
                              className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                              placeholder="0/Unit"
                            />
                          </div>
                        </div>

                        <div className="mt-8">
                          <label
                            htmlFor="revisedChargeCheckbox"
                            className="inline-flex items-center"
                          >
                            <input
                              type="checkbox"
                              id="revisedChargeCheckbox"
                              className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                              checked={isRevisedChargeApplicable}
                              onChange={handleRevisedChargeChange}
                            />
                            <span className="ml-2 text-gray-700">
                              Applicable for Revised Charge
                            </span>
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {tab === "onItemRate" && (
                    <>
                      <hr className="mt-6 mb-1 border-b-1 border-blueGray-300" />
                      <div className=" w-full flex justify-end">
                        <RiArrowRightSFill />
                      </div>

                      <div
                        className="overflow-x-scroll mt-3"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "transparent transparent",
                        }}
                      >
                        <table className="min-w-full divide-y divide-gray-200  ">
                          <thead>
                            <tr>
                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Greater than
                              </th>

                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Upto
                              </th>
                              <th className="px-1 py-3 bg-gray-50  text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center">
                                Taxability Type
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                IGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                CGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                SGST/UTGST Rate
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                Based On Value
                              </th>
                              <th
                                className={`px-1 py-3 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider text-center ${
                                  rows[0] &&
                                  isExemptOrNilRatedOrNonGST(
                                    rows[0].taxabilityType
                                  )
                                    ? "cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                Based On Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {rows.map((row, index) => (
                              <tr key={index}>
                                <td>
                                  <input
                                    disabled
                                    type="text"
                                    name="greaterThan"
                                    value={row.greaterThan}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    disabled={index < rows.length - 1}
                                    type="text"
                                    name="upto"
                                    value={row.upto}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="1000"
                                  />
                                </td>
                                <td>
                                  <select
                                    name="taxabilityType"
                                    value={row.taxabilityType}
                                    onChange={(e) => handleChange(index, e)}
                                    className="px-6 py-2 bg-blue-50 text-xs"
                                  >
                                    <option value="">Select</option>
                                    <option value="Exempt">Exempt</option>
                                    <option value="Nil Rated">Nil Rated</option>
                                    <option value="Non GST">Non GST</option>
                                    <option value="Taxable">Taxable</option>
                                  </select>
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="igstRate"
                                    value={row.igstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2  bg-blue-50 text-center text-xs"
                                    placeholder="IGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="cgstRate"
                                    value={row.cgstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="CGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="sgstUtgstRate"
                                    value={row.sgstUtgstRate}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="SGST/UTGST Rate"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="basedOnValue"
                                    value={row.basedOnValue}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0%"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="text"
                                    name="basedOnQuantity"
                                    value={row.basedOnQuantity}
                                    onChange={(e) => handleChange(index, e)}
                                    disabled={
                                      isExemptOrNilRatedOrNonGST(
                                        row.taxabilityType
                                      ) || index < rows.length - 1
                                    }
                                    className="px-1 py-2 bg-blue-50 text-center text-xs"
                                    placeholder="0/Unit"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="ml-1">
                        <button
                          type="button"
                          onClick={handleAddRow}
                          disabled={
                            rows.length === 0 ||
                            rows[rows.length - 1].upto === ""
                          }
                          className={`mt-4 bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded ${
                            rows.length === 0 ||
                            rows[rows.length - 1].upto === ""
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {/* Add Row */}
                          <MdOutlinePlaylistAdd />
                        </button>

                        <button
                          type="button"
                          disabled={rows.length <= 1}
                          className={`${
                            rows.length <= 1
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } bg-red-500 text-white ml-3 px-2 py-1 rounded hover:bg-red-600`}
                          onClick={handleDeleteRow}
                        >
                          <MdDeleteSweep />
                        </button>
                      </div>
                      <div className="mt-8">
                        <label
                          htmlFor="revisedChargeCheckbox"
                          className="inline-flex items-center"
                        >
                          <input
                            type="checkbox"
                            id="revisedChargeCheckbox"
                            className="form-checkbox h-5 w-5 text-indigo-600 transition duration-150 ease-in-out"
                            checked={isRevisedChargeApplicable}
                            onChange={handleRevisedChargeChange}
                          />
                          <span className="ml-2 text-gray-700">
                            Applicable for Revised Charge
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className="flex items-center  gap-0 mt-4 m-4 relative "></div>
                  <button
                    className="bg-pink-500 mt-4  w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                    type="button"
                    onClick={submitHandler}
                  >
                    Add
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Hsn;
