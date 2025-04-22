/* eslint-disable react/no-unknown-property */

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateItem } from "../../../slices/stockTransferSecondary";
import EditItemForm from "../../components/secUsers/main/Forms/EditItemForm";

function EditItemStockTransfer() {
  const ItemsFromRedux = useSelector((state) => {
    return state.stockTransferSecondary.items;
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (item, index, quantity) => {
    const newItem = structuredClone(item);

    if (item?.hasGodownOrBatch) {
      console.log("haii");
      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          console.log(godown);
          return {
            ...godown,
            count: Number(quantity) || 0,
            selectedPriceRate: 0,
            discount: 0,
            discountPercentage: 0,
            added: true,
            individualTotal: 0,
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

      newItem.total = 0
      console.log(newItem.total);
      console.log(newItem);
    } else {
      return;
    }

    // else {
    //   console.log(",jxdhf");

    //   // newItem.total = Number(totalAmount.toFixed(2));
    //   newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
    //   newItem.total = Number(totalAmount.toFixed(2));
    //   newItem.count = quantity || 0;
    //   const godownList = [...newItem.GodownList];
    //   godownList[0].selectedPriceRate = Number(newPrice) || 0;

    //   newItem.GodownList = godownList;
    //   newItem.newGst = igst;
    //   if (type === "amount") {
    //     newItem.discount = discountAmount;
    //     newItem.discountPercentage = "";
    //   } else {
    //     newItem.discount = "";
    //     newItem.discountPercentage = parseFloat(discountPercentage);
    //   }
    // }

    dispatch(updateItem(newItem));

    navigate(-1);
  };

  return (
    <EditItemForm
      submitHandler={submitHandler}
      ItemsFromRedux={ItemsFromRedux}
      from="stockTransfer"
    />
  );
}

export default EditItemStockTransfer;
