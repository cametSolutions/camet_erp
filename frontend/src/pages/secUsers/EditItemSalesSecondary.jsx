/* eslint-disable react/no-unknown-property */

import {  useSelector } from "react-redux";

import EditItemForm from "../../components/secUsers/main/Forms/EditItemForm";

function EditItemSalesSecondary() {
  const ItemsFromRedux = useSelector((state) => {
    return state.commonVoucherSlice.items;
  });



  return (
    <EditItemForm
      // submitHandler={submitHandler}
      ItemsFromRedux={ItemsFromRedux}
      from="sales"
      taxInclusive={true}
    />
  );
}

export default EditItemSalesSecondary;
