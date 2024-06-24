/* eslint-disable react/prop-types */
import Swal from "sweetalert2";
import { IoMdShareAlt } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function SwallFireForPdf({ data, tab = "sales" }) {
    console.log(data);
  const navigate = useNavigate();
  const chooseFormat = () => {
    Swal.fire({
      title: "Which format would you like?",
      html: "<p>Choose between:</p>",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Tax Invoice",
      denyButtonText: `POS format`,
      customClass: {
        container: "swal2-container-custom",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (tab === "salesOrder") {
          navigate(`/sUsers/shareInvoice/${data._id}`);
        } else {
          navigate(`/sUsers/shareSales/${data._id}`);
        }
        // Swal.fire("Tax Invoice selected", "", "success");
      } else if (result.isDenied) {
        if (tab === "salesOrder") {
          navigate(`/sUsers/shareInvoiceThreeInch/${data._id}`);
        } else {
          navigate(`/sUsers/shareSalesThreeInch/${data._id}`);
        }
      }
    });
  };

  return (
    <div>
      <div
        onClick={chooseFormat}
        className="flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer"
      >
        <IoMdShareAlt />
        <p className="text-black font-bold text-sm">Share</p>
      </div>
    </div>
  );
}

export default SwallFireForPdf;
