/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import Sidebar from "../../components/homePage/Sidebar";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { FixedSizeList as List } from "react-window";
import { IoIosAddCircle } from "react-icons/io";
import { removeAll } from "../../../slices/invoice";
import { removeAllSales } from "../../../slices/sales";

import { useDispatch } from "react-redux";
import SearchBar from "../../components/common/SearchBar";
import { useSidebar } from "../../layout/Layout";



function PartyList() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");

  const [showSidebar, setShowSidebar] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [filteredParty, setFilteredParty] = useState([]);

  const cpm_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg.type
  );
  const dispatch=useDispatch()
  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    setLoader(true);

    const fetchParties = async () => {
      try {
        const res = await api.get(`/api/pUsers/PartyList/${cpm_id}`, {
          withCredentials: true,
        });

        setTimeout(() => {
          setParties(res.data.partyList);
        }, 1000);
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchParties();
  dispatch(removeAll())
  dispatch(removeAllSales())

  }, [cpm_id, refresh]);
  useEffect(() => {
    if (search === "") {
      setFilteredParty(parties);
    } else {
      const filtered = parties.filter((el) =>
        el.partyName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredParty(filtered);
    }
  }, [search, parties, refresh]);

  const deleteHandler = async (id) => {
    // Show confirmation dialog
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    // If user confirms deletion
    if (confirmation.isConfirmed) {
      try {
        const res = await api.delete(`/api/pUsers/deleteParty/${id}`, {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        // Display success message
        await Swal.fire({
          title: "Deleted!",
          text: res.data.message,
          icon: "success",
          timer: 2000, // Auto close after 2 seconds
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Refresh the page
        setRefresh(!refresh);
      } catch (error) {
        toast.error(error.response.data.message);
        console.log(error);
      }
    }
  };

  console.log(parties);

  const {  handleToggleSidebar } = useSidebar();


  const Row = ({ index, style }) => {
    const el = filteredParty[index];
    const adjustedStyle = {
      ...style,
      marginTop: '16px',
      height: '150px', 
   
   };
    return (
      <>
        <div
          key={index}
          style={adjustedStyle}
          className="bg-white p-4 pb-6 drop-shadow-lg mt-4 flex flex-col mx-2 rounded-sm cursor-pointer hover:bg-slate-100  pr-7 "
        >
          <div className="flex justify-between w-full gap-3 ">
            <div className="">
              <p className="font-bold text-sm">{el?.partyName}</p>
              {el.accountGroup && (
                <div className="flex">
                  {/* <p className="font-medium mt-2 text-gray-500 text-sm text-nowrap">
                    Acc group :
                  </p> */}
                  <p className="font-medium mt-2 text-gray-500 text-sm">
                    {el?.accountGroup}
                  </p>
                </div>
              )}
            </div>
            <div className={` ${type!=="self" ? "pointer-events-none cursor-default opacity-50" : ""} flex justify-center items-center gap-4`}>
              <Link to={`/pUsers/editParty/${el._id}`}>
                <FaEdit className="text-blue-500" />
              </Link>
              <MdDelete
                onClick={() => {
                  deleteHandler(el._id);
                }}
                className="text-red-500"
              />
              {/* <div className="flex gap-2 ">
                <p className="font-bold">Email :</p>
                <p className="font-bold text-green-500"> {`${el?.emailID} %`}</p>
              </div> */}
            </div>
          </div>
          <div className="flex gap-2 text-nowrap text-sm mt-1">
            <p className="font-semibold">Mobile :</p>
            <p className="font-semibold text-gray-500"> {el?.mobileNumber}</p>
          </div>

          <hr className="mt-6" />
        </div>
      </>
    );
  };

  return (
    <div className="flex relative h-screen ">
    

      <div className="flex-1 bg-slate-50  ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <IoReorderThreeSharp
                onClick={handleToggleSidebar}
                className="text-3xl text-white cursor-pointer md:hidden"
              />
              <p className="text-white text-lg   font-bold ">Your Customers</p>
            </div>
            <div>
              {type === "self" && (
                <Link to={"/pUsers/addParty"}>
                  <button className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out ">
                    <IoIosAddCircle className="text-xl" />
                    Add Customers
                  </button>
                </Link>
              )}
            </div>
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
              <SearchBar onType={searchData} />


              {/* search bar */}
            </div>
          </div>
        </div>

        {/* adding party */}

        {loader ? (
          <div className="flex justify-center items-center h-screen">
            <HashLoader color="#363ad6" />
          </div>
        ) : parties.length > 0 ? (
          <div
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "transparent transparent",
            }}
          >
            <List
              className=""
              height={500} // Specify the height of your list
              itemCount={filteredParty.length} // Specify the total number of items
              itemSize={160} // Specify the height of each item
              width="100%" // Specify the width of your list
            >
              {Row}
            </List>
          </div>
        ) : (
          <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
            No Parties !!!
          </div>
        )}

        {/* <Link to={"/pUsers/addParty"} className="flex justify-center">
        <div className=" px-4  absolute bottom-2 text-white bg-violet-700 rounded-3xl p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer ">
          <IoIosAddCircle className="text-2xl" />
          <p>Create New Party</p>
        </div>
      </Link> */}
      </div>
    </div>
  );
}

export default PartyList;
