import { useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import BathAddingForm from "../../components/secUsers/main/Forms/BathAddingForm";
import { useNavigate, useParams } from "react-router-dom";
import { addBatch } from "../../../slices/purchase";
import { useDispatch, useSelector } from "react-redux";
import { HashLoader } from "react-spinners";

const AddbatchInPurchase = () => {
  const { id } = useParams();
  const product = useSelector((state) =>
    state.purchase.products.find((product) => product._id === id)
  );
  const item = useSelector((state) =>
    state.purchase.items.find((product) => product._id === id)
  );

  

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSave = (formData) => {
    setTimeout(() => {
      const {
        batchName,
        quantity,
        price,
        openingStock,
        expDate,
        manufDate,
        godown,
        godown_id,
      } = formData;
  
      // Check if the batch already exists
      if (product?.GodownList?.some((e) => e.batch === batchName && e.godown_id === godown_id)) {
        const userConfirmed = window.confirm(
          "Batch already added. It will be overwritten. Do you want to proceed?"
        );
  
        // If the user cancels, exit the function
        if (!userConfirmed) {
          return;
        }
      }
  
      setLoading(true);
  
      const newBatch = {
        balance_stock: Number(openingStock),
        batch: batchName,
        mfgdt: manufDate.toISOString().split("T")[0],
        expdt: expDate.toISOString().split("T")[0],
        selectedPriceRate: Number(price),
        count: Number(quantity),
        individualTotal: Number(price * quantity),
        added: true,
        newBatch: true,
      };
  
      if (godown) newBatch.godown = godown;
      if (godown_id) newBatch.godown_id = godown_id;
  
      // Apply taxes if applicable
      if (product?.igst !== "" && product?.igst !== undefined) {
        const totalAmount = Number(price * quantity);
        const taxAmount = (parseFloat(product?.igst) / 100) * totalAmount;
        const totalAmountWithTax = totalAmount + taxAmount;
        newBatch.individualTotal = totalAmountWithTax;
      }
     
  
      const data = {
        _id: id,
        GodownList: [newBatch],
      };
  
      formData.price = Number(formData.price);
      formData.openingStock = Number(formData.openingStock);
      formData.quantity = Number(formData.quantity);
  
      dispatch(addBatch(data));
      setLoading(false);
      navigate(-1);
    }, 1000);
  };
  

  return (
    <div className="relative">
      <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoIosArrowRoundBack
          onClick={() => {
            navigate(-1);
          }}
          className="text-3xl text-white cursor-pointer"
        />
        <p>Add Batch</p>
      </div>

      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <figure className="w-[60px] h-[60px] rounded-full border-2 border-solid border-primaryColor flex items-center justify-center">
            <HashLoader color="#6056ec" size={30} speedMultiplier={1.6} />
          </figure>
        </div>
      )}

      <BathAddingForm onSave={onSave} />
    </div>
  );
};

export default AddbatchInPurchase;
