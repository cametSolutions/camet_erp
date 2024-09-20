import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import AddressForm from "../../components/secUsers/AddressForm";
import { useDispatch, useSelector } from "react-redux";
import { addNewAddress } from "../../../slices/debitNote";

function BillToDebitNote() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const partyDetails = useSelector((state) => state.debitNote.party);
  const newBillToShipTo =
    useSelector((state) => state.debitNote.party.newBillToShipTo) || {};

    const submitFormData = (formData) => {
      
      dispatch(addNewAddress(formData));
      navigate(-1);
    };
    

  return (
    <div className="flex ">
      <div className="flex-1 bg-slate-100  h-screen overflow-y-scroll ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          <IoIosArrowRoundBack
            onClick={() => navigate(-1)}
            className="text-3xl text-white cursor-pointer"
          />
          <p className="text-white text-lg   font-bold ">Change Address</p>
        </div>

        <AddressForm
          getFormData={submitFormData}
          newBillToShipTo={newBillToShipTo}
          partyDetails={partyDetails}
        />
      </div>
    </div>
  );
}

export default BillToDebitNote;
