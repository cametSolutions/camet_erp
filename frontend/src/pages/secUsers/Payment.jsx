import { IoIosArrowRoundBack } from "react-icons/io";
import { FaSave } from "react-icons/fa";
import { MdPayment } from "react-icons/md";
import { useEffect, useState } from "react";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'



function Payment() {
  const [method, setMethod] = useState("");
  const [banks, setBanks] = useState([]);
  console.log(method);
  const [note, setNote] = useState("");

  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  console.log(cmp_id);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get(`/api/sUsers/fetchBanks/${cmp_id}`, {
          withCredentials: true,
        });

        console.log(res.data);
        setBanks(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBank();
  }, []);

  const navigate = useNavigate();

  const [chequeDetails, setChequeDetails] = useState({
    bank: "",
    chequeNumber: "",
    chequeDate: "",
    narration: "",
  });

  const [upi, SetUpi] = useState({
    bank: "",
    note: "",
  });

  const banksInKerala = [
    "Select a bank",
    "State Bank of India",
    "Federal Bank",
    "ICICI Bank",
    "South Indian Bank",
    "Canara Bank",
  ];

  const settlementDetails = useSelector(
    (state) => state.settlementData.settlementData
  );

  const secUserData = JSON.parse(localStorage.getItem("sUserData"));

  const validateChequeDetails = () => {
    if (!chequeDetails.bank) {
      toast.error("Please select a bank for cheque payment.");
      return false;
    }

    if (!/^\d+$/.test(chequeDetails.chequeNumber)) {
      toast.error("Cheque Number must be a valid number.");
      return false;
    }

    if (!chequeDetails.chequeDate) {
      toast.error("Please select a date for the cheque.");
      return false;
    }

    if (chequeDetails.narration.length > 30) {
      toast.error("Narration must not exceed 30 characters.");
      return false;
    }

    return true;
  };


  const validateUpiDetails=()=>{
    if (!upi.bank) {
      toast.error("Please select a bank for cheque payment.");
      return false;
    }

    return true;

  }

  const confirmCollection = async () => {
    if (method == null || method == "") {
      toast.error("Select a payment method");
    }

    if (method === "cheque" && !validateChequeDetails()) {
      return;
    }
    if (method === "upi" && !validateUpiDetails()) {
      return;
    }

    const collectionData = {
      collectionDetails: settlementDetails,
      PaymentMethod: method,
      paymentDetails: method,
      agentName: secUserData.name,
      agentId: secUserData._id,
    };

    if (method === "cheque") {
      collectionData.paymentDetails = chequeDetails;
    } else if (method === "upi") {
      collectionData.paymentDetails = upi;
    } else {
      collectionData.paymentDetails = {
        bank: "cash",
        note,
      };
    }

    try {
      const res = await api.post(
        "/api/sUsers/confirmCollection",
        collectionData, // This should be the data you want to send in the request body
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      Swal.fire({
        title: "Success",
        text: res.data.message,
        icon: "success",
        confirmButtonText: "OK",
      }).then((result) => {
        // Navigate upon clicking "OK"
        if (result.isConfirmed) {
          navigate(`/sUsers/receiptDetails/${res.data.id}`);
        }
      });
      // dispatch(addData(res.data.outstandingData));
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="flex">
      <SidebarSec className="h-screen overflow-y-scroll" />

      <div className="flex-1">
        <div className="bg-[#eaeaea] flex flex-col h-screen  ">
          <div className="bg-[#012a4a] shadow-lg px-4 py-4 pb-3 flex justify-between items-center z-10  ">
            <div className="flex items-center gap-2">
              {/* <IoIosArrowRoundBack className="text-3xl text-white " /> */}
              <p className="text-md text-white font-bold  ">Payment Method</p>
            </div>
            <p className="text-[12px] text-white mt-1 font-bold  ">
              23 JAN 2024
            </p>
          </div>

          <div className="flex justify-center mt-5 overflow-y-scroll mb-5">
            <div className="relative bg-white w-5/6 md:w-3/6  shadow-lg rounded-lg overflow-hidden ">
              <div className=" px-2 uppercase flex justify-center items-center gap-2 py-3 bg-blue-500">
                <MdPayment className="text-xl"></MdPayment>

                <p className="font-bold  text-white  ">Payment Method</p>
              </div>
              <div className="flex justify-evenly mt-5 font-bold">
                {/* Cash */}
                <label className="cursor-pointer">
                  <input
                    onChange={(e) => setMethod(e.target.value)}
                    type="radio"
                    name="paymentMethod"
                    value={"cash"}
                    className="hidden"
                  />
                  <div
                    className={` ${
                      method === "cash" ? "border-green-500 border-2" : ""
                    }  p-2 rounded-lg border border-violet-500  h-[70px] w-[70px] flex items-center`}
                  >
                    <img
                      src="https://media.istockphoto.com/id/945199282/vector/wallet-with-money.jpg?s=612x612&w=0&k=20&c=WXc5vJqFNSizGyOGtPMPCgyEcJ-DJ7G66LmJivouwSg="
                      alt=""
                    />{" "}
                  </div>
                  <p className="text-sm mt-2 text-center bg-slate-100   rounded-md ">
                    Cash
                  </p>
                </label>

                {/* Cheque */}
                <label className="cursor-pointer">
                  <input
                    onChange={(e) => setMethod(e.target.value)}
                    type="radio"
                    name="paymentMethod"
                    value={"cheque"}
                    className="hidden"
                  />
                  <div
                    className={` ${
                      method === "cheque" ? "border-green-500 border-2" : ""
                    }     p-2 rounded-lg border border-violet-500  h-[70px] w-[70px] flex items-center`}
                  >
                    {/* <p>Cheque</p> */}
                    <img
                      className=""
                      src="https://st2.depositphotos.com/4060975/8095/v/450/depositphotos_80959800-stock-illustration-cheque-vector-icon.jpg"
                      alt=""
                    />
                  </div>
                  <p className="text-sm my-1 mt-2 text-center bg-slate-100   rounded-md ">
                    Cheque
                  </p>
                </label>

                {/* UPI */}
                <label className="cursor-pointer">
                  <input
                    onChange={(e) => setMethod(e.target.value)}
                    type="radio"
                    name="paymentMethod"
                    value={"upi"}
                    className="hidden"
                  />
                  <div
                    className={` ${
                      method === "upi" ? "border-green-500 border-2" : ""
                    }   p-2 rounded-lg border border-violet-500  h-[70px] w-[70px] flex items-center`}
                  >
                    {/* <p>UPI</p> */}
                    <img
                      src="https://m.economictimes.com/thumb/msid-74960608,width-1200,height-900,resizemode-4,imgsize-49172/upi-twitter.jpg"
                      alt=""
                    />
                  </div>
                  <p className="text-sm my-1 text-center mt-2  bg-slate-100   rounded-md">
                    Upi
                  </p>
                </label>
              </div>

              <div className="px-4 mt-5">
                {method === "cash" && (
                  <div className="mb-4 mx-4">
                    <label className="block text-sm font-bold mb-2 ">
                      Note:
                    </label>
                    <input
                      onChange={(e) => {
                        setNote(e.target.value);
                      }}
                      value={note}
                      type="text"
                      className="w-full px-5 py-2  focus:border-blue-500 rounded shadow-lg"
                      placeholder="Enter notes..."
                    />
                  </div>
                )}

                {method === "upi" && (
                  <div className="mb-4 mx-4">
                    <div className="mb-2">
                      <label className="block text-sm font-bold mr-2 mb-2">
                        Bank:
                      </label>
                      <select
                        onChange={(e) => {
                          SetUpi({
                            ...upi,
                            bank: e.target.value,
                          });
                        }}
                        value={upi.bank}
                        className="w-full px-3 py-2 border focus:border-blue-500 rounded shadow-lg"
                      >
                        {/* Map through the array of banks and create options */}
                        {banks.map((bank, index) => (
                          <option key={index} value={bank.bank_ledname}>
                            {bank.bank_ledname}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="block text-sm font-bold mb-2 ">
                      Note:
                    </label>
                    <input
                      onChange={(e) => {
                        SetUpi({
                          ...upi,
                          note: e.target.value,
                        });
                      }}
                      value={upi.note}
                      type="text"
                      className="w-full px-5 py-2  focus:border-blue-500 rounded shadow-lg"
                      placeholder="Enter notes..."
                    />
                  </div>
                )}

                {method === "cheque" && (
                  <div className="mb-4 mx-4 md:px-7">
                    {/* Bank Select */}
                    <div className="mb-2">
                      <label className="block text-sm font-bold mr-2 mb-2">
                        Bank:
                      </label>
                      <select
                        onChange={(e) => {
                          setChequeDetails({
                            ...chequeDetails,
                            bank: e.target.value,
                          });
                        }}
                        value={chequeDetails.bank}
                        className="w-full px-3 py-2 border focus:border-blue-500 rounded shadow-lg"
                      >
                        {/* Map through the array of banks and create options */}
                        {banks.map((bank, index) => (
                          <option key={index} value={bank.bank_ledname}>
                            {bank.bank_ledname}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Cheque Number and Cheque Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 ">
                      <div className="mr-2">
                        <label className="block text-sm font-bold ">
                          Cheque Number:
                        </label>
                        <input
                          onChange={(e) => {
                            setChequeDetails({
                              ...chequeDetails,
                              chequeNumber: e.target.value,
                            });
                          }}
                          value={chequeDetails.chequeNumber}
                          type="text"
                          className="w-full px-3 py-2 border focus:border-blue-500 rounded shadow-lg"
                          placeholder="Enter cheque number"
                        />
                      </div>
                      <div className=" ml-2">
                        <label className="block text-sm font-bold">
                          Cheque Date:
                        </label>
                        <input
                          onChange={(e) => {
                            setChequeDetails({
                              ...chequeDetails,
                              chequeDate: e.target.value,
                            });
                          }}
                          type="date"
                          className="w-full px-3 py-2 border focus:border-blue-500 rounded shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Narration Input */}
                    <div className="mb-2">
                      <label className="block text-sm font-bold">
                        Narration:
                      </label>
                      <input
                        type="text"
                        onChange={(e) => {
                          setChequeDetails({
                            ...chequeDetails,
                            narration: e.target.value,
                          });
                        }}
                        value={chequeDetails.narration}
                        className="w-full px-3 py-2 border focus:border-blue-500 rounded shadow-lg"
                        placeholder="Enter narration"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-center mb-5">
                <button
                  onClick={confirmCollection}
                  className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center"
                >
                  <FaSave className="mr-2" />
                  Confirm Collection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
