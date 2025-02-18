/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";

import SearchBar from "../../components/common/SearchBar";
import PartyListComponent from "../../components/common/List/PartyListComponent";
import CustomBarLoader from "../../components/common/CustomBarLoader";
import TitleDiv from "../../components/common/TitleDiv";

function PartyListSecondary() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [refresh, setRefresh] = useState(false);
  const [loader, setLoader] = useState(false);
  const [filteredParty, setFilteredParty] = useState([]);

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    setLoader(true);

    const fetchParties = async () => {
      try {
        const res = await api.get(`/api/sUsers/PartyList/${cpm_id}`, {
          withCredentials: true,
        });

        setParties(res.data.partyList);
      } catch (error) {
        console.log(error);
      } finally {
        setLoader(false);
      }
    };
    fetchParties();
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
        const res = await api.delete(`/api/sUsers/deleteParty/${id}`, {
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

  return (
    <div className=" bg-slate-50 h-screen overflow-hidden  ">
      <div className="sticky top-0 z-20">
    

       

        <TitleDiv
          title="Your Customers"
          dropdownContents={[
            {
              title: "Add Customers",
              to: "/sUsers/addParty",
            },
            {
              title: "Add Opening",
              to: "/sUsers/addOpening",
            },
          ]}
        />

        <SearchBar onType={searchData} />
      </div>

      {/* adding party */}

      {loader ? (
        <CustomBarLoader color="#363ad6" />
      ) : parties.length === 0 ? (
        <div className="font-bold flex justify-center items-center mt-12 text-gray-500">
          No Parties!!!
        </div>
      ) : (
        <PartyListComponent
          type={type}
          filteredParty={filteredParty}
          deleteHandler={deleteHandler}
        />
      )}
    </div>
  );
}

export default PartyListSecondary;
