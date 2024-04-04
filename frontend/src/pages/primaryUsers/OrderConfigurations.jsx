import { useState, useEffect } from "react";
import Sidebar from "../../components/homePage/Sidebar";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {  IoReorderThreeSharp } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { removeAll } from "../../../slices/invoiceSecondary";


function OrderConfigurations() {
  const [bank, setBank] = useState("");
  const [company, setCompany] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [termsInput, setTermsInput] = useState("");
  const [termsList, setTermsList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);


  console.log(termsList);

  const org = useSelector((state) => state.setSelectedOrganization.selectedOrg);
  console.log(org);

  useEffect(() => {
    const getSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/pUsers/getSingleOrganization/${org._id}`,
          {
            withCredentials: true,
          }
        );
        const company = res?.data?.organizationData;
        setCompany(company);
        console.log(res?.data?.organizationData);

        if (company && company.configurations.length > 0) {
          console.log(company.configurations);
          const bank = company.configurations[0].bank;
          const terms = company.configurations[0].terms;
          console.log(bank);
          if (bank) {
            setSelectedBank(bank._id);
          }
          if (terms) {
            const termsInput = terms.join('\n');
            setTermsInput(termsInput);
            setTermsList(terms);
          }
        }

      } catch (error) {
        console.log(error);
      }
    };
    getSingleOrganization();
  }, [org]);

  console.log(company);

  useEffect(() => {}, [company, org]);

  console.log(selectedBank);

  const navigate = useNavigate();
  const dispatch=useDispatch()

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get(`/api/pUsers/fetchBanks/${org._id}`, {
          withCredentials: true,
        });

        console.log(res.data);
        setBank(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBank();
  dispatch(removeAll())

  }, []);

  const handleTermsChange = (e) => {
    const value = e.target.value;
    setTermsInput(value);

    // Split the input into terms based on the character limit
    const terms = value.match(/.{1,200}/g) || [];
    setTermsList(terms);
  };

  console.log(bank);
  console.log(selectedBank);

  const submitHandler = async () => {
    if (!selectedBank) {
      toast.error("Select Bank");
      return;
    }
    if (termsList.length == 0) {
      toast.error("Add terms");
      return;
    }

    const formData = {
      selectedBank,
      termsList,
    };

    try {
      const res = await api.post(
        `/api/pUsers/addconfigurations/${org._id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
        navigate("/pUsers/dashboard");
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
    <div className="flex">
      <div className="">
        <Sidebar TAB={"terms"} showBar={showSidebar}  />
      </div>
      <div className=" flex-1 h-screen overflow-y-scroll">
        <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-3xl cursor-pointer"
          />
          <p className="">Order Configurations</p>
        </div>

        <div className="w-full lg:w-8/12 px-4 mx-auto pb-[30px] md:mt-5 ">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
            <div className="rounded-t bg-white mb-0 px-4 py-2">
              <div className="text-center flex justify-between">
                <h6 className="text-blueGray-700 text-xl font-bold mt-4 px-1">
                  Order Configurations
                </h6>
              </div>
            </div>
            <div className="w-auto px-5 md:px-12 md:ml-2">
              <button
                type="button"
                className="text-xs font-semibold  mt-6  bg-violet-500 p-1.5 text-white rounded-sm px-3"
              >
                {org.name}
              </button>
            </div>
            <div className="flex-auto px-1 lg:px-10 py-10 pt-0 mt-5">
              <form>
                <div className="flex flex-wrap">
                  {/* Bank Selection */}
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="bank"
                      >
                        Bank
                      </label>
                      <select
                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={(e) => setSelectedBank(e.target.value)}
                        value={selectedBank}
                      >
                        <option value="">Select a Bank</option>
                        {bank?.length > 0 ? (
                          bank?.map((el, index) => (
                            <option key={index} value={el?._id}>
                              {el.bank_name}
                            </option>
                          ))
                        ) : (
                          <option>No banks available</option>
                        )}
                      </select>
                    </div>
                  </div>
                  {/* Terms and Conditions */}
                  <div className="w-full lg:w-12/12 px-4">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                        htmlFor="termsInput"
                      >
                        Terms and Condition
                      </label>
                      <textarea
                        className="border-0 px-3 pb-12 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none w-full ease-linear transition-all duration-150"
                        onChange={handleTermsChange}
                        value={termsInput}
                        placeholder="Enter terms and conditions"
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
              {/* Display the list of terms with points */}
              <ul className="mt-4 px-4">
                {termsList.map((term, index) => (
                  <li key={index} className="mb-2 text-xs text-gray-500">
                    <span className="font-bold">{index + 1}.</span> {term}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfigurations;
