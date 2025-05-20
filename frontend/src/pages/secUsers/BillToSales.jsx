import { IoIosArrowRoundBack } from "react-icons/io";

import { useNavigate } from "react-router-dom";
import AddressForm from "../../components/secUsers/AddressForm";
import { useDispatch, useSelector } from "react-redux";
import { addNewAddress } from "../../../slices/salesSecondary";

function BillToSales() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const partyDetails = useSelector((state) => state.salesSecondary.party);
  const newBillToShipTo =
    useSelector((state) => state.salesSecondary.party.newBillToShipTo) || {};

    const submitFormData = (formData) => {
      
      dispatch(addNewAddress(formData));
      navigate(-1);
    };
    

    const {configurations} = useSelector(
      (state) => state.secSelectedOrganization.secSelectedOrg
    );

    // const ship to
    const showShipTo=configurations[0]?.enableShipTo["sale"]
    

    // console.log(configurations);
    

  return (
    <div className="flex ">
      <div className="flex-1 bg-slate-100  ">
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
          showShipTo={showShipTo}

        />
      </div>
    </div>
  );
}

export default BillToSales;
