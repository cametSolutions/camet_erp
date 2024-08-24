import { IoIosArrowRoundBack } from "react-icons/io";
import BathAddingForm from "../../components/secUsers/main/Forms/BathAddingForm";
import { useNavigate, useParams } from "react-router-dom";
// import {} from "../../../slices/purchase"
import { addBatch } from "../../../slices/purchase";
import { useDispatch, useSelector } from "react-redux";

const AddbatchInPurchase = () => {
  const { id } = useParams();
  console.log(id);

  const product = useSelector((state) =>
    state.purchase.products.find((product) => product._id === id)
  );

  console.log(product);

  const dispatch = useDispatch();
  const onSave = (formData) => {
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

    const newBatch = {
      balance_stock: Number(openingStock),

      batch: batchName,
      mfgdt: manufDate.toISOString().split("T")[0],
      expdt: expDate.toISOString().split("T")[0],
      selectedPriceRate: Number(price),
      count: Number(quantity),
      individualTotal: Number(price * quantity),
      added: true,
    };

    // Conditionally add godown and godown_id if they are present
    if (godown) newBatch.godown = godown;
    if (godown_id) newBatch.godown_id = godown_id;

    ////add tax if igst is present in product
    if (product?.igst !== "" || product?.igst !== undefined) {
      const totalAmount = Number(price * quantity);
      const taxAmount = (parseFloat(product?.igst) / 100) * totalAmount;
      const totalAmountWithTax = totalAmount + taxAmount;

      // add it in the newBatch
      newBatch.individualTotal = totalAmountWithTax;
    }

    const data = {
      _id: id,
      GodownList: [newBatch],
    };
    formData.price = Number(formData.price);
    formData.openingStock = Number(formData.openingStock);
    formData.quantity = Number(formData.quantity);

    console.log(data);
    dispatch(addBatch(data));
    navigate(-1);
  };

  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoIosArrowRoundBack
          onClick={() => {
            navigate(-1);
          }}
          className="text-3xl text-white cursor-pointer"
        />
        <p>Add Batch</p>
      </div>

      <BathAddingForm onSave={onSave} />
    </div>
  );
};

export default AddbatchInPurchase;
