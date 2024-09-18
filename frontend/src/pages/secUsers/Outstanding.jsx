/* eslint-disable react/no-unknown-property */
import { FaArrowDown } from "react-icons/fa6";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/api";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { removeSettlementData } from "../../../slices/settlementDataSlice";
import { FaWhatsapp } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import SearchBar from "../../components/common/SearchBar";
import { useNavigate } from "react-router-dom";
import { formatAmount } from "../../../../backend/helpers/helper";



function Outstanding() {
  const [data, setData] = useState([]);


  const [search, setSearch] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currOrg=useSelector((state)=>state.secSelectedOrganization.secSelectedOrg)
  const secUser=JSON.parse(localStorage.getItem('sUserData'))
  console.log(secUser);




  // function formatAmount(amount) {
  //   return amount.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  // }

  const selectedOrgFromRedux = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  console.log(selectedOrgFromRedux);

  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    const fetchOutstanding = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/fetchOutstandingTotal/${selectedOrgFromRedux._id}`,
          {
            withCredentials: true,
          }
        );

        setData(res.data.outstandingData);

        dispatch(removeSettlementData());
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    fetchOutstanding();
  }, [selectedOrgFromRedux]);

  console.log(data);

  const filterOutstanding = (data,secUser) => {
    return data.filter((item) => {
      const searchFilter = item.party_name
        ?.toLowerCase()
        .includes(search.toLowerCase());

        // const userIdFilter = (item.user_id === String(secUser.mobile)) || (item.user_id === 'null');

      return searchFilter
    });
  };

  const finalData = filterOutstanding(data,secUser);
  console.log(finalData);

  return (

     
      <div className="  ">
        <div className="sticky top-0 flex flex-col z-30 bg-white">
          <div className="bg-white"></div>
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2  ">
          <IoIosArrowRoundBack
              onClick={()=>{navigate("/sUsers/dashboard")}}
              className="block md:hidden text-white text-3xl"
            />
            <p className="text-white text-lg   font-bold ">Outstandings</p>
          </div>
          <div className=" mt-0 shadow-lg p-3 md:p-4">
            <form>
              <label
                for="default-search"
                class="mb-2 text-sm font-medium text-gray-900 sr-only"
              >
                Search
              </label>
              <SearchBar className="" onType={searchData} />

            </form>
          </div>
        </div>

        {currOrg ? (

        <div className="grid grid-cols-1 gap-4 mt-6 text-center pb-10  md:px-8   ">
          {finalData.map((el, index) => (
            <Link
              key={index}
              to={`/sUsers/outstandingDetails/${el._id}/${selectedOrgFromRedux._id}/${el.totalBillAmount}`}
            >
              <div
                // onClick={() => {
                //   onTabChange("outStandingDetails", el._id, el.totalBillAmount);
                // }}
                className="  bg-[#f8ffff] rounded-md shadow-xl border border-gray-100  flex flex-col px-4  transition-all duration-150 transform hover:scale-105 ease-in-out "
              >
              <div className="flex justify-between items-center">
                  <div className=" h-full px-2 py-8 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex justify-center items-start relative flex-col ">
                    <p className="font-bold md:font-semibold text-[11.3px] md:text-[15px] text-left ">
                      {el.party_name}
                    </p>
                    <p className="text-gray-400 text-sm ">Customer</p>
                  </div>
                  <div className=" h-full p-2 lg:p-6 w-[150px] md:w-[180px] lg:w-[300px] flex text-right relative flex-col">
                    <div className="flex-col justify-center  ">
                      <p className=" font-semibold text-green-600 ">
                        Total Amount
                      </p>
                      <div className="flex justify-end text-right ">
                        <p className="text-sm font-bold">
                          ₹{formatAmount(el.totalBillAmount)}
                        </p>
                        {/* <p className="text-sm font-bold">₹12,000</p> */}
                        <FaArrowDown className="ml-1 md:mt-[.1rem] text-green-700" />
                      </div>
                    </div>
                  </div>
                </div>
                <hr />
                <hr />
                <hr />
                <div className=" flex justify-end p-2 items-center gap-2 text-green-500">
                  <FaWhatsapp />
                  <p className="text-black">Share Payment Link </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        ): (

          <div className="flex justify-center h-screen items-center ">
            
            <p className="font-semibold text-lg " >Select an organisation first</p>
          </div>

        )}

      </div>
  );
}

export default Outstanding;
