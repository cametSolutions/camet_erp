/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import { MdModeEditOutline } from "react-icons/md";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { changeIgstAndDiscount ,changeGodownCount} from "../../../slices/purchase";
import { toast } from "react-toastify";
import { Button, Modal } from "flowbite-react";
import { Decimal } from "decimal.js";


function EditItemPurchase() {
  const [item, setItem] = useState([]);
  const [newPrice, setNewPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [hsn, setHsn] = useState([]);
  const [igst, setIgst] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState("amount");
  const [taxExclusivePrice, setTaxExclusivePrice] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0); // State for discount amount
  const [discountPercentage, setDiscountPercentage] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [godown, setGodown] = useState([]);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const ItemsFromRedux = useSelector((state) => state.purchase.items);
  const selectedItem = ItemsFromRedux.filter((el) => el._id === id);
  console.log(selectedItem);
  console.log(godown);
  const selectedPriceLevel = useSelector(
    (state) => state.purchase?.selectedPriceLevel
  );
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );





  useEffect(() => {
    const fetchHsn = async () => {
      try {
        const res = await api.get(`/api/sUsers/fetchHsn/${orgId}`, {
          withCredentials: true,
        });

        setHsn(res.data.data);

        // console.log(res.data.organizationData);
      } catch (error) {
        console.log(error);
      }
    };
    fetchHsn();
  }, [orgId]);

  useEffect(() => {
    if (selectedPriceLevel === "" || selectedPriceLevel === undefined) {
      navigate("/sUsers/addItemPurchase");
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

    // console.log(newItem);
    // if (selectedRedux === "stockTransferSecondary") {
    //   dispatch(updateItemStockTransfer(newItem));
    // } else {
      dispatch(updateItem(newItem));
     
    // }
    navigate(-1);
  };
  

  return (
<EditItemForm submitHandler={submitHandler} ItemsFromRedux={ItemsFromRedux} from="purchase"/>
  );
}

export default EditItemSalesSecondary;
