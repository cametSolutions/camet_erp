import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import TitleDiv from "../../../../../components/common/TitleDiv";
import useFetch from "../../../../../customHook/useFetch";
import CustomBarLoader from "../../../../../components/common/CustomBarLoader";
import api from "../../../../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice";

const DespatchForm = () => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formFields, setFormFields] = useState([
    { name: "challanNo", value: "Challan No", title: "Challan No" },
    { name: "containerNo", value: "Container No", title: "Container No" },
    {
      name: "despatchThrough",
      value: "Despatch Through",
      title: "Despatch Through",
    },
    { name: "destination", value: "Destination", title: "Destination" },
    { name: "vehicleNo", value: "Vehicle No", title: "Vehicle No" },
    { name: "orderNo", value: "Order No", title: "Order No" },
    { name: "termsOfPay", value: "Terms Of Pay", title: "Terms Of Pay" },
    {
      name: "termsOfDelivery",
      value: "Terms Of Delivery",
      title: "Terms Of Delivery",
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  let tab;
  const path = location.pathname;

  switch (path) {
    case "/sUsers/invoice/customDespatchTitle":
      tab = "sale";
      break;
    case "/order":
      tab = "/sUsers/order/customDespatchTitle";
      break;
    default:
      tab = "saleOrder";
  }

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data: apiData, loading } = useFetch(
    `/api/sUsers/getDespatchTitles/${cmp_id}?voucher=${tab}`
  );

  useEffect(() => {
    if (apiData) {
      const updatedFields = formFields.map((field) => ({
        ...field,
        // title: field.value,
        value: apiData?.data[field.name] || field.value,
      }));
      setFormFields(updatedFields);
    }
  }, [apiData]);

  const handleInputChange = (name, newValue) => {
    const updatedFields = formFields.map((field) =>
      field.name === name ? { ...field, value: newValue } : field
    );
    setFormFields(updatedFields);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const formData = formFields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {});

    try {
      const res = await api.put(
        `/api/sUsers/updateDespatchTitles/${cmp_id}?voucher=${tab}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      dispatch(updateConfiguration(res.data.data));
      navigate(-1, { replace: true });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      <TitleDiv title="Custom Despatch Title" from="/sUsers/OrderSettings" />

      {(loading || submitLoading) && <CustomBarLoader />}

      <div
        className={`  ${
          loading && "opacity-50 animate-pulse"
        } max-w-4xl mx-auto px-6 py-2 pb-5 shadow-lg`}
      >
        <div className="mt-6 ">
          <h2 className="text-lg font-bold text-gray-700 mb-4">
            Despatch Titles
          </h2>
          <div className="space-y-4 px-4">
            {formFields.map((field) => (
              <div key={field.name} className="flex items-center mt-10">
                <label className="w-36 text-sm font-medium text-gray-700">
                  {field?.title}:
                </label>
                <input
                  type="text"
                  name={field?.name}
                  value={field?.value}
                  onChange={(e) =>
                    handleInputChange(field?.name, e.target.value)
                  }
                  className="px-10 text-gray-600 text-sm no-focus-box flex-1 p-2 border-b border-x-0 border-t-0 border-gray-400 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          className="bg-pink-500 mt-12  w-full text-white active:bg-pink-600 font-bold uppercase text-xs  py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform "
          type="button"
          onClick={submitHandler}
        >
          Update
        </button>
      </div>
    </>
  );
};

export default DespatchForm;
