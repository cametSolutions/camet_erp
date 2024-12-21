/* eslint-disable react/no-unknown-property */

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateItem, changeTaxInclusive } from "../../../slices/salesSecondary";
import EditItemForm from "../../components/secUsers/main/Forms/EditItemForm";

function EditItemSalesSecondary() {
  const ItemsFromRedux = useSelector((state) => {
    return state.salesSecondary.items;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  

  const submitHandler = (
    item,
    index,
    quantity,
    newPrice,
    totalAmount,
    selectedItem,
    discountAmount,
    discountPercentage,
    type,
    igst,
    isTaxInclusive,
    // taxAmount

  ) => {
    const newItem = structuredClone(item);

    if (selectedItem[0]?.hasGodownOrBatch) {
      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          return {
            ...godown,
            count: Number(quantity) || 0,
            selectedPriceRate: Number(newPrice) || 0,
            discount: discountAmount || 0,
            // taxAmount: Number(taxAmount.toFixed(2)),
            discountPercentage: discountPercentage || 0,
            individualTotal: Number(totalAmount.toFixed(2)),
            discountType: type,
          };
        } else {
          return godown;
        }
      });

      newItem.GodownList = newGodownList;

      newItem.count = Number(
        newGodownList?.reduce((acc, curr) => {
          if (curr.added === true) {
            return acc + curr.count;
          } else {
            return acc;
          }
        }, 0)
      );

      newItem.total = Number(
        newGodownList
          .reduce(
            (acc, curr) => acc + (curr?.added ? curr.individualTotal : 0 || 0),
            0
          )
          .toFixed(2)
      );

      newItem.isTaxInclusive = isTaxInclusive;
    } else {
      // newItem.total = Number(totalAmount.toFixed(2));
      newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
      newItem.total = Number(totalAmount.toFixed(2));
      newItem.count = quantity || 0;
      newItem.isTaxInclusive = isTaxInclusive;
      newItem.discount = discountAmount;
      newItem.discountPercentage = discountPercentage;
      newItem.discountType = type;

      const godownList = [...newItem.GodownList];
      // console.log(godownList);
      godownList[0].selectedPriceRate = Number(newPrice) || 0;

      newItem.GodownList = godownList;
      newItem.newGst = igst;
    }

    dispatch(changeTaxInclusive(selectedItem[0]?._id));
    dispatch(updateItem(newItem));

    navigate(-1);
  };

  return (
    <EditItemForm
      submitHandler={submitHandler}
      ItemsFromRedux={ItemsFromRedux}
      from="sales"
      taxInclusive={true}
    />
  );
}

export default EditItemSalesSecondary;
