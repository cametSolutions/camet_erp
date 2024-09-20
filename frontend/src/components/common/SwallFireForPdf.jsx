/* eslint-disable react/prop-types */
import Swal from "sweetalert2";
import { IoMdShareAlt } from "react-icons/io";
import { useNavigate } from "react-router-dom";

function SwallFireForPdf({ data, tab = "sales", user }) {
  let selectedUser = user == "primary" ? "pUsers" : "sUsers";
  const navigate = useNavigate();
  const chooseFormat = () => {
    Swal.fire({
      title: "Which format would you like?",
      html: "<p>Choose between:</p>",
      showDenyButton: tab === "CreditNote" || tab === "DebitNote" ? false : true,      showCancelButton: true,
      confirmButtonText: "Tax Invoice",
      denyButtonText: `POS format`,
      customClass: {
        container: "swal2-container-custom",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        if (tab === "salesOrder") {
          navigate(`/${selectedUser}/shareInvoice/${data._id}`);
        } 
        else if (tab === "vanSale") {
          navigate(`/${selectedUser}/shareVanSale/${data._id}`);
        }
        else if (tab === "purchase") {
          navigate(`/${selectedUser}/sharePurchase/${data._id}`);
        }
        else if (tab === "CreditNote") {
          navigate(`/${selectedUser}/shareCreditNote/${data._id}`);
        }
        else if (tab === "DebitNote") {
          navigate(`/${selectedUser}/shareDebitNote/${data._id}`);
        }
         else {
          navigate(`/${selectedUser}/shareSales/${data._id}`);
        }
        // Swal.fire("Tax Invoice selected", "", "success");
      } else if (result.isDenied) {
        if (tab === "salesOrder") {
          navigate(`/${selectedUser}/shareInvoiceThreeInch/${data._id}`);
        } 
        else if (tab === "vanSale") {
          navigate(`/${selectedUser}/shareVanSaleThreeInch/${data._id}`);
        } 
        else if (tab === "purchase") {
          navigate(`/${selectedUser}/sharePurchaseThreeInch/${data._id}`);
        }
        
        else {
          navigate(`/${selectedUser}/shareSalesThreeInch/${data._id}`);
        }
      }
    });
  };

  return (
    <div>
      <div
        onClick={chooseFormat}
        className={ ` ${data?.isCancelled && "pointer-events-none opacity-60"} flex flex-col justify-center items-center transition-all duration-150 transform hover:scale-110  cursor-pointer`}
        >
        <IoMdShareAlt />
        <p className="text-black font-bold text-sm">Share</p>
      </div>
    </div>
  );
}

export default SwallFireForPdf;
