import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { toast } from "react-toastify";
import api from "../../api/api";

const INITIAL_CONFIG = {
  prefixDetails: "",
  suffixDetails: "",
  widthOfNumericalPart: "",
  currentNumber: "",
};

const CONFIGURATIONS = [
  "sales",
  "salesOrder",
  "receipt",
  "purchase",
  "vanSale",
  "stockTransfer",
  "creditNote",
  "debitNote",
  "payment",
  // "haioio"
];

function ConfigureSecondaryUser() {
  const [godowns, setGodowns] = useState([]);
  const [priceLevels, setPriceLevels] = useState([]);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState([]);
  const [selectedGodowns, setSelectedGodowns] = useState([]);
  const [selectedVanSaleGodowns, setSelectedVanSaleGodowns] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState("sales");
  const [vanSale, setVanSale] = useState(false);
  const [configs, setConfigs] = useState(
    Object.fromEntries(CONFIGURATIONS.map(config => [config, INITIAL_CONFIG]))
  );

  const { id, userId, cmp_name } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [godownsAndPriceLevels, configurationNumbers, userDetails] = await Promise.all([
          api.get(`/api/pUsers/fetchGodownsAndPriceLevels/${id}`, { withCredentials: true }),
          api.get(`/api/pUsers/fetchConfigurationCurrentNumber/${id}/${userId}`, { withCredentials: true }),
          api.get(`/api/pUsers/getSecUserDetails/${userId}`, { withCredentials: true })
        ]);

        setGodowns(godownsAndPriceLevels.data.data.godowns);
        setPriceLevels(godownsAndPriceLevels.data.data.priceLevels);

        const numbers = configurationNumbers.data;
        // console.log(numbers);
        
        setConfigs(prev => 
          Object.fromEntries(
            Object.entries(prev).map(([key, value]) => [
              key,
              { ...value, currentNumber: numbers[`${key}Number`] || "" }
            ])
          )
        );

        const userConfig = userDetails.data.data.configurations.find(item => item.organization === id) || {};
        if (userConfig) {
          setSelectedGodowns(userConfig.selectedGodowns || []);
          setSelectedPriceLevels(userConfig.selectedPriceLevels || []);
          setVanSale(userConfig.vanSale || false);
          setSelectedVanSaleGodowns(userConfig.selectedVanSaleGodowns || []);
          
          CONFIGURATIONS.forEach(config => {
            if (userConfig[`${config}Configuration`]) {
              setConfigs(prev => ({
                ...prev,
                [config]: userConfig[`${config}Configuration`]
              }));
            }
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Error fetching data");
      }
    };

    console.log(configs);
    

    fetchData();
  }, [id, userId]);

  const handleConfigSelection = (e) => setSelectedConfig(e.target.value);

  const updateConfig = (field, value) => {
    setConfigs(prev => ({
      ...prev,
      [selectedConfig]: { ...prev[selectedConfig], [field]: value }
    }));
  };

  const handleCheckboxChange = (type, value, checked) => {
    const updateFunction = {
      priceLevel: setSelectedPriceLevels,
      godown: setSelectedGodowns,
      vanSaleGodown: setSelectedVanSaleGodowns,
    }[type];

    if (updateFunction) {
      updateFunction(prev => 
        checked 
          ? (type === 'vanSaleGodown' ? [value] : [...prev, value])
          : prev.filter(item => item !== value)
      );
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

    if (configName === 'VanSale' && errors.length === 0) {

      console.log("jhdfasjkh");
      
      if (mandatoryFields.every(field => config[field]) &&
          optionalFields.every(field => config[field])) {
        
        if (selectedVanSaleGodowns.length === 0) {
          errors.push('Van Sale: At least one Van Sale Godown must be selected');
        }
      }
    }
  
    return errors;
  };
  

  const submitHandler = async () => {
    let formData = {
      selectedGodowns,
      selectedPriceLevels,
      vanSale,
      selectedVanSaleGodowns,
      ...Object.fromEntries(
        CONFIGURATIONS.map(config => [`${config}Configuration`, configs[config]])
      )
    };



    

    let allErrors = CONFIGURATIONS.flatMap(config => 

      // console.log(configs[config]);

      validateConfiguration(configs[config], config.charAt(0).toUpperCase() + config.slice(1))
    );

    if (allErrors.length > 0) {
      toast.error(allErrors[0]);
      return;
    }

    // try {
    //   const res = await api.post(
    //     `/api/pUsers/addSecondaryConfigurations/${id}/${userId}`,
    //     formData,
    //     {
    //       headers: { "Content-Type": "application/json" },
    //       withCredentials: true,
    //     }
    //   );
    //   toast.success(res.data.message);
    //   navigate(`/pUsers/editUser/${userId}`);
    // } catch (error) {
    //   toast.error(error.response?.data?.message || "An error occurred");
    //   console.error(error);
    // }
  };


  

  return (
    <div className="flex-1">
      <div className="bg-[#201450] text-white mb-2 p-3 flex items-center gap-3 sticky top-0 z-20 text-lg">
        <Link to={`/pUsers/editUser/${userId}`}>
          <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer" />
        </Link>
        <p>Configure Users</p>
      </div>
      <section className="h-screen px-3 md:px-7">
        <div className="flex-auto lg:px-10 py-10 pt-0 shadow-lg">
          <form>
            <div className="flex flex-col md:flex-row md:items-center my-10">
              <div className="w-auto px-4">
                <button
                  type="button"
                  className="text-sm font-semibold bg-violet-500 p-0.5 text-white rounded-sm px-3"
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
                    {CONFIGURATIONS.map(config => (
                      <option key={config} value={config}>
                        {config.charAt(0).toUpperCase() + config.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <h6 className="text-blueGray-400 text-sm mb-6 font-bold uppercase px-4 mt-5">
              {selectedConfig.charAt(0).toUpperCase() + selectedConfig.slice(1)} Configuration
            </h6>
            <div className="flex flex-wrap">
              {["prefixDetails", "suffixDetails", "widthOfNumericalPart", "currentNumber"].map((field) => (
                <div key={field} className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                      htmlFor={field}
                    >
                      {field}
                    </label>
                    <input
                      type={field === "widthOfNumericalPart" || field === "currentNumber" ? "number" : "text"}
                      id={field}
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      onChange={(e) => updateConfig(field, e.target.value)}
                      value={configs[selectedConfig][field]}
                      placeholder={field}
                    />
                  </div>
                </div>
              ))}
            </div>

            {selectedConfig !== "receipt" && selectedConfig !== "stockTransfer" && (
              <section className="px-4">
                <hr className="mt-5 border-b-1 border-blueGray-300" />
                <h6 className="text-blueGray-400 text-sm mb-6 font-bold uppercase mt-10">
                  Price Levels and Locations
                </h6>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
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
                              checked={selectedPriceLevels.includes(item?.priceLevel)}
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
                  <div className="lg:col-span-1">
                    <h6 className="text-blueGray-400 text-sm mb-4 font-bold uppercase">
                      {selectedConfig === "vanSale" ? "Van sale Locations" : "Locations"}
                    </h6>
                    <div className="space-y-2">
                      {godowns?.length > 0 ? (
                        godowns?.map((item, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`godownCheckbox${index}`}
                              value={item?.id}
                              checked={
                                selectedConfig === "vanSale"
                                  ? selectedVanSaleGodowns.includes(item?.id)
                                  : selectedGodowns.includes(item?.id)
                              }
                              onChange={(e) =>
                                handleCheckboxChange(
                                  selectedConfig === "vanSale" ? "vanSaleGodown" : "godown",
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