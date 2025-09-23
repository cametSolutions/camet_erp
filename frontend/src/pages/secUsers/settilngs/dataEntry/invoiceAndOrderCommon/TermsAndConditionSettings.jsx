import { useDispatch, useSelector } from "react-redux";
import TitleDiv from "../../../../../components/common/TitleDiv";
import { useLocation } from "react-router-dom";
import useFetch from "../../../../../customHook/useFetch";
import CustomBarLoader from "../../../../../components/common/CustomBarLoader";
import { useEffect, useState } from "react";
import api from "../../../../../api/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { updateConfiguration } from "../../../../../../slices/secSelectedOrgSlice";

function TermsAndConditionSettings() {
  const [termsInput, setTermsInput] = useState("");
  const [termsList, setTermsList] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const path = location.pathname;
  let tab;
  switch (path) {
    case "/sUsers/invoice/termsAndConditions":
      tab = "sale";
      break;
    case "/order":
      tab = "/sUsers/order/termsAndConditions";
      break;
    default:
      tab = "saleOrder";
  }

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { data: apiData, loading } = useFetch(
    `/api/sUsers/getTermsAndConditions/${cmp_id}?voucher=${tab}`
  );

  useEffect(()=>{
    if(apiData){
      setTermsInput(apiData?.data?.terms.join('\n'));
      setTermsList(apiData?.data?.terms);
    }
  },[apiData])

  const handleTermsChange = (e) => {
    const value = e.target.value;
    setTermsInput(value);

    // Split the input into terms based on the character limit
    const terms = value.match(/.{1,1000}/g) || [];
    setTermsList(terms);
  };

//   submit handler
const submitHandler = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
   const termsAndConditions=termsList

    try {
      const res = await api.put(
        `/api/sUsers/updateTermsAndConditions/${cmp_id}?voucher=${tab}`,
        termsAndConditions,
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
    } finally {
      setSubmitLoading(false);
    }
  };


  return (
    <div>
      <TitleDiv title="Terms And Condition Settings" />
      {(loading || submitLoading) && <CustomBarLoader />}

      <section className="p-6  border shadow-lg">
        <h2 className=" font-bold text-gray-500 mb-4">Terms and Conditions</h2>
        <textarea
          className="border-0  px-3 pb-12 min-h-[200px] placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
          onChange={handleTermsChange}
          value={termsInput}
          placeholder="Enter your terms and conditions"
        />

        <button
          className="bg-pink-500 mt-4 w-full text-white active:bg-pink-600 font-bold uppercase text-xs  py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform "
          type="button"
            onClick={submitHandler}
        >
          Update
        </button>
      </section>
      <section className=" pb-10">
        <h2 className="font-bold text-gray-500 mb-4 bg-white shadow-lg p-4">
          Preview
        </h2>
        <ul className="mt-4 px-6">
          {termsList.length > 0 ? (
            termsList.map((term, index) => (
              <li key={index} className="mb-2 text-xs text-gray-500">
                <span className="font-bold">{index + 1}.</span> {term}
              </li>
            ))
          ) : (
            <li className="mb-2 text-xs text-gray-500">
              <span className="font-bold">1.</span>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

export default TermsAndConditionSettings;
