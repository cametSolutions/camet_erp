/* eslint-disable react/no-unknown-property */

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  updateItem,
  changeTaxInclusive,
  removeItem,
} from "../../../slices/salesSecondary";
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
    actualQuantity,
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
      // Check if this is a godown-only item (no batches)
      const isGodownOnlyItem = newItem.GodownList?.every(
        (g) => g?.godown_id && !g?.batch
      );

      const newGodownList = newItem.GodownList.map((godown, idx) => {
        if (idx == index) {
          return {
            ...godown,
            count: Number(quantity) || 0,
            added: Number(quantity) <= 0 ? false : true,
            actualCount: Number(actualQuantity) || 0,
            selectedPriceRate: Number(newPrice) || 0,
            discount: discountAmount || 0,
            // taxAmount: Number(taxAmount.toFixed(2)),
            discountPercentage: discountPercentage || 0,
            individualTotal: Number(totalAmount.toFixed(2)),
            discountType: type,
          };
        } else if (isGodownOnlyItem) {
          console.log("godown only item");

          // Apply the logic from updateAllGodowns for other godowns when it's godown-only item
          const updatedGodown = { ...godown };

          // Only update godowns that are not the current one
          updatedGodown.selectedPriceRate = Number(newPrice);
          updatedGodown.discountType = type;
          updatedGodown.isTaxInclusive = isTaxInclusive;

          // Calculate discount amount and percentage based on tax inclusivity
          let calculatedDiscountAmount = 0;
          let calculatedDiscountPercentage = 0;
          let individualTotal = 0;

          if (isTaxInclusive) {
            const taxInclusivePrice = newPrice * (updatedGodown.count || 0);
            const taxBasePrice = Number(
              (taxInclusivePrice / (1 + igst / 100)).toFixed(2)
            );

            if (type === "amount") {
              calculatedDiscountAmount = discountAmount; // Treat as amount
              calculatedDiscountPercentage =
                taxBasePrice !== 0
                  ? Number(((discountAmount / taxBasePrice) * 100).toFixed(2))
                  : 0;
            } else if (type === "percentage") {
              calculatedDiscountPercentage = discountPercentage; // Treat as percentage
              calculatedDiscountAmount =
                Number(
                  ((discountPercentage / 100) * taxBasePrice).toFixed(2)
                ) || 0;
            }

            const discountedPrice = Number(
              (taxBasePrice - calculatedDiscountAmount)?.toFixed(2)
            );

            //  Cess Calculation
            let cessValue = 0;
            let addlCessValue = 0;

            console.log(cessValue);
            console.log(addlCessValue);

            if (item.cess && item.cess > 0) {
              cessValue = discountedPrice * (item.cess / 100);
            }

            if (item.addl_cess && item.addl_cess > 0) {
              addlCessValue = quantity * item.addl_cess;
            }

            console.log(cessValue);
            console.log(addlCessValue);

            const totalCessAmount = cessValue + addlCessValue;

            ////final calculation
            const taxAmount = discountedPrice * (igst / 100);
            individualTotal = Number(
              (discountedPrice + taxAmount + totalCessAmount)?.toFixed(2)
            );
          } else {
            const taxExclusivePrice = newPrice * (updatedGodown.count || 0);

            if (type === "amount") {
              calculatedDiscountAmount = discountAmount;
              calculatedDiscountPercentage =
                taxExclusivePrice !== 0
                  ? Number(
                      ((discountAmount / taxExclusivePrice) * 100).toFixed(2)
                    )
                  : 0;
            } else if (type === "percentage") {
              calculatedDiscountPercentage = discountPercentage;
              calculatedDiscountAmount =
                Number(
                  ((discountPercentage / 100) * taxExclusivePrice).toFixed(2)
                ) || 0;
            }

            const discountedPrice = Number(
              (taxExclusivePrice - calculatedDiscountAmount)?.toFixed(2)
            );

             //  Cess Calculation
             let cessValue = 0;
             let addlCessValue = 0;
 
             console.log(cessValue);
             console.log(addlCessValue);
 
             if (item.cess && item.cess > 0) {
               cessValue = discountedPrice * (item.cess / 100);
             }
 
             if (item.addl_cess && item.addl_cess > 0) {
               addlCessValue = quantity * item.addl_cess;
             }
 
             console.log(cessValue);
             console.log(addlCessValue);
 
             const totalCessAmount = cessValue + addlCessValue;

            ////final calculation
            const taxAmount = discountedPrice * (igst / 100);
            individualTotal = Number((discountedPrice + taxAmount+totalCessAmount)?.toFixed(2));
          }

          updatedGodown.discount = calculatedDiscountAmount;
          updatedGodown.discountPercentage = calculatedDiscountPercentage;
          updatedGodown.individualTotal =
            Number(individualTotal) > 0 ? Number(individualTotal) : 0;

          return updatedGodown;
        } else {
          // Return unchanged if not current index and not a godown-only item
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

      newItem.isTaxInclusive = isTaxInclusive;
    } else {
      if (parseInt(quantity) <= 0) {
        dispatch(removeItem(item?._id));
      }
      // newItem.total = Number(totalAmount.toFixed(2));
      newItem.GodownList[0].individualTotal = Number(totalAmount.toFixed(2));
      newItem.total = Number(totalAmount.toFixed(2));
      newItem.count = Number(quantity) || 0;
      newItem.actualCount = Number(actualQuantity) || 0;
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
    dispatch(updateItem({ item: newItem, moveToTop: false }));

    navigate(-1);
  };

  // const submitHandler = (
  //   item,
  //   index,
  //   quantity,
  //   actualQuantity,
  //   newPrice,
  //   totalAmount,
  //   selectedItem,
  //   discountAmount,
  //   discountPercentage,
  //   type,
  //   igst,
  //   isTaxInclusive,
  //   cessAmount = 0,
  //   additionalCessAmount = 0
  // ) => {
  //   const newItem = structuredClone(item);

  //   if (selectedItem[0]?.hasGodownOrBatch) {
  //     const isGodownOnlyItem = newItem.GodownList?.every(
  //       (g) => g?.godown_id && !g?.batch
  //     );

  //     const newGodownList = newItem.GodownList.map((godown, idx) => {
  //       if (idx === index) {
  //         return {
  //           ...godown,
  //           count: Number(quantity) || 0,
  //           added: Number(quantity) > 0,
  //           actualCount: Number(actualQuantity) || 0,
  //           selectedPriceRate: Number(newPrice) || 0,
  //           discount: discountAmount || 0,
  //           discountPercentage: discountPercentage || 0,
  //           discountType: type,
  //           individualTotal: Number(totalAmount.toFixed(2)),
  //           cessAmount: Number(cessAmount.toFixed(2)),
  //           additionalCessAmount: Number(additionalCessAmount.toFixed(2))
  //         };
  //       } else if (isGodownOnlyItem) {
  //         const updatedGodown = { ...godown };

  //         updatedGodown.selectedPriceRate = Number(newPrice);
  //         updatedGodown.discountType = type;
  //         updatedGodown.isTaxInclusive = isTaxInclusive;

  //         let calculatedDiscountAmount = 0;
  //         let calculatedDiscountPercentage = 0;
  //         let individualTotal = 0;

  //         const totalQuantity = updatedGodown.count || 0;
  //         let basePrice = newPrice * totalQuantity;
  //         let taxBasePrice = basePrice;

  //         if (isTaxInclusive) {
  //           taxBasePrice = Number((basePrice / (1 + igst / 100)).toFixed(2));
  //         }

  //         if (type === "amount") {
  //           calculatedDiscountAmount = discountAmount;
  //           calculatedDiscountPercentage =
  //             taxBasePrice !== 0
  //               ? Number(((discountAmount / taxBasePrice) * 100).toFixed(2))
  //               : 0;
  //         } else if (type === "percentage") {
  //           calculatedDiscountPercentage = discountPercentage;
  //           calculatedDiscountAmount =
  //             Number(((discountPercentage / 100) * taxBasePrice).toFixed(2)) || 0;
  //         }

  //         const discountedPrice = Number(
  //           (taxBasePrice - calculatedDiscountAmount).toFixed(2)
  //         );

  //         // Cess Calculation
  //         let cessValue = 0;
  //         let addlCessValue = 0;

  //         if (item.cess && item.cess > 0) {
  //           cessValue = discountedPrice * (item.cess / 100);
  //         }

  //         if (item.addl_cess && item.addl_cess > 0) {
  //           addlCessValue = totalQuantity * item.addl_cess;
  //         }

  //         const totalCessAmount = cessValue + addlCessValue;

  //         // Tax Calculation
  //         const taxAmount = discountedPrice * (igst / 100);

  //         // Final Total Calculation
  //         individualTotal = Number(
  //           (discountedPrice + taxAmount + totalCessAmount).toFixed(2)
  //         );

  //         updatedGodown.discount = calculatedDiscountAmount;
  //         updatedGodown.discountPercentage = calculatedDiscountPercentage;
  //         updatedGodown.individualTotal =
  //           Number(individualTotal) > 0 ? Number(individualTotal) : 0;
  //         updatedGodown.cessAmount = Number(cessValue.toFixed(2));
  //         updatedGodown.additionalCessAmount = Number(addlCessValue.toFixed(2));

  //         return updatedGodown;
  //       } else {
  //         return godown;
  //       }
  //     });

  //     newItem.GodownList = newGodownList;

  //     newItem.count = newGodownList.reduce((acc, curr) => acc + (curr.count || 0), 0);
  //   } else {
  //     newItem.count = Number(quantity);
  //     newItem.actualCount = Number(actualQuantity);
  //     newItem.selectedPriceRate = Number(newPrice);
  //     newItem.discount = discountAmount || 0;
  //     newItem.discountPercentage = discountPercentage || 0;
  //     newItem.discountType = type;

  //     let basePrice = newPrice * newItem.count;
  //     let taxBasePrice = basePrice;

  //     if (isTaxInclusive) {
  //       taxBasePrice = Number((basePrice / (1 + igst / 100)).toFixed(2));
  //     }

  //     let discountedPrice = taxBasePrice;

  //     if (type === "amount") {
  //       discountedPrice = taxBasePrice - discountAmount;
  //     } else if (type === "percentage") {
  //       discountedPrice = taxBasePrice - (discountPercentage / 100) * taxBasePrice;
  //     }

  //     // Cess Calculation
  //     let cessValue = 0;
  //     let addlCessValue = 0;

  //     if (item.cess && item.cess > 0) {
  //       cessValue = discountedPrice * (item.cess / 100);
  //     }

  //     if (item.addl_cess && item.addl_cess > 0) {
  //       addlCessValue = newItem.count * item.addl_cess;
  //     }

  //     const totalCessAmount = cessValue + addlCessValue;

  //     // Tax Calculation
  //     const taxAmount = discountedPrice * (igst / 100);

  //     // Final Total Calculation
  //     const individualTotal = Number(
  //       (discountedPrice + taxAmount + totalCessAmount).toFixed(2)
  //     );

  //     newItem.individualTotal = individualTotal > 0 ? individualTotal : 0;
  //     newItem.cessAmount = Number(cessValue.toFixed(2));
  //     newItem.additionalCessAmount = Number(addlCessValue.toFixed(2));
  //   }

  //   // Dispatch the updated item to Redux store
  //   dispatch(changeTaxInclusive(selectedItem[0]?._id));
  //   dispatch(updateItem({ item: newItem, moveToTop: false }));

  //   navigate(-1);

  //   // return newItem;
  // };
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
