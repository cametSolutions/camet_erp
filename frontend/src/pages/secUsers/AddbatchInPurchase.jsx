import { useState } from "react";
import BathAddingForm from "../../components/secUsers/main/Forms/BathAddingForm";
import { useNavigate, useParams } from "react-router-dom";
import { addBatch } from "../../../slices/voucherSlices/commonVoucherSlice";
import { useDispatch, useSelector } from "react-redux";
import TitleDiv from "@/components/common/TitleDiv";

const AddbatchInPurchase = () => {
  const { id } = useParams();
  const product = useSelector((state) =>
    state.commonVoucherSlice.products.find((product) => product._id === id)
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSave = (formData) => {
    // Set loading to true at the start of the save operation
    setLoading(true);

    // Extract required fields from formData
    const {
      batchName,
      quantity,
      price,
      openingStock,
      expDate,
      manufDate,
      godown,
      godown_id,
      godownMongoDbId,
      selectedPriceRate,
    } = formData;

    // Check if the batch already exists
    if (
      product?.GodownList?.some(
        (e) => e.batch === batchName && e.godownMongoDbId === godownMongoDbId
      )
    ) {
      console.log("Batch already exists");

      const userConfirmed = window.confirm(
        "Batch already added. It will be overwritten. Do you want to proceed?"
      );

      // If the user cancels, exit the function and stop loading
      if (!userConfirmed) {
        setLoading(false);
        return;
      }
    }

    const newBatch = {
      balance_stock: Number(openingStock),
      batch: batchName,
      mfgdt: manufDate.toISOString().split("T")[0],
      expdt: expDate.toISOString().split("T")[0],
      newBatch: true,
      selectedPriceRate,
    };

    if (godownMongoDbId && godown_id && godown) {
      newBatch.godown = godown;
      newBatch.godown_id = godown_id;
      newBatch.godownMongoDbId = godownMongoDbId;
    }



    const data = {
      _id: id,
      GodownList: [newBatch],
    };



    console.log(newBatch);

    // Dispatch action to add batch
    dispatch(addBatch(data));

    // Wait for 1 second before navigating
    setTimeout(() => {
      setLoading(false);
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="relative">
      <TitleDiv title={"Add Batch"} loading={loading} />

      <BathAddingForm onSave={onSave} product={product} />
    </div>
  );
};

export default AddbatchInPurchase;
