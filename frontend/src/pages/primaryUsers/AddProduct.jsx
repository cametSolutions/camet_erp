/* eslint-disable react/no-unknown-property */
/* eslint-disable react/jsx-no-target-blank */

import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { units } from "../../../constants/units";
import LevelNameTable from "../../components/table/LevelNameTable";
import { MdPlaylistAdd } from "react-icons/md";
function AddProduct() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [dropdown, setDropdown] = useState({
    brands: false,
    category: false,
    subCategory: false,
    addLevelName: false,
    addLocation: false,
  });

  const [addedBrand, setAddedBrand] = useState("");
  const [addedCategory, setAddedCategory] = useState("");
  const [addedSubCategory, setAddedSubCategory] = useState("");
  const [addedLevelName, setAddedLevelName] = useState("");
  const [addedLocation, setAddedLocation] = useState("");
  // dropdown from bnackend
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [hsn, setHsn] = useState([]);
  const [levelNames, setLevelNames] = useState([]);
  const [locations, setLocations] = useState([]);

  ////tab

  const [tab, setTab] = useState("priceLevel");

  // selected ones
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [altUnit, setAltUnit] = useState("");

  const [edit, setEdit] = useState({
    brands: false,
    brandIndex: null,
    categories: false,
    categoryIndex: null,
    subCategories: false,
    subCategoryIndex: null,
    levelNames: false,
    levelNameIndex: null,
    locations: false,
    locationIndex: null,
  });
  const [refresh, setRefresh] = useState(false);

  ///////////// levelname table ///////////////////

  const [rows, setRows] = useState([
    { id: Math.random(), level: "", rate: "" },
  ]);
  const [levelNameData, setLevelNameData] = useState([]);

  useEffect(() => {
    // Update levelNameData whenever rows change
    setLevelNameData(rows.map((row) => ({ level: row.level, rate: row.rate })));
  }, [rows]);

  const handleAddRow = () => {
    setRows([...rows, { id: Math.random(), level: "", rate: "" }]);
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const handleLevelChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].level = value;
    setRows(newRows);
  };

  const handleRateChange = (index, value) => {
    const newRows = [...rows];
    newRows[index].rate = value;
    setRows(newRows);
  };
console.log(levelNameData);

  ///////////// location table ///////////////////

  const [locationRows, setLocationRows] = useState([
    { id: Math.random(), location: "", rate: "" },
  ]);
  const [locationData, setLocationData] = useState([]);

  useEffect(() => {
    // Update levelNameData whenever rows change
    setLocationData(locationRows.map((row) => ({ location: row.location, rate: row.rate })));
  }, [locationRows]);

  const handleAddLocationRow = () => {
    setLocationRows([
      ...locationRows,
      { id: Math.random(), location: "", rate: "" },
    ]);
  };

  const handleDeleteLocationRow = (id) => {
    setLocationRows(locationRows.filter((row) => row.id !== id));
  };

  const handleLocationChange = (index, value) => {
    const newRows = [...locationRows];
    newRows[index].location = value;
    setLocationRows(newRows);
  };

  const handleLocationRateChange = (index, value) => {
    const newRows = [...locationRows];
    newRows[index].rate = value;
    setLocationRows(newRows);
  };
  
  console.log(locationData);
