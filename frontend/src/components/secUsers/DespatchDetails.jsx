/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useState, useCallback, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import _ from "lodash";
import { addDespatchDetails as addInSales } from "../../../slices/salesSecondary";
import { addDespatchDetails as addInOrder } from "../../../slices/invoiceSecondary";
import { addDespatchDetails as addInPurchase } from "../../../slices/purchase";
import { addDespatchDetails as addInCreditNote } from "../../../slices/creditNote";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";

function DespatchDetails({ tab }) {
  const despatchDetails = useSelector((state) =>
    tab === "sale"
      ? state.salesSecondary.despatchDetails
      : tab === "purchase"
      ? state.purchase.despatchDetails
      : tab === "creditNote"
      ? state.creditNote.despatchDetails
      : state.invoiceSecondary.despatchDetails
  );

  const [formValues, setFormValues] = useState({});
  const [displayTitles, setDisplayTitles] = useState({});
  const cmp_id = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
  );

  useEffect(() => {
    const getSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${cmp_id}`,
          {
            withCredentials: true,
          }
        );
        const company = res?.data?.organizationData;

        if (company && company.configurations.length > 0) {
          const { despatchDetails } = company.configurations[0];
          const titles = {};
          for (const key in despatchDetails) {
            titles[key] =
              despatchDetails[key] ||
              capitalizeFirstLetter(key.split(/(?=[A-Z])/).join(" "));
          }

          setDisplayTitles(titles);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getSingleOrganization();
  }, [cmp_id]);

  useEffect(() => {
    if (despatchDetails) {
      setFormValues(despatchDetails);
    }
  }, [despatchDetails]);

  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const debouncedDispatch = useCallback(
    _.debounce((newFormValues) => {
      let selectedDispatch;
      switch (tab) {
        case "sale":
          selectedDispatch = addInSales;
          break;

        case "order":
          selectedDispatch = addInOrder;
          break;

        case "purchase":
          selectedDispatch = addInPurchase;
          break;
        case "creditNote":
          selectedDispatch = addInCreditNote;
          break;

        default:
          break;
      }
      dispatch(selectedDispatch(newFormValues));
      return;
    }, 500),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormValues = {
      ...formValues,
      [name]: value,
    };

    if (validateFormValues(newFormValues)) {
      setFormValues(newFormValues);
      debouncedDispatch(newFormValues);
    } else {
      return;
    }
  };

  const validateFormValues = (values) => {
    let newErrors = {};
    for (let key in values) {
      const valueLength = values[key].length;
      if (["termsOfPay", "termsOfDelivery"].includes(key)) {
        if (valueLength > 60) {
          newErrors[key] = "Maximum length is 60 characters.";
        }
      } else {
        if (valueLength > 30) {
          newErrors[key] = "Maximum length is 30 characters.";
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const { title, ...rest } = formValues;

  return (
    <div>
      {/* <div
        onClick={() => setOpen(!open)}
        className="bg-white mt-2 flex gap-2 items-center p-4 cursor-pointer"
      >
        <p className="text-sm font-bold">Despatch Details</p>
        {open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
      </div> */}
      <div className="p-4 bg-white mt-3 shadow-lg">
        <div className="flex items-center mb-2 gap-2 ">
          <p className="font-bold uppercase text-xs">Details</p>
          <span className="text-red-500 font-bold"> *</span>
        </div>

        <div className=" py-6 border  bg-white h-10 rounded-md flex  cursor-pointer justify-center   items-center font-medium text-violet-500 ">
          <div
            onClick={() => setOpen(!open)}
            className="flex justify-center gap-2   hover_scale items-center  "
          >
            <IoMdAdd className="text-2xl" />
            <p className="text-md font-semibold">Despatch Details</p>
          </div>
        </div>
      </div>

      {open && (
        <div className="py-3 px-3">
          <div className="bg-white pt-10 pb-6 px-4 md:px-7 mx-auto">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 text-xs">
                {Object.keys(rest).map((key) => (
                  <div
                    key={key}
                    className={`flex flex-col mb-5 ${
                      ["termsOfPay", "termsOfDelivery"].includes(key)
                        ? "md:col-span-2"
                        : ""
                    }`}
                  >
                    <label
                      htmlFor={key}
                      className="mb-2 font-bold text-gray-600 "
                    >
                      {key === "irnNo"
                        ? "IRN No"
                        : displayTitles[key] ||
                          capitalizeFirstLetter(
                            key.split(/(?=[A-Z])/).join(" ")
                          )}{" "}
                    </label>
                    <input
                      type="text"
                      id={key}
                      name={key}
                      placeholder={
                        key === "irnNo"
                          ? "IRN No"
                          : displayTitles[key] ||
                            capitalizeFirstLetter(
                              key.split(/(?=[A-Z])/).join(" ")
                            )
                      }
                      value={formValues[key]}
                      onChange={handleInputChange}
                      className="input-field py-2 border-b-2 border-x-0 border-t-0 border-gray-400 outline-none shadow-none text-gray-600 placeholder-gray-400"
                      style={{ boxShadow: "none", borderColor: "#b6b6b6" }}
                    />
                    {errors[key] && (
                      <p className="text-red-500 text-xs mt-1">{errors[key]}</p>
                    )}
                  </div>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DespatchDetails;
