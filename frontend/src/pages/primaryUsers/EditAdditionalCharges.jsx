import Sidebar from "../../components/homePage/Sidebar";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";


function EditAdditionalCharges() {

  const [name, setName] = useState("");
  const [hsn, setHsn] = useState("");
  const [taxPercentage, setTaxPercentage] = useState("");

  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  const { id } = useParams();
  console.log(id);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdditionalCharges = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/getSingleOrganization/${cmp_id}`,
          {
            withCredentials: true,
          }
        );

        const additionCharges = res?.data?.organizationData?.additionalCharges;
        const additionChargeForEditIndex = additionCharges.findIndex(
          (item) => item._id == id
        );
        const { name, hsn, taxPercentage } =
          additionCharges[additionChargeForEditIndex];
        setName(name);
        setHsn(hsn);
        setTaxPercentage(taxPercentage);
        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchAdditionalCharges();
  }, [cmp_id]);

  const submitHandler = async () => {
    if (!name.trim()) {
      toast.error("Fill Name and Bank");
      return;
    }
    if (name.length > 30) {
      toast.error("Name be at most 30 characters");
      return;
    }
    if (hsn.length > 15) {
      toast.error("HSN be at most 30 characters");
      return;
    }

    const formData = {
      name,
      hsn,
      taxPercentage,
    };

    try {
      const res = await api.post(
        `/api/pUsers/EditAditionalCharge/${cmp_id}/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(res.data);
      toast.success(res.data.message);
      navigate('/pUsers/additionalChargesList')
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  console.log(name);
  console.log(hsn);
  console.log(taxPercentage);

  return (
   
      <div className="">
        <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoIosArrowRoundBack

          onClick={()=>{navigate('/pUsers/additionalChargesList')}}
             
              className="text-3xl cursor-pointer"
            />
          <p>Edit Addional Charge</p>
        </div>

        {/* form  */}

        <div className="w-full lg:w-8/12 px-4 mx-auto pb-[30px] mt-5 ">
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
                  type="button"
                  onClick={submitHandler}
                >
                  Update
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default EditAdditionalCharges;
