import { useEffect, useState } from "react";
// import Sidebar from "../../components/homePage/Sidebar.jsx";
import api from "../../api/api.js";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import FindUserAndCompany from "../../components/Filters/FindUserAndCompany.jsx";
import { useLocation, useParams } from "react-router-dom";

const AddBank = () => {
  const [acholderName, setAcholderName] = useState("");
  const [acNo, setAcNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [upiId, setUpiId] = useState("");
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);
  const [process, setProcess] = useState("add");

  const location = useLocation();
  const { id } = useParams();

  console.log("userAndCompanyData", userAndCompanyData?.org?._id);
  

  useEffect(() => {
    if (location.pathname.includes("editBank")) {
      setProcess("edit");
    } else {
      setProcess("add");
    }
  }, [location]);

  useEffect(() => {
    if (process === "edit") {
      const fetchSingleBank = async () => {
        try {
          // const res = await api.get(`/api/sUsers/getBankDetails/${id}`, {
          const res = await api.get( `/api/${userAndCompanyData?.pathUrl}/getBankDetails/${userAndCompanyData?.org?._id}/${id}`, {
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
    }
  }, [process]);

  const navigate = useNavigate();

  const submitHandler = async () => {
    if (!acNo || !ifsc.trim() || !bankName.trim()) {
      toast.error("Bank Name,Acc No,IFSC Must be filled");
      return;
    }

    const bankData = {
      acholder_name: acholderName,
      ac_no: acNo,
      ifsc,
      bank_name: bankName,
      branch,
      upi_id: upiId,
      cmp_id: userAndCompanyData.org._id,
    };

    try {
      const method = process === "add" ? "POST" : "PUT";
      const url =
        process === "add"
          ? `/api/${userAndCompanyData?.pathUrl}/addBank/${userAndCompanyData?.org?._id}`
          : `/api/${userAndCompanyData?.pathUrl}/editBank/${userAndCompanyData?.org?._id}/${id}`;

          // console.log("bankData", bankData);
          

      const res = await api[method.toLowerCase()](url, bankData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);
  
      navigate(-1, { replace: true });
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };

  return (
    <div className=" ">
      <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />

      <section className=" bg-blueGray-50 ">
        <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoIosArrowRoundBack
            onClick={() => {
              navigate(-1, { replace: true });
            }}
            className="text-3xl text-white cursor-pointer"
          />
          <p>Add Bank</p>
        </div>

        <div className="w-full lg:w-8/12 px-4 mx-auto pb-[30px] mt-5 ">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-4 py-2"></div>
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
  );
};

export default AddBank;
