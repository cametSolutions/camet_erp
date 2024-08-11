/* eslint-disable react/prop-types */
import { MdCancel } from "react-icons/md";

import Swal from "sweetalert2";
import api from "../../api/api";
import { toast } from "react-toastify";
import { useState } from "react";

function CancelButton({ id, tab, isCancelled, reFetch, vanSale = false }) {
  const [refresh, setRefresh] = useState(false);
  if (tab === "vanSale") {
    tab = "Sales";
    vanSale = true;
  }


  console.log(tab,vanSale);
  
  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      // If the user confirms the deletion

      if (result.isConfirmed) {
        const deleteVoucher = async () => {
          try {
            const res = await api.post(
              `/api/sUsers/cancel${tab}/${id}?vanSale=${vanSale}`,
              {},

              {
                withCredentials: true,
              }
            );

            Swal.fire({
              title: "Cancelled!",
              text: "Your file has been cancelled.",
              icon: "success",
            });

            reFetch(!refresh);
          } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
          }
        };
        deleteVoucher();
      }
    });
  };

  return (
    <div>
      <div
        onClick={() => handleCancel()}
        className={` ${
          isCancelled ? " pointer-events-none opacity-60 " : ""
        } flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110 cursor-pointer `}
      >
        <MdCancel className={`  text-red-500`} />
        <p className="text-black font-bold text-sm">
          {isCancelled ? "Cancelled" : "Cancel"}
        </p>
      </div>
    </div>
  );
}

export default CancelButton;
