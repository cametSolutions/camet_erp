/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { IoReorderThreeSharp } from "react-icons/io5";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { IoIosAddCircle } from "react-icons/io";
import { removeAll } from "../../../slices/invoice";
import { removeAllSales } from "../../../slices/sales";

import { useDispatch } from "react-redux";
import SearchBar from "../../components/common/SearchBar";
import { useSidebar } from "../../layout/Layout";
import PartyListComponent from "../../components/common/List/PartyListComponent";



function PartyList() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");

  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [filteredParty, setFilteredParty] = useState([]);

  const cpm_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg?._id
  );

  const type = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg?.type
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


 

  return (
    

      <div className="flex-1 bg-slate-50  ">
        <div className="sticky top-0 z-20">
          <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3  flex justify-between items-center  ">
            <div className="flex items-center justify-center gap-2">
              <IoReorderThreeSharp
                onClick={handleToggleSidebar}
                className="text-3xl text-white cursor-pointer md:hidden"
              />
              <p className="text-white text-lg   font-bold ">Your Customersaa</p>
            </div>
            <div>
        
                <Link to={"/pUsers/addParty"}>
                  <button className="flex items-center gap-2 text-white bg-[#40679E] px-2 py-1 rounded-md text-sm  hover:scale-105 duration-100 ease-in-out ">
                    <IoIosAddCircle className="text-xl" />
                    Add Customers
                  </button>
                </Link>
              
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
      ) : parties.length === 0 ? (
        <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
          No Parties!!!
        </div>
      ) : (
        <PartyListComponent
          type={type}
          filteredParty={filteredParty}
          deleteHandler={deleteHandler}
          user={"primary"}
        />
      )}

        {/* <Link to={"/pUsers/addParty"} className="flex justify-center">
        <div className=" px-4  absolute bottom-2 text-white bg-violet-700 rounded-3xl p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer ">
          <IoIosAddCircle className="text-2xl" />
          <p>Create New Party</p>
        </div>
      </Link> */}
      </div>

  );
}

export default PartyList;
