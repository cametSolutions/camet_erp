import { useEffect, useState } from "react";
// import Sidebar from "../../components/homePage/Sidebar.jsx";
import api from "../../../api/api.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import FindUserAndCompany from "../../../components/Filters/FindUserAndCompany.jsx";
import { useLocation, useParams } from "react-router-dom";
import TitleDiv from "../../../components/common/TitleDiv.jsx";

const AddCash = () => {
  const [cash_ledname, setCashLedname] = useState("");
  const [cash_opening, setCash_opening] = useState(0);
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);
  const [process, setProcess] = useState("add");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { id } = useParams();

  // console.log("userAndCompanyData", userAndCompanyData?.org?._id);

  useEffect(() => {
    if (location.pathname.includes("editCash")) {
      setProcess("edit");
    } else {
      setProcess("add");
    }
  }, [location]);

  useEffect(() => {
    if (process === "edit") {
      setLoading(true);
      const fetchSingleCash = async () => {
        try {
          // const res = await api.get(`/api/sUsers/getBankDetails/${id}`, {
          const res = await api.get(
            `/api/${userAndCompanyData?.pathUrl}/getCashDetails/${userAndCompanyData?.org?._id}/${id}`,
            {
              withCredentials: true,
            }
          );

          // Destructure all properties from res.data.data
          const { partyName:cash_ledname, openingBalanceAmount:cash_opening } = res.data.data;

          setCashLedname(cash_ledname);
          setCash_opening(cash_opening || 0);

          console.log(res.data.data);
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }
      };
      fetchSingleCash();
    }
  }, [process]);

  const navigate = useNavigate();

  const submitHandler = async () => {
    setLoading(true);
    if (!cash_ledname.trim()) {
      toast.error("Cash Ledger Name Must be filled");
      setLoading(false);
      return;
    }

    const cashData = {
      cash_ledname,
      cash_opening: Number(cash_opening) || 0,
      cmp_id: userAndCompanyData.org._id,
    };

    try {
      const method = process === "add" ? "POST" : "PUT";
      const url =
        process === "add"
          ? `/api/${userAndCompanyData?.pathUrl}/addCash/${userAndCompanyData?.org?._id}`
          : `/api/${userAndCompanyData?.pathUrl}/editCash/${userAndCompanyData?.org?._id}/${id}`;

      // console.log("bankData", bankData);

      const res = await api[method.toLowerCase()](url, cashData, {
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
    }finally{
      setLoading(false);
    }
  };

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };

  return (
    <div className=" ">
      <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />

      <section className=" bg-blueGray-50 ">
        {/* <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
          <IoIosArrowRoundBack
            onClick={() => {
              navigate(-1, { replace: true });
            }}
            className="text-3xl text-white cursor-pointer"
          />
          <p>Add Cash</p>
        </div> */}
        <TitleDiv title="Add Cash " loading={loading} />

        <div
          className={` ${
            loading && "opacity-50 pointer-events-none"
          }  w-full lg:w-8/12 px-4 mx-auto pb-[30px] mt-5`}
        >
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-4 py-2"></div>
            <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
              <form encType="multipart/form-data">
                <h6 className="text-blueGray-400 text-sm mt-3 mb-6 font-bold uppercase">
                  Cash Details
                </h6>
                <div className="flex flex-wrap">
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="bankName"
                      >
                        Cash Name
                      </label>
                      <input
                        type="text"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => {
                          setCashLedname(e.target.value);
                        }}
                        value={cash_ledname}
                        placeholder="Cash Name"
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="acNo"
                      >
                        Cash Opening
                      </label>
                      <input
                        type="number"
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => {
                          setCash_opening(e.target.value);
                        }}
                        value={cash_opening}
                        placeholder="Cash Opening"
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

export default AddCash;
