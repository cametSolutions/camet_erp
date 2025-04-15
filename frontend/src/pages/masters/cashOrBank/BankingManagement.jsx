import { useEffect, useState } from "react";
import api from "../../../api/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocation, useParams } from "react-router-dom";
import TitleDiv from "../../../components/common/TitleDiv.jsx";
import { useSelector } from "react-redux";
import BankingForm from "./BankingForm.jsx";

const BankingManagement = () => {
  const [formData, setFormData] = useState({
    acholder_name: "",
    ac_no: "",
    ifsc: "",
    bank_name: "",
    branch: "",
    upi_id: "",
    bank_opening: 0,
    od_limit: 0 // Only used for OD accounts
  });
  
  const [formType, setFormType] = useState("addBank");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  // Determine form type based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("editBankOD")) {
      setFormType("editBankOD");
    } else if (path.includes("addBankOD")) {
      setFormType("addBankOD");
    } else if (path.includes("editBank")) {
      setFormType("editBank");
    } else {
      setFormType("addBank");
    }
  }, [location]);


  console.log(formType);
  

  // Fetch data if in edit mode
  useEffect(() => {
    if (formType === "editBank" || formType === "editBankOD") {
      setLoading(true);
      const fetchData = async () => {
        try {
          const endpoint = formType === "editBank" 
            ? `/api/sUsers/getBankDetails/${cmp_id}/${id}`
            : `/api/sUsers/getBankODDetails/${cmp_id}/${id}`;
            
          const res = await api.get(endpoint, {
            withCredentials: true,
          });

          const data = res.data.data;
          setFormData({
            acholder_name: data.acholder_name || "",
            ac_no: data.ac_no || "",
            ifsc: data.ifsc || "",
            bank_name: data.bank_name || "",
            branch: data.branch || "",
            upi_id: data.upi_id || "",
            bank_opening: data.bank_opening || 0,
            od_limit: data.od_limit || 0 // Only for OD
          });

          console.log("Fetched data:", data);
        } catch (error) {
          console.log(error);
          toast.error("Failed to fetch bank details");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [formType, cmp_id, id]);

  const submitHandler = async () => {
    setLoading(true);
    
    // Validate form
    if (!formData.ac_no || !formData.ifsc.trim() || !formData.bank_name.trim()) {
      toast.error("Bank Name, Acc No, IFSC Must be filled");
      setLoading(false);
      return;
    }

    // Add company ID to form data
    const submitData = {
      ...formData,
      cmp_id: cmp_id
    };

    try {
      const isEdit = formType === "editBank" || formType === "editBankOD";
      const isOD = formType === "addBankOD" || formType === "editBankOD";
      
      const method = isEdit ? "PUT" : "POST";
      
      let url;
      
      if (isOD) {
        url = isEdit
          ? `/api/sUsers/editBankOD/${cmp_id}/${id}`
          : `/api/sUsers/addBankOD/${cmp_id}`;
      } else {
        url = isEdit
          ? `/api/sUsers/editBank/${cmp_id}/${id}`
          : `/api/sUsers/addBank/${cmp_id}`;
      }

      const res = await api[method.toLowerCase()](url, submitData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      navigate(-1, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Determine the title based on form type
  const getTitle = () => {
    switch (formType) {
      case "editBank": return "Edit Bank";
      case "addBankOD": return "Add Bank Overdraft";
      case "editBankOD": return "Edit Bank Overdraft";
      default: return "Add Bank";
    }
  };

  return (
    <div className="">
      <section className="bg-blueGray-50">
        <TitleDiv title={getTitle()} loading={loading} />

        <div
          className={`${
            loading && "opacity-50 pointer-events-none"
          } w-full lg:w-8/12 px-4 mx-auto pb-[30px] mt-5`}
        >
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-4 py-2"></div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <BankingForm 
                formData={formData} 
                setFormData={setFormData} 
                formType={formType}
                loading={loading}
              />
              
              <button
                className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                type="button"
                onClick={submitHandler}
                disabled={loading}
              >
                {formType.includes("edit") ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BankingManagement;