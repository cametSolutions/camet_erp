// import Decimal from 'decimal.js';

// export const calculateTotal = (item, selectedPriceLevel) => {
//     const priceRate =
//         item?.Priceleveles?.find(
//             (level) => level.pricelevel === selectedPriceLevel
//         )?.pricerate || 0;

//     let subtotal = 0;
//     let individualTotals = [];

//     if (item.hasGodownOrBatch) {
//         console.log("haii");
//         item.GodownList.forEach((godownOrBatch, index) => {
//             console.log(godownOrBatch.count);
//             let individualSubtotal = priceRate * Number(godownOrBatch.count) || 0;

//             if (godownOrBatch.discount !== 0 && godownOrBatch.discount !== undefined) {
//                 individualSubtotal -= godownOrBatch.discount;
//             } else if (godownOrBatch.discountPercentage !== 0 && godownOrBatch.discountPercentage !== undefined) {
//                 individualSubtotal -= (individualSubtotal * godownOrBatch.discountPercentage) / 100;
//             }

//             const gstAmount = (individualSubtotal * (item.igst || 0)) / 100;

//             subtotal += individualSubtotal + gstAmount;

//             // Calculate individual total without modifying the original object
//             const individualTotal = individualSubtotal + gstAmount;

//             // Add to individual totals list with index
//             individualTotals.push({
//                 index,
//                 batch: godownOrBatch.batch,
//                 individualTotal,
//             });
//         });
//     } else {
//         console.log("haii");
//         let individualSubtotal = priceRate * Number(item.count);

//         if (item.discount !== 0 && item.discount !== undefined) {
//             individualSubtotal -= item.discount;
//         } else if (item.discountPercentage !== 0 && item.discountPercentage !== undefined) {
//             individualSubtotal -= (individualSubtotal * item.discountPercentage) / 100;
//         }

//         const gstAmount = (individualSubtotal * (item.newGst || item.igst || 0)) / 100;

//         subtotal += individualSubtotal + gstAmount;

//         // Calculate individual total without modifying the original object
//         const individualTotal = individualSubtotal + gstAmount;

//         // Add to individual totals list with index
//         individualTotals.push({
//             index: 0,
//             batch: item.batch || "No batch",
//             individualTotal,
//         });
//     }

//     subtotal = Number(subtotal.toFixed(2));

//     console.log(subtotal);

//     return {
//         individualTotals,
//         total: subtotal,
//     };
// };

// // Your existing handleIncrement function
// export const handleIncrement = (item, _id, godownIndex = null, selectedPriceLevel, godownname = '') => {
//     console.log(item);
//     console.log(_id);
//     console.log(godownIndex);
//     console.log(selectedPriceLevel);
//     console.log(godownname);
//     return item.map((item) => {
//         if (item._id !== _id) return item; // Keep items unchanged if _id doesn't match
//         const currentItem = { ...item };

//         if (currentItem?.GodownList?.length > 0 && godownIndex !== null && !godownname) {
//             const godownOrBatch = { ...currentItem.GodownList[godownIndex] };

//             // If godownOrBatch.count is undefined, set it to 1, otherwise increment by 1
//             godownOrBatch.count = (godownOrBatch.count || 0) + 1;

//             // Update the specific godown/batch in the GodownList array
//             const updatedGodownList = currentItem.GodownList.map((godown, index) =>
//                 index === godownIndex ? godownOrBatch : godown
//             );
//             currentItem.GodownList = updatedGodownList;

//             // Calculate the sum of counts in the GodownList array
//             const sumOfCounts = updatedGodownList.reduce(
//                 (sum, godown) => sum + (godown.count || 0),
//                 0
//             );
//             currentItem.count = sumOfCounts; // Update currentItem.count with the sum

//             // Calculate totals and update individual batch totals
//             const totalData = calculateTotal(currentItem, selectedPriceLevel);
//             const updatedGodownListWithTotals = updatedGodownList.map(
//                 (godown, index) => ({
//                     ...godown,
//                     individualTotal:
//                         totalData.individualTotals.find(({ index: i }) => i === index)
//                             ?.individualTotal || 0,
//                 })
//             );
//             currentItem.GodownList = updatedGodownListWithTotals;
//             currentItem.total = totalData.total; // Update the overall total
//         } else {
//             // Increment the count of the currentItem by 1
//             currentItem.count = new Decimal(currentItem.count).add(1).toNumber();

//             // Calculate totals and update individual total
//             const totalData = calculateTotal(currentItem, selectedPriceLevel);
//             currentItem.individualTotal = totalData.total;
//             currentItem.total = totalData.total; // Update the overall total
//         }

//         console.log(currentItem); // Log the updated currentItem
//         return currentItem; // Return the updated currentItem
//     });
// };
