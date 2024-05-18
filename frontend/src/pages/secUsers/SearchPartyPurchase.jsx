/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { IoArrowDown } from "react-icons/io5";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addParty } from "../../../slices/purchase";
import { useLocation } from "react-router-dom";
import SidebarSec from "../../components/secUsers/SidebarSec";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { HashLoader } from "react-spinners";




// import { MdCancel } from "react-icons/md";

function SearchPartyPurchase() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  console.log(parties);

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get(`/api/sUsers/PartyList/${cpm_id}`, {
          withCredentials: true,
        });

        setParties(res.data.partyList);
        setLoading(false);

      } catch (error) {
        console.log(error);
        setLoading(false);

      }
    };
    fetchParties();
  }, [cpm_id]);

  const selectHandler = (el) => {
    dispatch(addParty(el));
    if (location?.state?.from === "editPurchase") {
      navigate(`/sUsers/editPurchase/${location?.state?.id}`);
    } else {
      navigate("/sUsers/purchase");
    }
  };

  const backHandler=()=>{
    if (location?.state?.from === "editPurchase") {
      navigate(`/sUsers/editPurchase/${location?.state?.id}`);
    } else {
      navigate("/sUsers/purchase");
    }

  }

  console.log(parties);
  useEffect(() => {
    if (search === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((el) =>
        el.partyName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredParties(filtered);
    }
  }, [search, parties]);

  return (
    <div className="flex relative h-screen ">
      <div>
        <SidebarSec  showBar={showSidebar} />
      </div>

      <div className="flex-1 bg-slate-50 overflow-y-scroll ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2  ">
            <IoIosArrowRoundBack
            onClick={backHandler}
              // onClick={() => {
              //   navigate("/sUsers/invoice");
              // }}
              className="text-3xl text-white cursor-pointer"
            />
            <p className="text-white text-lg   font-bold ">Select Party</p>
          </div>

          {/* invoiec date */}
          <div className=" p-4  bg-white drop-shadow-lg">
            <div className="flex justify-between  items-center">
              {/* <div className=" flex flex-col gap-1 justify-center">
              <p className="text-md font-semibold text-violet-400">
                Search Parties
              </p>
            </div>
            <div className="flex items-center hover_scale cursor-pointer">
              <p className="text-pink-500 m-2 cursor-pointer  ">Cancel</p>
              <MdCancel className="text-pink-500" />
            </div> */}
            </div>
            <div className=" md:w-1/2 ">
              {/* search bar */}
              <div className="relative  ">
                <div className="absolute inset-y-0 start-0 flex items-center  pointer-events-none ">
                  <svg
                    className="w-4 h-4 text-gray-500 "
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <div class="relative">
                  <input
                    onChange={(e) => setSearch(e.target.value)}
                    value={search}
                    type="search"
                    id="default-search"
                    class="block w-full p-2  text-sm text-gray-900 border  rounded-lg border-gray-300  bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search party by name..."
                    required
                  />
                  <button
                    type="submit"
                    class="text-white absolute end-[10px] top-1/2 transform -translate-y-1/2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-md px-2 py-1"
                  >
                    <IoIosSearch />
                  </button>
                  <button
                  onClick={()=>{setSearch("")}}
                    type="submit"
                    class={`${search.length>0 ? "block":"hidden"}  absolute end-[40px] top-1/2 transform -translate-y-1/2 text-gray-500  text-md px-2 py-1`}
                  >
                    <IoIosCloseCircleOutline />
                  </button>
                </div>
              </div>

              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loading ? (
          // Show loader while data is being fetched
          <div className=" flex justify-center items-center h-screen">
            <figure className="  w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center ">
              <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
            </figure>
          </div>
        ) : filteredParties?.length > 0 ? (
          // Show party list if parties are available
          filteredParties?.map((el, index) => (
            <div
              onClick={() => {
                selectHandler(el);
              }}
              key={index}
              className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex justify-between mx-2 rounded-sm cursor-pointer hover:bg-slate-100"
            >
              <div className="">
                <p className="font-bold">{el?.partyName}</p>
                <p className="font-medium text-gray-500 text-sm">Customer</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold">₹ 12,000</p>
                <IoArrowDown className="text-green-500" />
              </div>
            </div>
          ))
        ) : (
          // Show message if no parties are available
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Parties !!!
          </div>
        )}

        {/* <Link to={"/sUsers/addParty"} className="flex justify-center">
          <div className="absolute bottom-2 text-white bg-violet-700 rounded-3xl p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer ">
            <IoIosAddCircle className="text-2xl" />
            <p>Create New Party</p>
          </div>
        </Link> */}
      </div>
    </div>
  );
}

export default SearchPartyPurchase;
