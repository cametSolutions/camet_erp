/* eslint-disable no-case-declarations */
import { useEffect, useState } from "react";

import api from "../../api/api";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useParams, useNavigate } from "react-router-dom";

function ConfigureSecondaryUser() {
  const [godowns, setGodowns] = useState([]);
  const [priceLevels, setPriceLevels] = useState([]);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState([]);
  const [selectedGodowns, setSelectedGodowns] = useState([]);
  const [selectedVanSaleGodowns, setSelectedVanSaleGodowns] = useState([]);
  const [vanSaleGodownName, setVanSaleGodownName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("sales");
  const [vanSale, setVanSale] = useState(false);
  // const [shouldCheckAllFields, setShouldCheckAllFields] = useState(false);

  // const isFirstRender = useRef(true);

  const initialConfig = [{
    prefixDetails: "",
    suffixDetails: "",
    widthOfNumericalPart: "",
    currentNumber: "",
  }];

  const [sales, setSales] = useState(initialConfig);
  const [salesOrder, setSalesOrder] = useState(initialConfig);
  const [receipt, setReceipt] = useState(initialConfig);
  const [purchase, setPurchase] = useState(initialConfig);
  const [vanSaleConfig, setVanSaleConfig] = useState(initialConfig);
  const [stockTransfer, setStockTransfer] = useState(initialConfig);



  const { id, userId, cmp_name } = useParams();
  // const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  const navigate = useNavigate();

  //////////////////////////////// fetchGodownsAndPriceLevels ////////////////////////////////////

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
        setVanSaleGodownName(res.data.data.godowns[0]?.godown);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    const fetchConfigurationNumber = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/fetchConfigurationCurrentNumber/${id}/${userId}`,

          {
            withCredentials: true,
          }
        );

        console.log(res.data);
        const {
          orderNumber,
          salesNumber,
          purchaseNumber,
          receiptNumber,
          vanSalesNumber,
          stockTransferNumber,
        } = res.data;

        console.log(orderNumber, salesNumber, purchaseNumber, receiptNumber,stockTransferNumber);

        if (salesNumber) {
          setSales((prevSales) => {
            // Create a copy of the first object and update its properties
            const updatedSales = {
              ...prevSales[0],
              currentNumber: salesNumber,
            };
            return [updatedSales];
          });
        }
        if (orderNumber) {
          setSalesOrder((prevSaleOrder) => {
            // Create a copy of the first object and update its properties
            const updatedSaleOrder = {
              ...prevSaleOrder[0],
              currentNumber: orderNumber,
            };
            return [updatedSaleOrder];
          });
        }
        if (purchaseNumber) {
          setPurchase((prevPurchase) => {
            // Create a copy of the first object and update its properties
            const updatedPurchase = {
              ...prevPurchase[0],
              currentNumber: purchaseNumber,
            };
            return [updatedPurchase];
          });
        }
        if (receiptNumber) {
          setReceipt((prevReceipt) => {
            // Create a copy of the first object and update its properties
            const updatedReceipt = {
              ...prevReceipt[0],
              currentNumber: receiptNumber,
            };
            return [updatedReceipt];
          });
        }
        if (vanSalesNumber) {
          setVanSaleConfig((prevVanSaleConfig) => {
            // Create a copy of the first object and update its properties
            const updatedVanSaleConfig = {
              ...prevVanSaleConfig[0],
              currentNumber: vanSalesNumber,
            };
            return [updatedVanSaleConfig];
          });
        }
        if (stockTransferNumber) {
          setStockTransfer((prevStockTransfer) => {
            // Create a copy of the first object and update its properties
            const updatedStockTransfer = {
              ...prevStockTransfer[0],
              currentNumber: stockTransferNumber,
            };
            return [updatedStockTransfer];
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchConfigurationNumber();

    fetchGodowns();
  }, []);



  //////////////////////////////// getSecUserDetails ////////////////////////////////////

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
            purchaseConfiguration,
            selectedVanSaleGodowns,
            stockTransferConfiguration,
            vanSale,
          } = configurations[0];

        



          if (selectedGodowns) {
            setSelectedGodowns(selectedGodowns);
          }

          if (selectedPriceLevels) {
            setSelectedPriceLevels(selectedPriceLevels);
          }
          if (salesOrderConfiguration) {
            setSalesOrder([salesOrderConfiguration]);
          }
          if (salesConfiguration) {
            setSales([salesConfiguration]);
          }
          if (receiptConfiguration) {
            setReceipt([receiptConfiguration]);
          }
          setVanSale(vanSale);

          if (purchaseConfiguration) {
            setPurchase([purchaseConfiguration]);
          }
          if (vanSaleConfiguration) {
            setVanSaleConfig([vanSaleConfiguration]);
          }
          if (selectedVanSaleGodowns?.length > 0) {
            setSelectedVanSaleGodowns([selectedVanSaleGodowns[0]]);
          }
          if(stockTransferConfiguration){
            setStockTransfer([stockTransferConfiguration]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleUser();
  }, []);

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
      case "purchase":
        setPurchase([{ ...purchase[0], [field]: value }]);
        break;
      case "vanSale":
        setVanSaleConfig([{ ...vanSaleConfig[0], [field]: value }]);

        break;
      case "stockTransfer":
        setStockTransfer([{ ...stockTransfer[0], [field]: value }]);

        break;
      default:
        console.error("Invalid section");
    }

    console.log(section);
  };

  const   getConfigValue = (section, field) => {
    switch (section) {
      case "sales":
        return sales[0][field];
      case "salesOrder":
        return salesOrder[0][field];
      case "receipt":
        return receipt[0][field];
      case "purchase":
        return purchase[0][field];
      case "vanSale":
        return vanSaleConfig[0][field];
      case "stockTransfer":
        return stockTransfer[0][field];
      default:
        return "";
    }
  };

  const handleCheckboxChange = (type, value, checked) => {
    console.log(type, value, checked);
    if (type === "priceLevel") {
      if (checked) {
        setSelectedPriceLevels([...selectedPriceLevels, value]);
      } else {
        setSelectedPriceLevels(
          selectedPriceLevels.filter((item) => item !== value)
        );
      }
    } else if (type === "godown") {
      console.log("haii");
      
      if (checked) {
       
          setSelectedGodowns([...selectedGodowns, value]);
        
      } else {
        setSelectedGodowns(selectedGodowns.filter((item) => item !== value));
      }
    } else if (type === "vanSaleGodown") {
      if (checked) {
        setSelectedVanSaleGodowns([value]);
      } else {
        setSelectedVanSaleGodowns(
          selectedVanSaleGodowns.filter((item) => item !== value)
        );
      }
    }
  };


  const formatFieldName = (fieldName) => {
    // Split the camelCase field name into words
    const words = fieldName.split(/(?=[A-Z])/);
    // Capitalize the first word and join all words with spaces
    return words.map((word, index) => 
      index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word.toLowerCase()
    ).join(' ');
  };
  


  const validateConfiguration = (config, configName) => {
    const mandatoryFields = ['currentNumber'];
    const optionalFields = ['prefixDetails', 'suffixDetails', 'widthOfNumericalPart'];
    const allFields = [...mandatoryFields, ...optionalFields];
    
    let errors = [];
    let hasOptionalFields = false;
  
    // Check mandatory fields
    for (let field of mandatoryFields) {
      if (!config[field]) {
        errors.push(`${configName}: ${formatFieldName(field)} is required`);
      }
    }
  
    // Check if any optional field is filled
    for (let field of optionalFields) {
      if (config[field]) {
        hasOptionalFields = true;
        break;
      }
    }
  
    // If any optional field is filled, all should be filled
    if (hasOptionalFields) {
      for (let field of optionalFields) {
        if (!config[field]) {
          errors.push(`${configName}: ${formatFieldName(field)} is required when any optional field is filled`);
        }
      }
    }
  
  // Check for alphanumeric values and forward slash (not at the beginning)
  const alphanumericWithSlashRegex = /^[a-zA-Z0-9][a-zA-Z0-9/]*$/;
  for (let field of allFields) {
    if (config[field] && !alphanumericWithSlashRegex.test(config[field])) {
      errors.push(`${configName}: ${formatFieldName(field)} must start with and can only contain alphanumeric characters and forward slashes`);
    }
  }

    // Check widthOfNumericalPart
    if (config.widthOfNumericalPart && Number(config.widthOfNumericalPart) > 6) {
      errors.push(`${configName}: Width of numerical part must be less than or equal to 6`);
    }
  
    return errors;
  };
  

  const submitHandler = async () => {

    let formData = {};

    formData = {
      selectedGodowns,
      selectedPriceLevels,
      salesConfiguration: sales[0],
      salesOrderConfiguration: salesOrder[0],
      receiptConfiguration: receipt[0],
      purchaseConfiguration: purchase[0],
      stockTransferConfiguration: stockTransfer[0],
      selectedVanSaleGodowns,
      vanSaleConfiguration: {
        ...vanSaleConfig[0],
        vanSaleGodownName:
          godowns?.filter((el) => el?.id == selectedVanSaleGodowns[0])[0]
            ?.godown || "",
      },
      vanSale: vanSale,
    };

    console.log(formData);

    // const salesValidation = validateObject(formData.salesConfiguration, [
    //   "startingNumber",
    //   "currentNumber",
    // ]);

    // if (salesValidation === false) {
    //   toast.error("Fill all sales details or leave all fields empty");
    //   return;
    // }
    // const stockTransferValidation = validateObject(formData.salesConfiguration, [
    //   "startingNumber",
    //   "currentNumber",
    // ]);

    

    // if (stockTransferValidation === false) {
    //   toast.error("Fill all Stock Transfer details or leave all fields empty");
    //   return;
    // }
    // const salesOrderValidation = validateObject(
    //   formData.salesOrderConfiguration,
    //   ["startingNumber",
    //      "currentNumber"
    //     ]
    // );

    // if (salesOrderValidation === false) {
    //   toast.error("Fill all sales order details or leave all fields empty");
    //   return;
    // }

    // const receiptValidation = validateObject(formData.receiptConfiguration, [
    //   "startingNumber",
    //   "currentNumber",
    // ]);

    // if (receiptValidation === false) {
    //   toast.error("Fill all receipt details or leave all fields empty");
    //   return;
    // }
    // const purchaseValidation = validateObject(formData.purchaseConfiguration, [
    //   "startingNumber",
    //   "currentNumber",
    // ]);
    // if (purchaseValidation === false) {
    //   toast.error("Fill all purchase details or leave all fields empty");
    //   return;
    // }

    // const vanSaleConfiguration = formData.vanSaleConfiguration;
    // console.log(vanSaleConfiguration);

    // //   console.log(vanSaleConfiguration);

    // let vanSaleValidation = true;
    // const excludedFields = ["startingNumber",
    //   //  "currentNumber"
    //   ];

    // // Check if all properties of the object are empty
    // if (
    //   Object.entries(vanSaleConfiguration).every(
    //     ([key, value]) => excludedFields.includes(key) || value === ""
    //   )
    // ) {
    //   vanSaleValidation = true;
    // } else if (
    //   Object.entries(vanSaleConfiguration).every(
    //     ([key, value]) => excludedFields.includes(key) || value !== ""
    //   )
    // ) {
    //   vanSaleValidation = true;
    // } else {
    //   vanSaleValidation = false; // Correctly assign false for mixed cases
    // }

    // if (vanSaleValidation === false) {
    //   toast.error("Fill all van sales  details or leave all fields empty");
    //   return;
    // }


    
  let allErrors = [];

  // Validate each configuration
  allErrors = allErrors.concat(validateConfiguration(formData.salesConfiguration, 'Sales'));
  allErrors = allErrors.concat(validateConfiguration(formData.salesOrderConfiguration, 'Sales Order'));
  allErrors = allErrors.concat(validateConfiguration(formData.receiptConfiguration, 'Receipt'));
  allErrors = allErrors.concat(validateConfiguration(formData.purchaseConfiguration, 'Purchase'));
  allErrors = allErrors.concat(validateConfiguration(formData.stockTransferConfiguration, 'Stock Transfer'));
  allErrors = allErrors.concat(validateConfiguration(formData.vanSaleConfiguration, 'Van Sale'));

  if (selectedVanSaleGodowns.length === 0) {
    allErrors.push('Van Sale: At least one Van Sale Godown must be selected');
  }

  if (allErrors.length > 0) {
    toast.error(allErrors[0]);  // Show only the first error
    return;
  }
 

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
      navigate(`/pUsers/editUser/${userId}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }

    // Existing API call...
  };

  console.log(selectedConfig);
  return (
    <div className="flex-1   ">
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
                    <option value="purchase">Purchase</option>
                    <option value="vanSale">VanSale</option>
                    <option value="stockTransfer">Stock Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <h6 className="text-blueGray-400 text-sm mb-6 font-bold uppercase px-4 mt-5">
              {selectedConfig.charAt(0).toUpperCase() + selectedConfig.slice(1)}{" "}
              Configuration
            </h6>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className={`  
                       block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                    htmlFor="prefixDetails"
                  >
                    prefixDetails
                  </label>
                  <input
                    type="text"
                    id="prefixDetails"
                    className={`   border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
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
                    className={`   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                    htmlFor="suffixDetails"
                  >
                    suffixDetails
                  </label>
                  <input
                    type="text"
                    id="suffixDetails"
                    className={`    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
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
              {/* <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className={`   block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                    htmlFor="startingNumber"
                  >
                    Starting Number
                  </label>
                  <input
                    disabled
                    type="number"
                    id="startingNumber"
                    className={`   border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                    // onChange={(e) =>
                    //   updateConfig(
                    //     selectedConfig,
                    //     "startingNumber",
                    //     e.target.value
                    //   )
                    // }
                    value={1}
                    placeholder="Starting Number"
                  />
                </div>
              </div> */}
              {/* New input field for the width of the numerical part */}
              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className={`    block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                    htmlFor="widthOfNumericalPart"
                  >
                    Width of Numerical Part
                  </label>
                  <input
                    type="number"
                    id="widthOfNumericalPart"
                    className={`    border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
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

              <div className="w-full lg:w-6/12 px-4">
                <div className="relative w-full mb-3">
                  <label
                    className={`    block uppercase text-blueGray-600 text-xs font-bold mb-2`}
                    htmlFor="widthOfNumericalPart"
                  >
                    Current Number
                  </label>
                  <input
                    type="number"
                    id="currentNumber"
                    className={`     border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150`}
                    onChange={(e) =>
                      updateConfig(
                        selectedConfig,
                        "currentNumber",
                        e.target.value
                      )
                    }
                    value={getConfigValue(selectedConfig, "currentNumber")}
                    placeholder="Current Number"
                  />
                </div>
              </div>
            </div>

            {
              selectedConfig !=="receipt" &&   selectedConfig !=="stockTransfer" &&

              (
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
                        <p className="text-blueGray-600">No Price Levels added</p>
                      )}
                    </div>
                  </div>
                  {/* {type !== "self" && ( */}
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                      {selectedConfig === "vanSale"
                        ? "Van sale Locations"
                        : "Locations"}
                    </h6>
                    <div
                      className={` 
                       
                         space-y-2 `}
                    >
  
                      
                      {selectedConfig === "vanSale" ? (
                        godowns?.length > 0 ? (
                          godowns?.map((item, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`godownCheckbox${index}`}
                                value={item?.id}
                                checked={selectedVanSaleGodowns.includes(
                                  item?.id
                                )}
                                onChange={(e) =>
                                  handleCheckboxChange(
                                    "vanSaleGodown",
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
                        )
                      ) : godowns?.length > 0 ? (
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
                </div>
  
                <hr className="mt-5 border-b-1 border-blueGray-300" />
              </section>
              )
            }

          
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
  );
}

export default ConfigureSecondaryUser;
