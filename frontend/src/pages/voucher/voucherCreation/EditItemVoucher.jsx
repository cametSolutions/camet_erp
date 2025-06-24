/* eslint-disable react/no-unknown-property */

import { useSelector } from "react-redux";
import EditItemForm from "./EditItemForm";

function EditItemVoucher() {
  const ItemsFromRedux = useSelector((state) => {
    return state.commonVoucherSlice.items;
  });

  const { voucherType } = useSelector((state) => state.commonVoucherSlice);
  const company = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );

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
    />
  );
}

export default EditItemVoucher;
