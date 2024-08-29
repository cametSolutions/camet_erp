/* eslint-disable react/no-unknown-property */

import { useNavigate } from "react-router-dom";
import {  useDispatch, useSelector } from "react-redux";
import { updateItem } from "../../../slices/purchase";
import EditItemForm from "../../components/secUsers/main/Forms/EditItemForm";

function EditItemSalesSecondary() {

  const ItemsFromRedux = useSelector((state)=>{
    return state.purchase.items
  })

  
  const dispatch = useDispatch();
  const navigate=useNavigate();

  const submitHandler = (item, index, quantity, newPrice, totalAmount, selectedItem,discountAmount,discountPercentage, type,igst) => {
    const newItem = structuredClone(item);


    if (selectedItem[0]?.hasGodownOrBatch) {
      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          return {
            ...godown,
            count: Number(quantity) || 0,
            selectedPriceRate: Number(newPrice) || 0,
            discount: type === "amount" ? discountAmount : "",
            discountPercentage:
              type === "amount" ? "" : parseFloat(discountPercentage),
            individualTotal: Number(totalAmount.toFixed(2)),
          };
        } else {
          return godown;
        }
      });

      newItem.GodownList = newGodownList;
      newItem.count = Number(
        newGodownList
          ?.reduce((acc, curr) => (acc += curr?.count || 0), 0)
          .toFixed(2)
      );

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
  
    } else {
      // newItem.total = Number(totalAmount.toFixed(2));
      newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
      newItem.total = Number(totalAmount.toFixed(2));
      newItem.count = quantity || 0;
      const godownList = [...newItem.GodownList];
      godownList[0].selectedPriceRate = Number(newPrice) || 0;

      newItem.GodownList = godownList;
      newItem.newGst = igst;
      if (type === "amount") {
        newItem.discount = discountAmount;
        newItem.discountPercentage = "";
      } else {
        newItem.discount = "";
        newItem.discountPercentage = parseFloat(discountPercentage);
      }
    }
      dispatch(updateItem(newItem));
    navigate(-1);
  };
  

  return (
<EditItemForm submitHandler={submitHandler} ItemsFromRedux={ItemsFromRedux} from="purchase"/>
  );
}

export default EditItemSalesSecondary;
