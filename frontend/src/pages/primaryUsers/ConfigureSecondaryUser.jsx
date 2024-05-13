import { useEffect, useState } from "react";
import Sidebar from "../../components/homePage/Sidebar";

import api from "../../api/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

function ConfigureSecondaryUser() {
  const [godowns, setGodowns] = useState([]);
  const [priceLevels, setPriceLevels] = useState([]);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState([]);
  const [selectedGodowns, setSelectedGodowns] = useState([]);
  const [godownConfigOption, setGodownConfigOption] = useState("");
  const [vanSaleGodownName, setVanSaleGodownName] = useState('')
  const [godownPrefix, setGodownPrefix] = useState("");
  const [godownWidth, setGodownWidth] = useState("");
  const [godownSuffix, setGodownSuffix] = useState("");
  const [godownStartingNumber, setGodownStartingNumber] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("sales");
  const [vanSale, setVanSale] = useState(false);

  console.log(godowns);
  console.log(godownConfigOption);
  console.log(godownWidth);
  console.log(godownSuffix);
  console.log(godownStartingNumber);



  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg.type

  );

  console.log(godowns);

  const [sales, setSales] = useState([
    {
      prefixDetails: "",
      suffixDetails: "",
      startingNumber: "",
      widthOfNumericalPart: "",
    },
  ]);
  const [salesOrder, setSalesOrder] = useState([
    {
      prefixDetails: "",
      suffixDetails: "",
      startingNumber: "",
      widthOfNumericalPart: "",
    },
  ]);
  const [receipt, setReceipt] = useState([
    {
      prefixDetails: "",
      suffixDetails: "",
      startingNumber: "",
      widthOfNumericalPart: "",
    },
  ]);

  // console.log(receipt);
  // console.log(salesOrder);
  // console.log(sales);
  // console.log(godowns);

  const { id, userId, cmp_name } = useParams();
  // const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  const naviagte = useNavigate();

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/fetchGodownsAndPriceLevels/${id}`,
          {
            withCredentials: true,
          }
        );

        console.log(res.data.data.godowns);

        setGodowns(res.data.data.godowns);
        setPriceLevels(res.data.data.priceLevels);
        setGodownConfigOption(res.data.data.godowns[0]?.id);
        setVanSaleGodownName(res.data.data.godowns[0]?.godown)
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    fetchGodowns();
  }, []);

  useEffect(() => {
    const fetchSingleUser = async () => {
      try {
        const res = await api.get(`/api/pUsers/getSecUserDetails/${userId}`, {
          withCredentials: true,
        });
        const fullConfigurations = res?.data?.data?.configurations;
        const configurations =
          new Array(
            fullConfigurations.find((item) => item.organization === id)
          ) || [];

        console.log(res?.data?.data?.configurations);
        console.log(configurations);

        if (configurations?.length > 0) {
          const {
            selectedGodowns,
            selectedPriceLevels,
            salesOrderConfiguration,
            salesConfiguration,
            receiptConfiguration,
            vanSaleConfiguration,
            vanSale,
          } = configurations[0];

          console.log(vanSaleConfiguration);

          const {
            godownConfigOption,
            prefixDetails,
            suffixDetails,
            startingNumber,
            widthOfNumericalPart,
            vanSaleGodownName
          } = vanSaleConfiguration;

          setSelectedGodowns(selectedGodowns);
          setSelectedPriceLevels(selectedPriceLevels);
          setSalesOrder([salesOrderConfiguration]);
          setSales([salesConfiguration]);
          setReceipt([receiptConfiguration]);
          setGodownPrefix(prefixDetails);
          setGodownConfigOption(godownConfigOption);
          setGodownSuffix(suffixDetails);
          setGodownStartingNumber(startingNumber);
          setGodownWidth(widthOfNumericalPart);
          setVanSale(vanSale);
          setVanSaleGodownName(vanSaleGodownName)
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleUser();
  }, []);

  console.log(godownConfigOption);
  console.log(godownPrefix);
  console.log(godownPrefix);
  console.log(godownPrefix);

  const handleConfigSelection = (e) => {
    setSelectedConfig(e.target.value);
  };
  const updateConfig = (section, field, value) => {
    switch (section) {
      case "sales":
        setSales([{ ...sales[0], [field]: value }]);
        break;
      case "salesOrder":
        setSalesOrder([{ ...salesOrder[0], [field]: value }]);
        break;
      case "receipt":
        setReceipt([{ ...receipt[0], [field]: value }]);
        break;
      default:
        console.error("Invalid section");
    }
  };


  const getConfigValue = (section, field) => {
    console.log(field);
    switch (section) {
      case "sales":
        return sales[0][field];
      case "salesOrder":
        return salesOrder[0][field];
      case "receipt":
        return receipt[0][field];
      default:
        return "";
    }
  };

  const handleCheckboxChange = (type, value, checked) => {
    if (type === "priceLevel") {
      if (checked) {
        setSelectedPriceLevels([...selectedPriceLevels, value]);
      } else {
        setSelectedPriceLevels(
          selectedPriceLevels.filter((item) => item !== value)
        );
      }
    } else if (type === "godown") {
      if (checked) {
        setSelectedGodowns([...selectedGodowns, value]);
      } else {
        setSelectedGodowns(selectedGodowns.filter((item) => item !== value));
      }
    }
  };

  function validateObject(obj) {
    let isAllFilled = true;
    let isAllEmpty = true;

    for (let key in obj) {
      if (obj[key] !== "") {
        isAllEmpty = false;
      } else {
       
        isAllFilled = false;
      }
    }

    return isAllFilled || isAllEmpty;
  }


  const submitHandler = async () => {
    // Existing validation and submission logic...

    // Include the new configuration data in the formData object
    const newSales = sales[0];
    const newSalesOrder = salesOrder[0];
    const newReceipt = receipt[0];

    const Initial = {
      prefixDetails: "",
      suffixDetails: "",
      startingNumber: "",
      widthOfNumericalPart: "",
    };

    let formData = {};
    console.log(godownWidth);

    if (vanSale) {
      const vanSaleConfiguration = {
        godownConfigOption,
        prefixDetails: godownPrefix,
        suffixDetails: godownSuffix,
        startingNumber: godownStartingNumber,
        widthOfNumericalPart: godownWidth,
        vanSaleGodownName
      };
      formData = {
        selectedPriceLevels,
        selectedGodowns: [godownConfigOption],
        salesConfiguration: Initial,
        salesOrderConfiguration: newSalesOrder,
        receiptConfiguration: newReceipt,
        vanSaleConfiguration,
        vanSale: vanSale,
      };
    } else {
      formData = {
        selectedGodowns,
        selectedPriceLevels,
        salesConfiguration: newSales,
        salesOrderConfiguration: newSalesOrder,
        receiptConfiguration: newReceipt,
        vanSaleConfiguration: Initial,
        vanSale: vanSale,
      };
    }

    console.log(formData);

    const salesValidation = validateObject(formData.salesConfiguration);
    const salesOrderValidation = validateObject(
      formData.salesOrderConfiguration
    );
    const receiptValidation = validateObject(formData.receiptConfiguration);

    if (salesOrderValidation === false) {
      toast.error("Fill all sales order details or leave all fields empty");
      return;
    } else if (receiptValidation === false) {
      toast.error("Fill all receipt details or leave all fields empty");
      return;
    }
    if (vanSale) {
      const vanSaleConfiguration = formData.vanSaleConfiguration;

      let vanSaleValidation = true;
      for (let key in vanSaleConfiguration) {
        if (vanSaleConfiguration[key] === "") {
          vanSaleValidation = false;
        }
      }

      if (vanSaleValidation === false) {
        toast.error("Fill all van sale details or leave all fields empty");
        return;
      }
    } else {
      if (salesValidation === false) {
        toast.error("Fill all sales details or leave all fields empty");
        return;
      }
    }

    console.log(salesValidation);

    try {
      const res = await api.post(
        `/api/pUsers/addSecondaryConfigurations/${id}/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      naviagte(`/pUsers/editUser/${userId}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }

    // Existing API call...
  };

  return (
    <div className="flex overflow-y-hidden">
      <div className="" style={{ height: "100vh" }}>
        <Sidebar TAB={"addSec"} />
      </div>
      <div className="flex-1 h-screen overflow-y-scroll   ">
        <div className="  bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 sticky top-0 z-20 text-lg   ">
          <Link to={`/pUsers/editUser/${userId}`}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer " />
          </Link>
          <p> Configure Users </p>
        </div>
        <section className="  h-screen  px-3 md:px-7">
          <div className="flex-auto  lg:px-10 py-10 pt-0 shadow-lg  ">
            <form>
              <div className="flex flex-col  md:flex-row md:items-center my-10 ">
                <div className="w-auto px-4  ">
                  <button
                    type="button"
                    className="text-sm font-semibold    bg-violet-500 p-0.5 text-white rounded-sm px-3"
                  >
                    {cmp_name}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor="configSelection"
                    >
                      Configuration
                    </label>
                    <select
                      id="configSelection"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      onChange={handleConfigSelection}
                      value={selectedConfig}
                    >
                      <option value="sales">Sales</option>
                      <option value="salesOrder">Sales Order</option>
                      <option value="receipt">Receipt</option>
                    </select>
                  </div>
                </div>
              </div>

              <h6 className="text-blueGray-400 text-sm mb-6 font-bold uppercase px-4 mt-5">
                {selectedConfig.charAt(0).toUpperCase() +
                  selectedConfig.slice(1)}{" "}
                Configuration
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className={`   ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                      htmlFor="prefixDetails"
                    >
                      prefixDetails
                    </label>
                    <input
                      type="text"
                      id="prefixDetails"
                      className={`  ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                      onChange={(e) =>
                        updateConfig(
                          selectedConfig,
                          "prefixDetails",
                          e.target.value
                        )
                      }
                      value={getConfigValue(selectedConfig, "prefixDetails")}
                      placeholder="prefixDetails"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className={`   ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                      htmlFor="suffixDetails"
                    >
                      suffixDetails
                    </label>
                    <input
                      type="text"
                      id="suffixDetails"
                      className={`  ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                      onChange={(e) =>
                        updateConfig(
                          selectedConfig,
                          "suffixDetails",
                          e.target.value
                        )
                      }
                      value={getConfigValue(selectedConfig, "suffixDetails")}
                      placeholder="suffixDetails"
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className={`   ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                      htmlFor="startingNumber"
                    >
                      Starting Number
                    </label>
                    <input
                    disabled
                      type="number"
                      id="startingNumber"
                      className={`  ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                      onChange={(e) =>
                        updateConfig(
                          selectedConfig,
                          "startingNumber",
                          e.target.value
                        )
                      }
                      value={1}
                      placeholder="Starting Number"
                    />
                  </div>
                </div>
                {/* New input field for the width of the numerical part */}
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className={`   ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                      htmlFor="widthOfNumericalPart"
                    >
                      Width of Numerical Part
                    </label>
                    <input
                      type="number"
                      id="widthOfNumericalPart"
                      className={`  ${
                        vanSale && selectedConfig == "sales"
                          ? "pointer-events-none  opacity-45 "
                          : ""
                      }    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                      onChange={(e) =>
                        updateConfig(
                          selectedConfig,
                          "widthOfNumericalPart",
                          e.target.value
                        )
                      }
                      value={getConfigValue(
                        selectedConfig,
                        "widthOfNumericalPart"
                      )}
                      placeholder="Width of Numerical Part"
                    />
                  </div>
                </div>
              </div>

              <section className="px-4">
                <hr className="mt-5 border-b-1 border-blueGray-300" />
                <h6 className="text-blueGray-400 text-sm mb-6 font-bold uppercase mt-10">
                  Price Levels and Locations
                </h6>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4  ">
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase  ">
                      Price Levels
                    </h6>
                    <div className="space-y-2">
                      {priceLevels?.length > 0 ? (
                        priceLevels?.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`priceLevelCheckbox${index}`}
                              value={item?.priceLevel}
                              checked={selectedPriceLevels.includes(
                                item?.priceLevel
                              )}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "priceLevel",
                                  e.target.value,
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`priceLevelCheckbox${index}`}
                              className="text-blueGray-600"
                            >
                              {item?.priceLevel}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-blueGray-600">
                          No Price Levels added
                        </p>
                      )}
                    </div>
                  </div>
                  {type !== "self" && (
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                      Locations
                    </h6>
                    <div
                      className={` ${
                        vanSale ? "pointer-events-none opacity-45" : ""
                      } space-y-2 `}
                    >
                      {godowns?.length > 0 ? (
                        godowns?.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`godownCheckbox${index}`}
                              value={item?.id}
                              checked={selectedGodowns.includes(item?.id)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "godown",
                                  e.target.value,
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`godownCheckbox${index}`}
                              className="text-blueGray-600"
                            >
                              {item?.godown}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-blueGray-600">No Godowns added</p>
                      )}
                    </div>
                  </div>
                   )}
                     {type == "self" && (
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                      Locations
                    </h6>
                    <div
                      className={` ${
                        vanSale ? "pointer-events-none opacity-45" : ""
                      } space-y-2 `}
                    >
                      {godowns?.length > 0 ? (
                        godowns?.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`godownCheckbox${index}`}
                              value={item?.id}
                              checked={selectedGodowns.includes(item?.id)}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "godown",
                                  e.target.value,
                                  e.target.checked
                                )
                              }
                              className="mr-2"
                            />
                            <label
                              htmlFor={`godownCheckbox${index}`}
                              className="text-blueGray-600"
                            >
                              {item?.godown}
                            </label>
                          </div>
                        ))
                      ) : (
                        <p className="text-blueGray-600">No Godowns added</p>
                      )}
                    </div>
                  </div>
                   )}
                </div>

                <hr className="mt-5 border-b-1 border-blueGray-300" />

                <div className=" flex items-center">
                  <input
                    type="checkbox"
                    id="vanSaleCheckbox"
                    checked={vanSale}
                    onChange={() => {
                      setVanSale(!vanSale);
                      // setSelectedGodowns([]);
                      // setSales([
                      //   {
                      //     prefixDetails: "",
                      //     suffixDetails: "",
                      //     startingNumber: "",
                      //     widthOfNumericalPart: "",
                      //   },
                      // ]);
                    }}
                    className="form-checkbox h-5 w-5 text-green-600 rounded mt-8"
                  />
                  <label
                    htmlFor="vanSaleCheckbox"
                    className="ml-2 font-semibold uppercase mt-8"
                  >
                    Van Sale
                  </label>
                </div>

                {vanSale && (
                  <>
                    <div className="w-full lg:w-6/12 px-4 mt-10">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="grid-password"
                        >
                          Configuration Godown
                        </label>
                        <select
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setGodownConfigOption(e.target.value); // Save the id
                            setVanSaleGodownName(e.target.options[e.target.selectedIndex].text); // Save the godown name
                         }}
                          value={godownConfigOption}
                        >
                          {godowns?.length > 0 ? (
                            godowns?.map((el, index) => (
                              <option key={index} value={el.id}>
                                {el.godown[0]}
                              </option>
                            ))
                          ) : (
                            <option value="">No godowns </option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-wrap  mt-8">
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            prefixDetails
                          </label>
                          <input
                            type="text"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            onChange={(e) => setGodownPrefix(e.target.value)}
                            value={godownPrefix}
                            placeholder="prefixDetails"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            suffixDetails
                          </label>
                          <input
                            type="text"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            onChange={(e) => setGodownSuffix(e.target.value)}
                            value={godownSuffix}
                            placeholder="suffixDetails"
                          />
                        </div>
                      </div>
                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="grid-password"
                          >
                            Starting Number
                          </label>
                          <input
                            type="number"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            onChange={(e) =>
                              setGodownStartingNumber(e.target.value)
                            }
                            value={godownStartingNumber}
                            placeholder="Starting Number"
                          />
                        </div>
                      </div>

                      <div className="w-full lg:w-6/12 px-4">
                        <div className="relative w-full mb-3">
                          <label
                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                            htmlFor="widthOfNumericalPart"
                          >
                            Width of Numerical Part
                          </label>
                          <input
                            onChange={(e) => setGodownWidth(e.target.value)}
                            value={godownWidth}
                            type="number"
                            id="widthOfNumericalPart"
                            className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                            placeholder="Width of Numerical Part"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </form>
            <button
              className="bg-pink-500 mt-10 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
              type="button"
              onClick={submitHandler}
            >
              Update
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ConfigureSecondaryUser;
