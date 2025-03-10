/* eslint-disable react/no-unknown-property */

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, updateItem } from "../../../slices/debitNote";
import EditItemForm from "../../components/secUsers/main/Forms/EditItemForm";

function EditItemDebitNote() {
  const ItemsFromRedux = useSelector((state) => {
    return state.debitNote.items;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (
    item,
    index,
    quantity,
    actualQuantity,
    newPrice,
    totalAmount,
    selectedItem,
    discountAmount,
    discountPercentage,
    type,
    igst
  ) => {
    const newItem = structuredClone(item);

    if (selectedItem[0]?.hasGodownOrBatch) {
      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          return {
            ...godown,
            count: Number(quantity) || 0,
            actualCount: Number(actualQuantity) || 0,
            added: Number(quantity) <= 0 ? false : true,
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

      if (newItem.count <= 0) {
        dispatch(removeItem(item?._id));
      }

      newItem.actualCount = Number(
        newGodownList?.reduce((acc, curr) => {
          if (curr.added === true) {
            return acc + curr.actualCount;
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
    } else {
      if (parseInt(quantity) <= 0) {
        dispatch(removeItem(item?._id));
      }
      // newItem.total = Number(totalAmount.toFixed(2));
      newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
      newItem.total = Number(totalAmount.toFixed(2));
      newItem.count = quantity || 0;
      newItem.actualCount = Number(actualQuantity) || 0;

      const godownList = [...newItem.GodownList];
      godownList[0].selectedPriceRate = Number(newPrice) || 0;
      newItem.GodownList = godownList;
      newItem.newGst = igst;
      newItem.discount = discountAmount;
      newItem.discountPercentage = discountPercentage;
      newItem.discountType = type;
    }
    dispatch(updateItem(newItem));
    navigate(-1);
  };

  return (
    <EditItemForm
      submitHandler={submitHandler}
      ItemsFromRedux={ItemsFromRedux}
      from="debitNote"
    />
  );
}

export default EditItemDebitNote;
