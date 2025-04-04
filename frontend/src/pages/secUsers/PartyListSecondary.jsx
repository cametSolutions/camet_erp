import { useState } from "react";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

import PartyListComponent from "../../components/common/List/PartyListComponent";
import TitleDiv from "../../components/common/TitleDiv";
import api from "@/api/api";

function PartyListSecondary() {
  const [refresh, setRefresh] = useState(false);

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

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

        // Refresh the component
        setRefresh(!refresh);
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred");
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-slate-50 h-screen overflow-hidden">
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
      </div>

      <PartyListComponent
        type={type}
        cpm_id={cpm_id}
        IsVoucher={false}
        deleteHandler={deleteHandler}
        key={refresh} // This forces a re-render when refresh changes
      />
    </div>
  );
}

export default PartyListSecondary;