console.log(levelNameData);


  ////////////////////////treble enddddd///////////////////////////////////////////////////////////

  const orgId = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  // fetching organization for getting brands category etc
  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/getSingleOrganization/${orgId}`,
          {
            withCredentials: true,
          }
        );

        console.log(res.data.organizationData);
        const { brands, categories, subcategories, levelNames, locations } =
          res.data.organizationData;
        console.log(brands);
        setBrands(brands);
        setCategories(categories);
        setSubCategories(subcategories);
        setLevelNames(levelNames);
        setLocations(locations);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleOrganization();
  }, [refresh, orgId]);

  // fetching hsn /////////////////////////////////////

  useEffect(() => {
    const fetchHsn = async () => {
      try {
        const res = await api.get(`/api/pUsers/fetchHsn/${orgId}`, {
          withCredentials: true,
        });

        setHsn(res.data.data);

        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHsn();
  }, [refresh, orgId]);

  const addDataToOrg = async (params, value) => {
    let body = {};
    if (params == "brands") {
      body["brands"] = value;
    }
    if (params == "categories") {
      body["categories"] = value;
    }
    if (params == "subcategories") {
      body["subcategories"] = value;
    }
    if (params == "levelNames") {
      body["levelNames"] = value;
    }
    if (params == "locations") {
      body["locations"] = value;
    }

    try {
      const res = await api.post(`/api/pUsers/addDataToOrg/${orgId}`, body, {
        withCredentials: true,
      });

      toast.success(res.data.message);
      setRefresh(!refresh);
      if (params == "brands") {
        setAddedBrand("");
      }
      if (params == "categories") {
        setAddedCategory("");
      }
      if (params == "subcategories") {
        setAddedSubCategory("");
      }
      if (params == "levelNames") {
        setAddedLevelName("");
      }
      if (params == "locations") {
        setAddedLocation("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const editDataInOrg = async (params, value) => {
    let body = {};
    if (params == "brands") {
      body["brands"] = value;
      body["index"] = edit.brandIndex;
    }
    if (params == "categories") {
      body["categories"] = value;
      body["index"] = edit.categoryIndex;
    }
    if (params == "subcategories") {
      body["subcategories"] = value;
      body["index"] = edit.subCategoryIndex;
    }
    if (params == "levelNames") {
      console.log(value);
      body["levelNames"] = value;
      body["index"] = edit.levelNameIndex;
    }
    if (params == "locations") {
      console.log(value);
      body["locations"] = value;
      body["index"] = edit.locationIndex;
    }

    try {
      const res = await api.post(`/api/pUsers/editDataInOrg/${orgId}`, body, {
        withCredentials: true,
      });

      toast.success(res.data.message);
      setRefresh(!refresh);
      if (params == "brands") {
        setAddedBrand("");
        setEdit({ brands: false });
        setSelectedBrand("");
      }
      if (params == "categories") {
        setAddedCategory("");
        setEdit({ categories: false });
        setSelectedCategory("");
      }
      if (params == "subcategories") {
        setAddedSubCategory("");
        setEdit({ subCategories: false });
        setSelectedSubCategory("");
      }
      if (params == "levelNames") {
        setAddedLevelName("");
        setEdit({ levelNames: false });
      }
      if (params == "locations") {
        setAddedLocation("");
        setEdit({ locations: false });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const deleteDataInOrg = async (params, index) => {
    let body = {};
    if (params == "brands") {
      body["brands"] = index;
    }
    if (params == "categories") {
      body["categories"] = index;
    }
    if (params == "subcategories") {
      body["subcategories"] = index;
    }
    if (params == "levelNames") {
      body["levelNames"] = index;
    }
    if (params == "locations") {
      body["locations"] = index;
    }

    try {
      const res = await api.post(`/api/pUsers/deleteDataInOrg/${orgId}`, body, {
        withCredentials: true,
      });

      toast.success(res.data.message);
      setRefresh(!refresh);

      if (params == "brands") {
        setSelectedBrand("");
      }
      if (params == "categories") {
        setSelectedCategory("");
      }
      if (params == "subcategories") {
        setSelectedSubCategory("");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const handleEdit = (el, params, index) => {
    if (params === "brands") {
      setAddedBrand(el);
      setDropdown({ brands: !dropdown.brands });
      setEdit({ brands: true, brandIndex: index });
    }
    if (params === "categories") {
      setAddedCategory(el);
      setDropdown({ category: !dropdown.category });
      setEdit({ categories: true, categoryIndex: index });
    }
    if (params === "subcategories") {
      setAddedSubCategory(el);
      setDropdown({ subCategories: !dropdown.subCategories });
      setEdit({ subCategories: true, subCategoryIndex: index });
    }
    if (params === "levelNames") {
      setAddedLevelName(el);
      setDropdown({ addLevelName: !dropdown.addLevelName });
      setEdit({ levelNames: true, levelNameIndex: index });
    }
    if (params === "locations") {
      setAddedLocation(el);
      setDropdown({ addLocation: !dropdown.addLocation });
      setEdit({ locations: true, locationIndex: index });
    }
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  return (
    <div className="flex ">
      <div>
        <Sidebar />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#012A4A] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl"
          />
          <p>Add Product</p>
        </div>
        <section className="  py-1 bg-blueGray-50">
          <div className="w-full lg:w-8/12 px-4 mx-auto mt-6">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-6 py-6">
                <div className="text-center flex justify-between">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    Product Details
                  </h6>
                  <button
                    className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    type="button"
                  >
                    Settings
                  </button>
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
                          id="brandSelect"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        >
                          <option value="">Select a unit</option>
                          {units.map((el, index) => (
                            <option key={index} value={el}>
                              {el}
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
                          id="brandSelect"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        >
                          <option value="">Select an Alt.unit</option>
                          {units.map((el, index) => (
                            <option key={index} value={el}>
                              {el}
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
                              type="text"
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

                          <div className=" flex flex-col   md:flex-row justify-center items-center gap-2">
                            <input
                              type="text"
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
                            setAltUnit(e.target.value);
                          }}
                          id="brandSelect"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        >
                          <option value="">Select Hsn</option>
                          {hsn.length > 0 ? (
                            hsn.map((el, index) => (
                              <option key={index} value={el}>
                                {el.hsn}
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
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          placeholder="Product Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* adding brand **********************************************************************************/}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Brand{" "}
                  </h6>

                  <div className="flex">
                    <button
                      data-tooltip-id="brand-tooltip"
                      data-tooltip-content={selectedBrand}
                      data-tooltip-place="top"
                      // onClick={() => {
                      //   setDropdown({ brands: !dropdown.brands });
                      // }}
                      onClick={() => {
                        setDropdown({ brands: !dropdown.brands });
                      }}
                      id="dropdown"
                      data-dropdown-toggle="dropdown"
                      className="flex-shrink-0 w-4/12 md:w-5/12  inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  bg-slate-300 border border-e-0 border-gray-300  hover:bg-slate-400   focus:ring-1 focus:outline-none focus:ring-gray-300  "
                      type="button"
                    >
                      <span className="md:hidden">
                        {selectedBrand.length > 0
                          ? selectedBrand.length > 5
                            ? `${selectedBrand.slice(0, 5)}...`
                            : selectedBrand
                          : "Brands"}
                      </span>
                      <span className="hidden md:block lg:hidden">
                        {selectedBrand.length > 0
                          ? selectedBrand.length > 10
                            ? `${selectedBrand.slice(0, 10)}...`
                            : selectedBrand
                          : "Select Brand"}
                      </span>
                      <span className="hidden lg:block">
                        {selectedBrand.length > 0
                          ? selectedBrand.length > 20
                            ? `${selectedBrand.slice(0, 20)}...`
                            : selectedBrand
                          : "Select Brand"}
                      </span>

                      <svg
                        className="w-2.5 h-2.5 ms-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                    <Tooltip
                      id="brand-tooltip"
                      place="bottom"
                      effect="solid"
                      className="bg-red-500"
                    >
                      {selectedBrand}
                    </Tooltip>
                    <a></a>

                    <div className="relative w-full">
                      <input
                        onChange={(e) => {
                          setAddedBrand(e.target.value);
                          if (e.target.value === "") {
                            setEdit((prevState) => ({
                              ...prevState,
                              brands: false,
                            }));
                          }
                        }}
                        value={addedBrand}
                        type="search"
                        id="search-dropdown"
                        className="block p-2.5 w-full  text-sm text-gray-900 bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a new brand"
                      />
                      <button
                        onClick={() => {
                          if (edit.brands) {
                            editDataInOrg("brands", addedBrand); // Call editData if edit.brands is true
                          } else {
                            addDataToOrg("brands", addedBrand); // Call addDataToOrg if edit.brands is false
                          }
                        }}
                        type="button"
                        className="absolute top-0 end-0  px-5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                      >
                        {edit.brands ? "Edit" : "Add"}
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full ">
                    {dropdown.brands && (
                      <div
                        id="dropdown"
                        className="z-50 absolute top-2 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow   "
                      >
                        <ul
                          className="py-2 text-sm text-gray-700  "
                          aria-labelledby="dropdown-button"
                        >
                          {brands.length > 0 ? (
                            brands.map((el, index) => (
                              <li key={index}>
                                <a
                                  href="#"
                                  className="block p-2 hover:bg-gray-100 text-left   "
                                >
                                  <div
                                    data-tooltip-id="dropdown-tooltip"
                                    data-tooltip-content={el}
                                    data-tooltip-place="right-end"
                                    className="flex items-center justify-between gap-12  "
                                  >
                                    <span
                                      onClick={() => {
                                        setSelectedBrand(el);
                                        dropdown.brands = false;
                                      }}
                                      className="text-pink-900  whitespace-nowrap "
                                    >
                                      {el.length > 10
                                        ? `${el.slice(0, 10)}....`
                                        : el}
                                    </span>
                                    <div className="flex gap-3 ">
                                      <FaEdit
                                        onClick={() => {
                                          handleEdit(el, "brands", index);
                                        }}
                                        className=" hover:scale-110 duration-100 ease-in-out text-blue-500"
                                      />
                                      <MdDelete
                                        onClick={() => {
                                          deleteDataInOrg("brands", index);
                                        }}
                                        className="hover:scale-110  duration-100 ease-in-out text-red-700"
                                      />
                                    </div>
                                  </div>
                                  <hr className="mt-2" />
                                </a>
                              </li>
                            ))
                          ) : (
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                No brands were added
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Tooltip
                    id="dropdown-tooltip"
                    place="bottom"
                    effect="solid"
                    className="bg-red-500"
                  >
                    {selectedBrand}
                  </Tooltip>
                  {/* adding brand end **********************************************************************************/}

                  {/* adding category **********************************************************************************/}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Category{" "}
                  </h6>

                  <div className="flex">
                    <button
                      data-tooltip-id="categories"
                      data-tooltip-content={selectedCategory}
                      data-tooltip-place="top"
                      onClick={() => {
                        setDropdown({ category: !dropdown.category });
                      }}
                      id=""
                      data-dropdown-toggle="dropdown"
                      className="flex-shrink-0 w-4/12 md:w-5/12  inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  bg-slate-300 border border-e-0 border-gray-300  hover:bg-slate-400  focus:ring-1 focus:outline-none focus:ring-gray-300  "
                      type="button"
                    >
                      <span className="md:hidden">
                        {selectedCategory.length > 0
                          ? selectedCategory.length > 5
                            ? `${selectedCategory.slice(0, 5)}...`
                            : selectedCategory
                          : "Category"}
                      </span>
                      <span className="hidden md:block lg:hidden">
                        {selectedCategory.length > 0
                          ? selectedCategory.length > 10
                            ? `${selectedCategory.slice(0, 10)}...`
                            : selectedCategory
                          : "Select Category"}
                      </span>
                      <span className="hidden lg:block">
                        {selectedCategory.length > 0
                          ? selectedCategory.length > 20
                            ? `${selectedCategory.slice(0, 20)}...`
                            : selectedCategory
                          : "Select Category"}
                      </span>

                      <svg
                        className="w-2.5 h-2.5 ms-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                    <Tooltip
                      id="categories"
                      place="bottom"
                      effect="solid"
                      className="bg-red-500"
                    >
                      {selectedCategory}
                    </Tooltip>
                    <a></a>

                    <div className="relative w-full">
                      <input
                        onChange={(e) => {
                          setAddedCategory(e.target.value);
                          if (e.target.value === "") {
                            setEdit((prevState) => ({
                              ...prevState,
                              categories: false,
                            }));
                          }
                        }}
                        value={addedCategory}
                        type="search"
                        id="search-dropdown"
                        className="block p-2.5 w-full  text-sm text-gray-900 bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a new category"
                      />
                      <button
                        onClick={() => {
                          if (edit.categories) {
                            editDataInOrg("categories", addedCategory); // Call editData if edit.brands is true
                          } else {
                            addDataToOrg("categories", addedCategory); // Call addDataToOrg if edit.brands is false
                          }
                        }}
                        type="button"
                        className="absolute top-0 end-0  px-5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                      >
                        {edit.categories ? "Edit" : "Add"}
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full ">
                    {dropdown.category && (
                      <div
                        id="dropdown"
                        className="z-50 absolute top-2 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow   "
                      >
                        <ul
                          className="py-2 text-sm text-gray-700  "
                          aria-labelledby="dropdown-button"
                        >
                          {categories.length > 0 ? (
                            categories.map((el, index) => (
                              <li key={index}>
                                <a
                                  href="#"
                                  className="block p-2 hover:bg-gray-100 text-left   "
                                >
                                  <div
                                    data-tooltip-id="dropdown-tooltip"
                                    data-tooltip-content={el}
                                    data-tooltip-place="right-end"
                                    className="flex items-center justify-between gap-12  "
                                  >
                                    <span
                                      onClick={() => {
                                        setSelectedCategory(el);
                                        dropdown.category = false;
                                      }}
                                      className="text-pink-900  whitespace-nowrap "
                                    >
                                      {el.length > 10
                                        ? `${el.slice(0, 10)}....`
                                        : el}
                                    </span>
                                    <div className="flex gap-3 ">
                                      <FaEdit
                                        onClick={() => {
                                          handleEdit(el, "categories", index);
                                        }}
                                        className=" hover:scale-110 duration-100 ease-in-out text-blue-500"
                                      />
                                      <MdDelete
                                        onClick={() => {
                                          deleteDataInOrg("categories", index);
                                        }}
                                        className="hover:scale-110  duration-100 ease-in-out text-red-700"
                                      />
                                    </div>
                                  </div>
                                  <hr className="mt-2" />
                                </a>
                              </li>
                            ))
                          ) : (
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                No categories were added
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Tooltip
                    id="dropdown-tooltip"
                    place="bottom"
                    effect="solid"
                    className="bg-red-500"
                  >
                    {selectedCategory}
                  </Tooltip>
                  {/* adding category **********************************************************************************/}

                  {/* adding  subcategory **********************************************************************************/}
                  <hr className="mt-6 border-b-1 border-blueGray-300" />

                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Sub Category{" "}
                  </h6>

                  <div className="flex">
                    <button
                      data-tooltip-id="subcategories"
                      data-tooltip-content={selectedSubCategory}
                      data-tooltip-place="top"
                      onClick={() => {
                        setDropdown({ subCategory: !dropdown.subCategory });
                      }}
                      id=""
                      data-dropdown-toggle="dropdown"
                      className="flex-shrink-0 w-4/12 md:w-5/12  inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900  bg-slate-300 border border-e-0 border-gray-300  hover:bg-slate-400  focus:ring-1 focus:outline-none focus:ring-gray-300  "
                      type="button"
                    >
                      <span className="md:hidden">
                        {selectedSubCategory.length > 0
                          ? selectedSubCategory.length > 5
                            ? `${selectedSubCategory.slice(0, 5)}...`
                            : selectedSubCategory
                          : "Subcategory"}
                      </span>
                      <span className="hidden md:block lg:hidden">
                        {selectedSubCategory.length > 0
                          ? selectedSubCategory.length > 10
                            ? `${selectedSubCategory.slice(0, 10)}...`
                            : selectedSubCategory
                          : "Subcategory"}
                      </span>
                      <span className="hidden lg:block">
                        {selectedSubCategory.length > 0
                          ? selectedSubCategory.length > 10
                            ? `${selectedSubCategory.slice(0, 10)}...`
                            : selectedSubCategory
                          : "Select Sub Category"}
                      </span>

                      <svg
                        className="w-2.5 h-2.5 ms-2.5"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 10 6"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 4 4 4-4"
                        />
                      </svg>
                    </button>
                    <Tooltip
                      id="brand-tooltip"
                      place="bottom"
                      effect="solid"
                      className="bg-red-500"
                    >
                      {selectedSubCategory}
                    </Tooltip>
                    <a></a>

                    <div className="relative w-full">
                      <input
                        onChange={(e) => {
                          setAddedSubCategory(e.target.value);
                          if (e.target.value === "") {
                            setEdit((prevState) => ({
                              ...prevState,
                              subCategories: false,
                            }));
                          }
                        }}
                        value={addedSubCategory}
                        type="search"
                        id="search-dropdown"
                        className="block p-2.5 w-full  text-sm text-gray-900 bg-gray-50 rounded-e-lg rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a new sub category"
                      />
                      <button
                        onClick={() => {
                          if (edit.subCategories) {
                            editDataInOrg("subcategories", addedSubCategory); // Call editData if edit.brands is true
                          } else {
                            addDataToOrg("subcategories", addedSubCategory); // Call addDataToOrg if edit.brands is false
                          }
                        }}
                        type="button"
                        className="absolute top-0 end-0  px-5 h-full text-sm font-medium text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                      >
                        {edit.subCategories ? "Edit" : "Add"}
                      </button>
                    </div>
                  </div>
                  <div className="relative w-full ">
                    {dropdown.subCategory && (
                      <div
                        id="dropdown"
                        className="z-50 absolute top-2 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow   "
                      >
                        <ul
                          className="py-2 text-sm text-gray-700  "
                          aria-labelledby="dropdown-button"
                        >
                          {subCategories.length > 0 ? (
                            subCategories.map((el, index) => (
                              <li key={index}>
                                <a
                                  href="#"
                                  className="block p-2 hover:bg-gray-100 text-left   "
                                >
                                  <div
                                    data-tooltip-id="dropdown-tooltip"
                                    data-tooltip-content={el}
                                    data-tooltip-place="right-end"
                                    className="flex items-center justify-between gap-12  "
                                  >
                                    <span
                                      onClick={() => {
                                        setSelectedSubCategory(el);
                                        dropdown.subCategory = false;
                                      }}
                                      className="text-pink-900  whitespace-nowrap "
                                    >
                                      {el.length > 10
                                        ? `${el.slice(0, 10)}....`
                                        : el}
                                    </span>
                                    <div className="flex gap-3 ">
                                      <FaEdit
                                        onClick={() => {
                                          handleEdit(
                                            el,
                                            "subcategories",
                                            index
                                          );
                                        }}
                                        className=" hover:scale-110 duration-100 ease-in-out text-blue-500"
                                      />
                                      <MdDelete
                                        onClick={() => {
                                          deleteDataInOrg(
                                            "subcategories",
                                            index
                                          );
                                        }}
                                        className="hover:scale-110  duration-100 ease-in-out text-red-700"
                                      />
                                    </div>
                                  </div>
                                  <hr className="mt-2" />
                                </a>
                              </li>
                            ))
                          ) : (
                            <li>
                              <a
                                href="#"
                                className="block px-4 py-2 hover:bg-gray-100 "
                              >
                                No sub categories were added
                              </a>
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Tooltip
                    id="subcategories"
                    place="bottom"
                    effect="solid"
                    className="bg-red-500"
                  >
                    {selectedBrand}
                  </Tooltip>
                  {/* adding subcategory end **********************************************************************************/}
                </form>

                <div className=" flex flex-col  md:flex-row gap-3 justify-between ">
                  {/* adding level name**********************************************************************************/}
                  <div>
                    <hr className="mt-6 border-b-1 border-blueGray-300" />

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      Level name
                    </h6>

                    <div className="flex ">
                      <button
                        onClick={() => {
                          setDropdown({ addLevelName: !dropdown.addLevelName });
                        }}
                        id="dropdown"
                        data-dropdown-toggle="dropdown"
                        className="flex-shrink-0   inline-flex items-center py-2.5 px-1  text-sm font-medium text-center text-gray-900 bg-slate-300 border border-e-0 border-gray-300  hover:bg-slate-400  focus:ring-1 focus:outline-none focus:ring-gray-300  "
                        type="button"
                      >
                        <svg
                          className="w-2.5 h-2.5 "
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 1 4 4 4-4"
                          />
                        </svg>
                      </button>

                      <div className="w-full flex ">
                        <input
                          onChange={(e) => {
                            setAddedLevelName(e.target.value);
                            if (e.target.value === "") {
                              setEdit((prevState) => ({
                                ...prevState,
                                levelNames: false,
                              }));
                            }
                          }}
                          value={addedLevelName}
                          type="search"
                          id="search-dropdown"
                          className="block p-2.5   text-sm text-gray-900 bg-gray-50  rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter a new brand"
                        />
                        <button
                          onClick={() => {
                            if (edit.levelNames) {
                              editDataInOrg("levelNames", addedLevelName); // Call editData if edit.brands is true
                            } else {
                              addDataToOrg("levelNames", addedLevelName); // Call addDataToOrg if edit.brands is false
                            }
                          }}
                          type="button"
                          className="  px-5 h-full text-sm font-medium text-white bg-blue-700 border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                        >
                          {edit.levelNames ? "Edit" : "Add"}
                        </button>
                      </div>
                    </div>
                    <div className="relative w-full ">
                      {dropdown.addLevelName && (
                        <div
                          id="dropdown"
                          className="z-50 absolute top-2 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow   "
                        >
                          <ul
                            className="py-2 text-sm text-gray-700  "
                            aria-labelledby="dropdown-button"
                          >
                            {levelNames.length > 0 ? (
                              levelNames.map((el, index) => (
                                <li key={index}>
                                  <a
                                    href="#"
                                    className="block p-2 hover:bg-gray-100 text-left   "
                                  >
                                    <div
                                      data-tooltip-id="dropdown-tooltip"
                                      data-tooltip-content={el}
                                      data-tooltip-place="right-end"
                                      className="flex items-center justify-between gap-12  "
                                    >
                                      <span
                                        onClick={() => {
                                          setSelectedBrand(el);
                                          dropdown.brands = false;
                                        }}
                                        className="text-pink-900  whitespace-nowrap "
                                      >
                                        {el.length > 10
                                          ? `${el.slice(0, 10)}....`
                                          : el}
                                      </span>
                                      <div className="flex gap-3 ">
                                        <FaEdit
                                          onClick={() => {
                                            handleEdit(el, "levelNames", index);
                                          }}
                                          className=" hover:scale-110 duration-100 ease-in-out text-blue-500"
                                        />
                                        <MdDelete
                                          onClick={() => {
                                            deleteDataInOrg(
                                              "levelNames",
                                              index
                                            );
                                          }}
                                          className="hover:scale-110  duration-100 ease-in-out text-red-700"
                                        />
                                      </div>
                                    </div>
                                    <hr className="mt-2" />
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li>
                                <a
                                  href="#"
                                  className="block px-4 py-2 hover:bg-gray-100 "
                                >
                                  No level names were added
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Tooltip
                      id="dropdown-tooltip"
                      place="bottom"
                      effect="solid"
                      className="bg-red-500"
                    >
                      {selectedBrand}
                    </Tooltip>
                  </div>
                  {/* adding level name end **********************************************************************************/}
                  {/* adding Location name**********************************************************************************/}
                  <div>
                    <hr className="mt-6 border-b-1 border-blueGray-300" />

                    <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                      add Location
                    </h6>

                    <div className="flex w-6/12">
                      <button
                        onClick={() => {
                          setDropdown({ addLocation: !dropdown.addLocation });
                        }}
                        id="dropdown"
                        data-dropdown-toggle="dropdown"
                        className="flex-shrink-0 flex justify-center items-center py-2.5 px-1  text-sm font-medium text-center text-gray-900  bg-slate-300 border border-e-0 border-gray-300  hover:bg-slate-400  focus:ring-1 focus:outline-none focus:ring-gray-300  "
                        type="button"
                      >
                        <svg
                          className="w-2.5 h-2.5 "
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 10 6"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="m1 1 4 4 4-4"
                          />
                        </svg>
                      </button>

                      <div className="flex w-full">
                        <input
                          onChange={(e) => {
                            setAddedLocation(e.target.value);
                            if (e.target.value === "") {
                              setEdit((prevState) => ({
                                ...prevState,
                                locations: false,
                              }));
                            }
                          }}
                          value={addedLocation}
                          type="search"
                          id="search-dropdown"
                          className="block p-2.5   text-sm text-gray-900 bg-gray-50  rounded-s-gray-100 rounded-s-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter a new brand"
                        />
                        <button
                          onClick={() => {
                            if (edit.locations) {
                              editDataInOrg("locations", addedLocation); // Call editData if edit.brands is true
                            } else {
                              addDataToOrg("locations", addedLocation); // Call addDataToOrg if edit.brands is false
                            }
                          }}
                          type="button"
                          className=" px-5 h-full text-sm font-medium text-white bg-blue-700 border border-blue-700 hover:bg-blue-800 focus:ring-2 focus:outline-none focus:ring-blue-300 "
                        >
                          {edit.locations ? "Edit" : "Add"}
                        </button>
                      </div>
                    </div>
                    <div className="relative w-full ">
                      {dropdown.addLocation && (
                        <div
                          id="dropdown"
                          className="z-50 absolute top-2 left-0 bg-white divide-y divide-gray-100 rounded-lg shadow   "
                        >
                          <ul
                            className="py-2 text-sm text-gray-700  "
                            aria-labelledby="dropdown-button"
                          >
                            {locations.length > 0 ? (
                              locations.map((el, index) => (
                                <li key={index}>
                                  <a
                                    href="#"
                                    className="block p-2 hover:bg-gray-100 text-left   "
                                  >
                                    <div
                                      data-tooltip-id="dropdown-tooltip"
                                      data-tooltip-content={el}
                                      data-tooltip-place="right-end"
                                      className="flex items-center justify-between gap-12  "
                                    >
                                      <span
                                        onClick={() => {
                                          dropdown.addLocation = false;
                                        }}
                                        className="text-pink-900  whitespace-nowrap "
                                      >
                                        {el.length > 10
                                          ? `${el.slice(0, 10)}....`
                                          : el}
                                      </span>
                                      <div className="flex gap-3 ">
                                        <FaEdit
                                          onClick={() => {
                                            handleEdit(el, "locations", index);
                                          }}
                                          className=" hover:scale-110 duration-100 ease-in-out text-blue-500"
                                        />
                                        <MdDelete
                                          onClick={() => {
                                            deleteDataInOrg("locations", index);
                                          }}
                                          className="hover:scale-110  duration-100 ease-in-out text-red-700"
                                        />
                                      </div>
                                    </div>
                                    <hr className="mt-2" />
                                  </a>
                                </li>
                              ))
                            ) : (
                              <li>
                                <a
                                  href="#"
                                  className="block px-4 py-2 hover:bg-gray-100 "
                                >
                                  No locations were added
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Tooltip
                      id="dropdown-tooltip"
                      place="bottom"
                      effect="solid"
                      className="bg-red-500"
                    >
                      {selectedBrand}
                    </Tooltip>
                  </div>
                </div>

                {/* adding level name end **********************************************************************************/}
              </div>

              <div className="flex justify-center ">
                <div className="mt-[10px]  border-b border-solid border-[#0066ff43]  ">
                  <button
                    type="button"
                    onClick={() => setTab("priceLevel")}
                    className={` ${
                      tab === "priceLevel" &&
                      "border-b border-solid border-black"
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
                <div className="p-6">
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
                        {rows.map((row, index) => (
                          <tr key={row.id} className="border-b bg-[#EFF6FF] ">
                            <td className="px-4 py-2">
                              <select
                                value={row.level}
                                onChange={(e) =>
                                  handleLevelChange(index, e.target.value)
                                }
                                className="block w-full  px-4  rounded-md bg-[#EFF6FF] text-sm focus:outline-none"
                              >
                                {/* Options for dropdown */}
                                <option value="">Select Level</option>
                                {levelNames.map((el, index) => (
                                  <option key={index} value={el}>
                                    {el}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 ">
                              <input
                                type="text"
                                value={row.rate}
                                onChange={(e) =>
                                  handleRateChange(index, e.target.value)
                                }
                                className="w-full py-1 px-4 border bg-[#EFF6FF] border-gray-300   text-sm focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
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
                      className="mt-4 px-3 py-1 bg-green-500 text-white rounded"
                    >
                      <MdPlaylistAdd />
                    </button>
                  </div>
                </div>
              )}


{tab === "location" && (
                <div className="p-6">
                  <div className="container mx-auto mt-8">
                    <table className="table-fixed w-full bg-white shadow-md rounded-lg ">
                      <thead className="bg-[#f7f7f7] border">
                        <tr>
                          <th className="w-1/2 px-4 py-1">Location</th>
                          <th className="w-1/2 px-4 py-1">Rate</th>
                          <th className="  w-2/12 px-4 py-1"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {locationRows.map((row, index) => (
                          <tr key={row.id} className="border-b bg-[#EFF6FF] ">
                            <td className="px-4 py-2">
                              <select
                                value={row.level}
                                onChange={(e) =>
                                  handleLocationChange(index, e.target.value)
                                }
                                className="block w-full  px-4  rounded-md bg-[#EFF6FF] text-sm focus:outline-none"
                              >
                                {/* Options for dropdown */}
                                <option value="">Select Level</option>
                                {locations.map((el, index) => (
                                  <option key={index} value={el}>
                                    {el}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 ">
                              <input
                                type="text"
                                value={row.rate}
                                onChange={(e) =>
                                  handleLocationRateChange(index, e.target.value)
                                }
                                className="w-full py-1 px-4 border bg-[#EFF6FF] border-gray-300   text-sm focus:outline-none"
                              />
                            </td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleDeleteLocationRow(row.id)}
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


         
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AddProduct;
