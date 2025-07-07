/* eslint-disable react/no-unknown-property */

import { useDispatch, useSelector } from "react-redux";
import EditItemForm from "./EditItemForm";
import useFetch from "@/customHook/useFetch";
import { useEffect } from "react";
import { addWarrantyCardsList } from "../../../../slices/voucherSlices/commonVoucherSlice";

function EditItemVoucher() {
  const ItemsFromRedux = useSelector((state) => {
    return state.commonVoucherSlice.items;
  });

  const { voucherType, warrantyCardsList } = useSelector(
    (state) => state.commonVoucherSlice
  );
  const company = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

  const dispatch = useDispatch();

  //// to get warranty cards
  const { data: warrantyCardData, loading } = useFetch(
    warrantyCardsList === null && `/api/sUsers/getWarrantyCards/${company?._id}`
  );

  useEffect(() => {
    if (warrantyCardData && warrantyCardsList === null) {
      dispatch(addWarrantyCardsList(warrantyCardData?.data));
    }
  }, [warrantyCardData]);


  let modifiedVoucherType = voucherType;
  if (voucherType === "sales") {
    modifiedVoucherType = "sale";
  }

  let taxInclusive = false;
  taxInclusive =
    company?.configurations?.[0]?.addRateWithTax[modifiedVoucherType] ?? false;

  return (
    <EditItemForm
      ItemsFromRedux={ItemsFromRedux}
      from={voucherType}
      taxInclusive={taxInclusive}
      loading={loading}
    />
  );
}

export default EditItemVoucher;
