import { useEffect, useState } from "react";
import api from "../../../api/api";
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
  const [vanSaleSubGroups, setvanSaleSubGroups] = useState([]);
  const [selectedVanSaleSubGroups, setSelectedVanSaleSubGroups] = useState([]);

  const [vanSaleGodownName, setVanSaleGodownName] = useState("");
  const [selectedConfig, setSelectedConfig] = useState("sales");
  const [vanSale, setVanSale] = useState(false);

  const initialConfig = [
    {
      prefixDetails: "",
      suffixDetails: "",
      widthOfNumericalPart: "",
      currentNumber: "",
    },
  ];

  const [sales, setSales] = useState(initialConfig);
  const [salesOrder, setSalesOrder] = useState(initialConfig);
  const [receipt, setReceipt] = useState(initialConfig);
  const [payment, setPayment] = useState(initialConfig);

  const [purchase, setPurchase] = useState(initialConfig);
  const [vanSaleConfig, setVanSaleConfig] = useState(initialConfig);
  const [stockTransfer, setStockTransfer] = useState(initialConfig);
  const [creditNote, setCreditNote] = useState(initialConfig);
  const [debitNote, setDebitNote] = useState(initialConfig);

  const { id, userId, cmp_name } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/fetchGodownsAndPriceLevels/${id}`,
          {
            withCredentials: true,
          }
        );

        setGodowns(res.data.data.godowns);
        setPriceLevels(res.data.data.priceLevels);
        setVanSaleGodownName(res.data.data.godowns[0]?.godown);
        setvanSaleSubGroups(res.data.data.subGroups);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };

    const fetchConfigurationNumber = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationCurrentNumber/${id}/${userId}`,
          {
            withCredentials: true,
          }
        );

        const {
          salesOrderNumber,
          salesNumber,
          purchaseNumber,
          receiptNumber,
          paymentNumber,
          vanSaleNumber,
          stockTransferNumber,
          creditNoteNumber,
          debitNoteNumber,
        } = res.data;

        const updateConfig = (setter, number) => {
          if (number) {
            setter((prev) => [
              {
                ...prev[0],
                currentNumber: number,
              },
            ]);
          }
        };

        updateConfig(setSales, salesNumber);
        updateConfig(setSalesOrder, salesOrderNumber);
        updateConfig(setPurchase, purchaseNumber);
        updateConfig(setReceipt, receiptNumber);
        updateConfig(setPayment, paymentNumber);
        updateConfig(setVanSaleConfig, vanSaleNumber);
        updateConfig(setStockTransfer, stockTransferNumber);
        updateConfig(setCreditNote, creditNoteNumber);
        updateConfig(setDebitNote, debitNoteNumber);
      } catch (error) {
        console.log(error);
      }
    };

    fetchConfigurationNumber();
    fetchGodowns();
  }, []);

  useEffect(() => {
    const fetchSingleUser = async () => {
      try {
        const res = await api.get(`/api/sUsers/getSecUserDetails/${userId}`, {
          withCredentials: true,
        });
        const fullConfigurations = res?.data?.data?.configurations;
        const configurations =
          new Array(
            fullConfigurations.find((item) => item.organization === id)
          ) || [];

        if (configurations?.length > 0) {
          const {
            selectedGodowns,
            selectedPriceLevels,
            salesOrderConfiguration,
            salesConfiguration,
            receiptConfiguration,
            paymentConfiguration,
            vanSaleConfiguration,
            purchaseConfiguration,
            selectedVanSaleGodowns,
            selectedVanSaleSubGroups,
            stockTransferConfiguration,
            creditNoteConfiguration,
            debitNoteConfiguration,
            vanSale,
          } = configurations[0];

          setSelectedGodowns(selectedGodowns || []);
          setSelectedVanSaleSubGroups(selectedVanSaleSubGroups || []);
          setSelectedPriceLevels(selectedPriceLevels || []);
          setSalesOrder(
            salesOrderConfiguration ? [salesOrderConfiguration] : initialConfig
          );
          setSales(salesConfiguration ? [salesConfiguration] : initialConfig);
          setReceipt(
            receiptConfiguration ? [receiptConfiguration] : initialConfig
          );
          setPayment(
            paymentConfiguration ? [paymentConfiguration] : initialConfig
          );
          setVanSale(vanSale || false);
          setPurchase(
            purchaseConfiguration ? [purchaseConfiguration] : initialConfig
          );
          setVanSaleConfig(
            vanSaleConfiguration ? [vanSaleConfiguration] : initialConfig
          );
          setSelectedVanSaleGodowns(
            selectedVanSaleGodowns?.length > 0
              ? [selectedVanSaleGodowns[0]]
              : []
          );
          setStockTransfer(
            stockTransferConfiguration
              ? [stockTransferConfiguration]
              : initialConfig
          );
          setCreditNote(
            creditNoteConfiguration ? [creditNoteConfiguration] : initialConfig
          );
          setDebitNote(
            debitNoteConfiguration ? [debitNoteConfiguration] : initialConfig
          );
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
    const updateFunction = {
      sales: setSales,
      salesOrder: setSalesOrder,
      receipt: setReceipt,
      payment: setPayment,
      purchase: setPurchase,
      vanSale: setVanSaleConfig,
      stockTransfer: setStockTransfer,
      creditNote: setCreditNote,
      debitNote: setDebitNote,
    }[section];

    if (updateFunction) {
      updateFunction((prev) => [{ ...prev[0], [field]: value }]);
    } else {
      console.error("Invalid section");
    }
  };

  const getConfigValue = (section, field) => {
    const config = {
      sales,
      salesOrder,
      receipt,
      payment,
      purchase,
      vanSale: vanSaleConfig,
      stockTransfer,
      creditNote,
      debitNote,
    }[section];

    return config ? config[0][field] : "";
  };

  const handleCheckboxChange = (type, value, checked) => {
    console.log(type, value, checked);

    const updateFunction = {
      priceLevel: setSelectedPriceLevels,
      godown: setSelectedGodowns,
      vanSaleGodown: setSelectedVanSaleGodowns,
      vanSaleSubGroup: setSelectedVanSaleSubGroups,
    }[type];

    if (updateFunction) {
      updateFunction((prev) =>
        checked
          ? type === "vanSaleGodown"
            ? [value]
            : [...prev, value]
          : prev.filter((item) => item !== value)
      );
    }
  };

  const formatFieldName = (fieldName) => {
    const words = fieldName.split(/(?=[A-Z])/);
    return words
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word.toLowerCase()
      )
      .join(" ");
  };

  const validateConfiguration = (config, configName) => {
    const mandatoryFields = ["currentNumber"];
    const optionalFields = [
      // "prefixDetails",
      // "suffixDetails",
      "widthOfNumericalPart",
    ];
    const allFields = ["currentNumber", "prefixDetails", "suffixDetails", "widthOfNumericalPart"];

    let errors = [];
    let hasOptionalFields = false;

    for (let field of mandatoryFields) {
      if (!config[field]) {
        errors.push(`${configName}: ${formatFieldName(field)} is required`);
      }
    }

    for (let field of optionalFields) {
      if (config[field]) {
        hasOptionalFields = true;
        break;
      }
    }

    if (hasOptionalFields) {
      for (let field of optionalFields) {
        if (!config[field]) {
          errors.push(
            `${configName}: ${formatFieldName(
              field
            )} is required when any optional field is filled`
          );
        }
      }
    }

    const alphanumericWithSlashRegex = /^[a-zA-Z0-9][a-zA-Z0-9/]*$/;
    for (let field of allFields) {
      if (config[field] && !alphanumericWithSlashRegex.test(config[field])) {
        errors.push(
          `${configName}: ${formatFieldName(
            field
          )} must start with and can only contain alphanumeric characters and forward slashes`
        );
      }
    }

    if (
      config.widthOfNumericalPart &&
      Number(config.widthOfNumericalPart) > 6
    ) {
      errors.push(
        `${configName}: Width of numerical part must be less than or equal to 6`
      );
    }

    if (configName === "Van Sale" && errors.length === 0) {
      if (
        mandatoryFields.every((field) => config[field]) &&
        optionalFields.every((field) => config[field])
      ) {
        if (selectedVanSaleGodowns.length === 0) {
          errors.push(
            "Van Sale: At least one Van Sale Godown must be selected"
          );
        }
      }
    }

    return errors;
  };

  const submitHandler = async () => {
    let formData = {
      selectedGodowns,
      selectedPriceLevels,
      salesConfiguration: sales[0],
      salesOrderConfiguration: salesOrder[0],
      receiptConfiguration: receipt[0],
      paymentConfiguration: payment[0],
      purchaseConfiguration: purchase[0],
      stockTransferConfiguration: stockTransfer[0],
      creditNoteConfiguration: creditNote[0],
      debitNoteConfiguration: debitNote[0],
      selectedVanSaleGodowns,
      selectedVanSaleSubGroups,
      vanSaleConfiguration: {
        ...vanSaleConfig[0],
        vanSaleGodownName:
          godowns?.find((el) => el?.id == selectedVanSaleGodowns[0])?.godown ||
          "",
      },
      vanSale: vanSale,
    };

    let allErrors = [];

    const configurations = [
      { config: formData.salesConfiguration, name: "Sales" },
      { config: formData.salesOrderConfiguration, name: "Sales Order" },
      { config: formData.receiptConfiguration, name: "Receipt" },
      { config: formData.paymentConfiguration, name: "Payment" },
      { config: formData.purchaseConfiguration, name: "Purchase" },
      { config: formData.stockTransferConfiguration, name: "Stock Transfer" },
      { config: formData.vanSaleConfiguration, name: "Van Sale" },
      { config: formData.creditNoteConfiguration, name: "Credit Note" },
      { config: formData.debitNoteConfiguration, name: "Debit Note" },
    ];

    configurations.forEach(({ config, name }) => {
      allErrors = allErrors.concat(validateConfiguration(config, name));
    });

    if (allErrors.length > 0) {
      toast.error(allErrors[0]);
      return;
    }

    console.log(formData);

    try {
      const res = await api.post(
        `/api/sUsers/addSecondaryConfigurations/${id}/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      navigate(`/sUsers/editUser/${userId}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  

  return (
    <div className="flex-1   ">
      <div className="  bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 sticky top-0 z-20 text-lg   ">
        <Link to={`/sUsers/editUser/${userId}`}>
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
                    <option value="purchase">Purchase</option>
                    <option value="creditNote">Credit Note</option>
                    <option value="debitNote">Debit Note</option>
                    <option value="payment">Payment</option>
                    <option value="receipt">Receipt</option>
                    <option value="stockTransfer">Stock Transfer</option>
                    <option value="vanSale">VanSale</option>
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

            {selectedConfig !== "receipt" &&
              selectedConfig !== "payment" &&
              selectedConfig !== "stockTransfer" && (
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
                                value={item?.pricelevel}
                                checked={selectedPriceLevels.includes(
                                  item?.pricelevel
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
                                {item?.pricelevel}
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
                                  value={item?._id}
                                  checked={selectedVanSaleGodowns.includes(
                                    item?._id
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
                            <p className="text-blueGray-600">
                              No Godowns added
                            </p>
                          )
                        ) : godowns?.length > 0 ? (
                          godowns?.map((item, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`godownCheckbox${index}`}
                                value={item?._id}
                                checked={selectedGodowns.includes(item?._id)}
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
                    {(selectedConfig === "vanSale" ||
                      selectedConfig === "sales") && (
                      <div className="lg:col-span-1">
                        <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                          Sub Groups
                        </h6>
                        <div
                          className={` 
                       
                         space-y-2 `}
                        >
                          {vanSaleSubGroups?.length > 0 ? (
                            vanSaleSubGroups?.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`godownCheckbox${index}`}
                                  value={item?.subGroup_id}
                                  checked={selectedVanSaleSubGroups.includes(
                                    item?.subGroup_id
                                  )}
                                  onChange={(e) =>
                                    handleCheckboxChange(
                                      "vanSaleSubGroup",
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
                                  {item?.subGroup}
                                </label>
                              </div>
                            ))
                          ) : (
                            <p className="text-blueGray-600">
                              No Sub Groups added
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <hr className="mt-5 border-b-1 border-blueGray-300" />
                </section>
              )}
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
