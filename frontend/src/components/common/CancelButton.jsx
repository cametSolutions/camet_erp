// /* eslint-disable react/prop-types */
// import { MdCancel } from "react-icons/md";

// import Swal from "sweetalert2";
// import api from "../../api/api";
// import { toast } from "react-toastify";
// import { useState } from "react";

// function CancelButton({
//   id,
//   tab,
//   isCancelled,
//   reFetch,
//   vanSale = false,
//   isEditable,
//   isConverted = false,
// }) {
//   const [refresh, setRefresh] = useState(false);

//   if (tab === "vanSale") {
//     tab = "Sales";
//     vanSale = true;
//   }

//   const handleCancel = () => {
//     console.log("isEditablerr", isEditable);

//     if (isEditable !== undefined && isEditable === false) {
//       window.alert(
//         "You can't cancel this voucher since it has been used to generate receipts or payments"
//       );
//       return;
//     }
//     if (isConverted !== undefined && isConverted === true) {
//       window.alert(
//         "You can't edit this voucher since it has been  converted to sales"
//       );
//       return;
//     }
//     Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       cancelButtonColor: "#d33",
//       cancelButtonText: "Go Back",
//       confirmButtonText: "Yes, Cancel it!",
//     }).then((result) => {
//       // If the user confirms the deletion

//       if (result.isConfirmed) {
//         const deleteVoucher = async () => {
//           console.log(tab);

//           try {
//             await api.post(
//               `/api/sUsers/cancel${tab}/${id}?vanSale=${vanSale}`,
//               {},

//               {
//                 withCredentials: true,
//               }
//             );

//             Swal.fire({
//               title: "Cancelled!",
//               text: "Your file has been cancelled.",
//               icon: "success",
//             });

//             reFetch(!refresh);
//           } catch (error) {
//             console.log(error);
//             toast.error(error.response.data.message);
//           }
//         };
//         deleteVoucher();
//       }
//     });
//   };

//   return (
//     <div>
//       <div
//         onClick={() => handleCancel()}
//         className={` ${
//           isCancelled ? " pointer-events-none opacity-60 " : ""
//         } flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110 cursor-pointer `}
//       >
//         <MdCancel className={`  text-red-500`} />
//         <p className="text-black font-bold text-sm">
//           {isCancelled ? "Cancelled" : "Cancel"}
//         </p>
//       </div>
//     </div>
//   );
// }

// export default CancelButton;

/* eslint-disable react/prop-types */
import { useState } from "react";
import { MdCancel } from "react-icons/md";
import { toast } from "react-toastify";
import api from "../../api/api";

// Import Shadcn UI components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function CancelButton({
  id,
  tab,
  isCancelled,
  reFetch,
  vanSale = false,
  isEditable,
  isConverted = false,
}) {
  const [refresh, setRefresh] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (tab === "vanSale") {
    tab = "Sales";
    vanSale = true;
  }

  const handleCancelClick = () => {
    if (isEditable !== undefined && isEditable === false) {
      window.alert(
        "You can't cancel this voucher since it has been used to generate receipts or payments"
      );
      return;
    }
    if (isConverted !== undefined && isConverted === true) {
      window.alert(
        "You can't edit this voucher since it has been converted to sales"
      );
      return;
    }

    // Open the confirmation dialog
    setIsDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    // try {
    //   await api.post(
    //     `/api/sUsers/cancel${tab}/${id}?vanSale=${vanSale}`,
    //     {},
    //     {
    //       withCredentials: true,
    //     }
    //   );

    //   toast.success("Your file has been cancelled successfully");
    //   reFetch(!refresh);
    // } catch (error) {
    //   console.log(error);
    //   toast.error(error.response?.data?.message || "Failed to cancel");
    // }

    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div
        onClick={handleCancelClick}
        className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className={`p-2 rounded-full bg-gray-100 mb-2`}>
          <MdCancel className="text-red-500" />
        </div>
        <span className="text-[10px] font-bold">Cancel</span>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent className="bg-gray-900 text-white border-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              You won't be able to revert this!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">
              Go Back
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Yes, Cancel it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CancelButton;
