export const createSale = async (req, res) => {
    const Primary_user_id = req.owner;
    const Secondary_user_id = req.sUserId;
    const changedGodowns = [];
  
    try {
      const {
        orgId,
        party,
        items,
        priceLevelFromRedux,
        additionalChargesFromRedux,
        lastAmount,
        salesNumber,
      } = req.body;
  
      const secondaryUser = await SecondaryUser.findById(Secondary_user_id);
      const secondaryMobile = secondaryUser.mobile;
  
      console.log("secondaryMobile", secondaryMobile);
      if (!secondaryUser) {
        return res
          .status(404)
          .json({ success: false, message: "Secondary user not found" });
      }
      const configuration = secondaryUser.configurations.find(
        (config) => config.organization.toString() === orgId
      );
  
      const vanSaleConfig = configuration?.vanSale;
  
      console.log("vanSaleConfig", vanSaleConfig);
  
      // Prepare bulk operations for product and godown updates
      const productUpdates = [];
      const godownUpdates = [];
  
      // Process each item to update product stock and godown stock
      for (const item of items) {
        // Find the product in the product model
        const product = await productModel.findOne({ _id: item._id });
        if (!product) {
          throw new Error(`Product not found for item ID: ${item._id}`);
        }
  
        // Calculate the new balance stock
        // Calculate the new balance stock
        const productBalanceStock = truncateToNDecimals(product.balance_stock, 3);
        console.log("productBalanceStock", productBalanceStock);
        const itemCount = truncateToNDecimals(item.count, 3);
        const newBalanceStock = truncateToNDecimals(
          productBalanceStock - itemCount,
          3
        );
  
        console.log("productBalanceStock", productBalanceStock);
        console.log("newBalanceStock", newBalanceStock);
  
        // Prepare product update operation
        productUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $set: { balance_stock: newBalanceStock } },
          },
        });
  
        console.log("godown", item.GodownList);
        if (vanSaleConfig === true) {
          console.log("haiiii");
          for (const godown of item.GodownList) {
            // Find the corresponding godown in the product's GodownList
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );
  
            console.log("godownIndex", godownIndex);
            if (godownIndex !== -1) {
              // Calculate the new godown stock
              const newGodownStock = truncateToNDecimals(
                product.GodownList[godownIndex].balance_stock - item.count
              );
              console.log("newGodownStock", newGodownStock);
  
              // Prepare godown update operation
              godownUpdates.push({
                updateOne: {
                  filter: {
                    _id: product._id,
                    "GodownList.godown_id": godown.godown_id,
                  },
                  update: {
                    $set: { "GodownList.$.balance_stock": newGodownStock },
                  },
                },
              });
  
              // If a godown was updated and the stock has actually changed, add it to the changedGodowns array
              // if (
              //   godownIndex !== -1
  
              // ) {
              //   changedGodowns.push({
              //     godown_id: godown.godown_id,
              //     newBalanceStock: newGodownStock,
              //   });
              // }
            }
          }
        } else {
          // Update the godown stock for each specified godown
          for (const godown of item.GodownList) {
            // Find the corresponding godown in the product's GodownList
            const godownIndex = product.GodownList.findIndex(
              (g) => g.godown_id === godown.godown_id
            );
            if (godownIndex !== -1) {
              // Calculate the new godown stock
              const newGodownStock = truncateToNDecimals(
                product.GodownList[godownIndex].balance_stock - godown.count,
                3
              );
  
              // Prepare godown update operation
              godownUpdates.push({
                updateOne: {
                  filter: {
                    _id: product._id,
                    "GodownList.godown": godown.godown,
                  },
                  update: {
                    $set: { "GodownList.$.balance_stock": newGodownStock },
                  },
                },
              });
  
              // // If a godown was updated and the stock has actually changed, add it to the changedGodowns array
              // if (
              //   godownIndex !== -1 &&
              //   newGodownStock !==
              //   truncateToNDecimals(
              //     (product.GodownList[godownIndex].balance_stock) - godown.count,
              //     3
              //   )
              // ) {
              //   changedGodowns.push({
              //     godown_id: godown.godown_id,
              //     newBalanceStock: newGodownStock,
              //   });
              // }
            }
          }
        }
      }
  
      // Execute bulk operations
      await productModel.bulkWrite(productUpdates);
      await productModel.bulkWrite(godownUpdates);
  
      const lastSale = await salesModel.findOne(
        {},
        {},
        { sort: { serialNumber: -1 } }
      );
      let newSerialNumber = 1;
  
      // Check if there's a last invoice and calculate the new serial number
      if (lastSale && !isNaN(lastSale.serialNumber)) {
        newSerialNumber = lastSale.serialNumber + 1;
      }
  
      const updatedItems = items.map((item) => {
        // Find the corresponding price rate for the selected price level
        const selectedPriceLevel = item.Priceleveles.find(
          (priceLevel) => priceLevel.pricelevel === priceLevelFromRedux
        );
        // If a corresponding price rate is found, assign it to selectedPrice, otherwise assign null
        const selectedPrice = selectedPriceLevel
          ? selectedPriceLevel.pricerate
          : null;
  
        // Calculate total price after applying discount
        let totalPrice = selectedPrice * (item.count || 1) || 0; // Default count to 1 if not provided
        if (item.discount) {
          // If discount is present (amount), subtract it from the total price
          totalPrice -= item.discount;
        } else if (item.discountPercentage) {
          // If discount is present (percentage), calculate the discount amount and subtract it from the total price
          const discountAmount = (totalPrice * item.discountPercentage) / 100;
          totalPrice -= discountAmount;
        }
  
        // Calculate tax amounts
        const { cgst, sgst, igst } = item;
        const cgstAmt = (totalPrice * cgst) / 100;
        const sgstAmt = (totalPrice * sgst) / 100;
        const igstAmt = (totalPrice * igst) / 100;
  
        // console.log("haii",typeof(parseFloat(sgstAmt.toFixed(2))),);
  
        return {
          ...item,
          selectedPrice: selectedPrice,
          cgstAmt: parseFloat(cgstAmt.toFixed(2)),
          sgstAmt: parseFloat(sgstAmt.toFixed(2)),
          igstAmt: parseFloat(igstAmt.toFixed(2)),
          subTotal: totalPrice, // Optional: Include total price in the item object
        };
      });
  
      let updateAdditionalCharge;
  
      if (additionalChargesFromRedux.length > 0) {
        updateAdditionalCharge = additionalChargesFromRedux.map((charge) => {
          const { value, taxPercentage } = charge;
  
          const taxAmt = (parseFloat(value) * parseFloat(taxPercentage)) / 100;
          console.log(taxAmt);
  
          return {
            ...charge,
            taxAmt: taxAmt,
          };
        });
      }
  
      // Continue with the rest of your function...
      const sales = new salesModel({
        serialNumber: newSerialNumber,
  
        cmp_id: orgId,
        partyAccount: party?.partyName,
  
        party,
        items: updatedItems,
        priceLevel: priceLevelFromRedux,
        additionalCharges: updateAdditionalCharge,
        finalAmount: lastAmount,
        Primary_user_id,
        Secondary_user_id,
        salesNumber,
      });
  
      const result = await sales.save();
  
      // const secondaryUser = await SecondaryUser.findById(Secondary_user_id);
  
      // if (!secondaryUser) {
      //   return res
      //     .status(404)
      //     .json({ success: false, message: "Secondary user not found" });
      // }
  
      let salesConfig = false;
  
      // const configuration = secondaryUser.configurations.find(
      //   (config) => config.organization.toString() === orgId
      // );
      if (configuration) {
        if (
          configuration.salesConfiguration &&
          Object.values(configuration.salesConfiguration).every(
            (value) => value !== ""
          )
        ) {
          salesConfig = true;
        }
      }
  
      // const vanSaleConfig = configuration?.vanSale;
  
      if (vanSaleConfig) {
        const increaseSalesNumber = await SecondaryUser.findByIdAndUpdate(
          Secondary_user_id,
          { $inc: { vanSalesNumber: 1 } },
          { new: true }
        );
      } else if (salesConfig) {
        const increaseSalesNumber = await SecondaryUser.findByIdAndUpdate(
          Secondary_user_id,
          { $inc: { salesNumber: 1 } },
          { new: true }
        );
      } else {
        const increaseSalesNumber = await OragnizationModel.findByIdAndUpdate(
          orgId,
          { $inc: { salesNumber: 1 } },
          { new: true }
        );
      }
  
      const billData = {
        Primary_user_id,
        bill_no: salesNumber,
        cmp_id: orgId,
        party_id: party?.party_master_id,
        bill_amount: lastAmount,
        bill_date: new Date(),
        bill_pending_amt: lastAmount,
        email: party?.emailID,
        mobile_no: party?.mobileNumber,
        party_name: party?.partyName,
        user_id: secondaryMobile || "null",
      };
  
      const updatedDocument = await TallyData.findOneAndUpdate(
        {
          cmp_id: orgId,
          bill_no: salesNumber,
          Primary_user_id: Primary_user_id,
          party_id: party?.party_master_id,
        },
        billData,
        { upsert: true, new: true }
      );
  
      return res.status(200).json({
        success: true,
        message: "Sale created successfully",
        data: result,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal server error, try again!",
        error: error.message,
      });
    }
  };
  