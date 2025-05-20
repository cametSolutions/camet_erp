
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addNewAddress } from "../../../../slices/voucherSlices/commonVoucherSlice";
import AddressForm from "@/components/secUsers/AddressForm";
import TitleDiv from "@/components/common/TitleDiv";
import { useState } from "react";

function BillToVoucher() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading,setLoading]=useState(false)



  const submitFormData = (formData) => {
    dispatch(addNewAddress(formData));
    navigate(-1);
  };

  const { configurations } = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  // const ship to
  const showShipTo = configurations[0]?.enableShipTo["sale"];

  // console.log(configurations);

  return (
    <div className="">
      <TitleDiv title={"Change Address"} loading={loading}  />
      <AddressForm
        getFormData={submitFormData}
        showShipTo={showShipTo}
        setLoading={setLoading}
        loading={loading}
      />
    </div>
  );
}

export default BillToVoucher;
