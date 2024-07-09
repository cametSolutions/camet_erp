import { useEffect, useState } from "react";
import Sidebar from "../../components/homePage/Sidebar.jsx";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";

const EditBank = () => {
  const [acholderName, setAcholderName] = useState("");
  const [acNo, setAcNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);

  console.log("A/C Holder Name:", acholderName);
  console.log("A/C Number:", acNo);
  console.log("IFSC Code:", ifsc);
  console.log("Bank Name:", bankName);
  console.log("Branch:", branch);
  console.log("UPI ID:", upiId);
  console.log("Show Sidebar:", showSidebar);

  const navigate = useNavigate();
  const { id } = useParams();

  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  console.log(cmp_id);

  useEffect(() => {
    const fetchSingleBank = async () => {
      try {
        const res = await api.get(`/api/pUsers/getBankDetails/${id}`, {
          withCredentials: true,
        });

        // Destructure all properties from res.data.data
        const { acholder_name, ac_no, ifsc, bank_name, branch, upi_id } =
          res.data.data;

        setAcholderName(acholder_name);
        setAcNo(ac_no);
        setIfsc(ifsc);
        setBankName(bank_name);
        setBranch(branch);
        setUpiId(upi_id);

        console.log(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleBank();
  }, []);

  const submitHandler = async () => {
    if (!acNo.trim() || !ifsc.trim() || !bankName.trim()) {
      toast.error("Bank Name,Acc No,IFSC Must be filled");
      return;
    }

    const isAccountNumberValid = /^\d{11}$/.test(acNo);
    if (!isAccountNumberValid) {
      toast.error("Please enter a valid 11-digit account number");
      return;
    }

    const isIfscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
    if (!isIfscValid) {
      toast.error("Please enter a valid IFSC code");
      return;
    }

    const bankData = {
      acholder_name: acholderName,
      ac_no: acNo,
      ifsc,
      bank_name: bankName,
      branch,
      upi_id: upiId,
      cmp_id,
    };

    console.log(bankData);

    try {
      const res = await api.post(`/api/pUsers/editBank/${id}`, bankData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
      setAcholderName("");
      setAcNo("");
      setIfsc("");
      setBankName("");
      setBranch("");
      setUpiId("");
      navigate("/pUsers/bankList");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar(!showSidebar);
    }
  };

  return (
    <div className="flex ">
   
      <div className=" ">
        <section className=" bg-blueGray-50  ">
          <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
            <div className="flex items-center gap-2">
              <IoIosArrowRoundBack
                onClick={() => {
                  navigate("/pUsers/bankList");
                }}
                className="text-3xl text-white cursor-pointer"
              />
              <p className="text-white text-lg   font-bold ">Edit Bank</p>
            </div>
          </div>

          <div className="w-full lg:w-8/12 px-4 mx-auto pb-[30px] mt-5 ">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
              <div className="rounded-t bg-white mb-0 px-4 py-2">
                <div className="text-center flex justify-between">
                  <h6 className="text-blueGray-700 text-xl font-bold">
                    Bank Information
                  </h6>
                </div>
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form encType="multipart/form-data">
                  <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                    Bank Details
                  </h6>
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="bankName"
                        >
                          Bank Name
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setBankName(e.target.value);
                          }}
                          value={bankName}
                          placeholder="Bank Name"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="acholderName"
                        >
                          A/C Holder Name
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setAcholderName(e.target.value);
                          }}
                          value={acholderName}
                          placeholder="A/C Holder Name"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="acNo"
                        >
                          A/C Number
                        </label>
                        <input
                          type="number"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setAcNo(e.target.value);
                          }}
                          value={acNo}
                          placeholder="A/C Number"
                        />
                      </div>
                    </div>

                    <div className="w-full lg:w-12/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="branch"
                        >
                          Branch
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setBranch(e.target.value);
                          }}
                          value={branch}
                          placeholder="Branch"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="ifsc"
                        >
                          IFSC Code
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setIfsc(e.target.value);
                          }}
                          value={ifsc}
                          placeholder="IFSC Code"
                        />
                      </div>
                    </div>

                    <div className="w-full lg:w-6/12 px-4">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                          htmlFor="upiId"
                        >
                          UPI ID
                        </label>
                        <input
                          type="text"
                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                          onChange={(e) => {
                            setUpiId(e.target.value);
                          }}
                          value={upiId}
                          placeholder="UPI ID"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Add more sections for other details as needed */}
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
        </section>
      </div>
    </div>
  );
};

export default EditBank;
