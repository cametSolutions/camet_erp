import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api/api";
import { toast } from "sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { removeAll } from "../../../../../slices/invoiceSecondary";
import TitleDiv from "@/components/common/TitleDiv";

function AdditionalChargesSecondary() {
  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();

  // Determine if we're in edit mode
  useEffect(() => {
    if (location?.pathname?.includes("editAdditionalCharge")) {
      setIsEditMode(true);
      fetchChargeDetails();
    }
  }, [location, id, cmp_id]);

  // Fetch charge details for edit mode
  const fetchChargeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/sUsers/fetchSingleAdditionalCharge/${id}/${cmp_id}`,
        {
          withCredentials: true,
        }
      );

      if (response.data && response.data.additionalCharge) {
        const { name, hsn, taxPercentage } = response.data.additionalCharge;
        setName(name || "");
        setHsn(hsn || "");
        setTaxPercentage(taxPercentage || "");
      }
    } catch (error) {
      toast.error("Failed to fetch charge details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(removeAll());
  }, []);

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Fill Name field");
      return false;
    }
    if (name.length > 30) {
      toast.error("Name must be at most 30 characters");
      return false;
    }
    if (hsn.length > 15) {
      toast.error("HSN must be at most 15 characters");
      return false;
    }
    return true;
  };

  const submitHandler = async () => {
    if (!validateForm()) return;

    const formData = {
      name,
      hsn,
      taxPercentage,
    };

    try {
      setLoading(true);
      let res;

      if (isEditMode) {
        // Update existing charge
        res = await api.put(
          `/api/sUsers/EditAditionalCharge/${id}/${cmp_id}`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } else {
        // Add new charge
        res = await api.post(
          `/api/sUsers/addAditionalCharge/${cmp_id}`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }

      toast.success(res.data.message);
      navigate("/sUsers/additionalChargesList");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <TitleDiv
        loading={loading}
        title={isEditMode ? "Edit Charges" : "Add Charges"}
        from="/sUsers/additionalChargesList"
      />

      <form className="flex-1 h-screen overflow-y-scroll">
        <div className="w-full lg:w-8/12 px-4 mx-auto pb-8 mt-5">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-4 py-2">
              <div className="text-center flex justify-between">
                <h6 className="text-blueGray-700 text-xl font-bold">
                  Additional Charges Information
                </h6>
              </div>
            </div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0 mt-12">
              <form>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        placeholder="Name"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="hsn"
                      >
                        HSN
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => setHsn(e.target.value)}
                        value={hsn}
                        placeholder="HSN"
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="taxPercentage"
                      >
                        Tax Percentage
                      </label>
                      <input
                        type="number"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => setTaxPercentage(e.target.value)}
                        value={taxPercentage}
                        placeholder="Tax Percentage"
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="bg-pink-500 mt-4 ml-4 w-20 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150 transform hover:scale-105"
                  type="submit"
                  onClick={submitHandler}
                  disabled={loading}
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AdditionalChargesSecondary;
