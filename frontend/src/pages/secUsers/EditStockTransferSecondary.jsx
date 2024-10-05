/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";
import { useParams } from "react-router-dom";

import {
  removeAll,
  removeGodown,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  AddFinalAmount,
  addSelectedGodown,
  addAllItems,
} from "../../../slices/stockTransferSecondary";
import { IoIosArrowRoundBack } from "react-icons/io";

import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";
import AddGodown from "../../components/secUsers/AddGodown";
function EditStockTransferSecondary() {
  // const [salesNumber, setSalesNumber] = useState("");

  const date = useSelector((state) => state.stockTransferSecondary.date);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [subTotal, setSubTotal] = useState(0);
  const [stockTransferNumber, setStockTransferNumber] = useState("");


  const selectedGodown = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown
  );

  const selectedGodownId = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown_id
  );
  const items = useSelector((state) => state.stockTransferSecondary.items);
  const finalAmount = useSelector(
    (state) => state.stockTransferSecondary.finalAmount
  );
  const createdAt = useSelector((state) => state.stockTransferSecondary.date);


  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    // localStorage.removeItem("scrollPositionAddItemSales");
    if (date) {
      setSelectedDate(date);
    }
  }, []);

  ////////////////////////////////getting transfer details//////////////////////////////////////////////////////

  useEffect(() => {
    const fetchSalesDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getStockTransferDetails/${id}`, {
          withCredentials: true,
        });

        console.log(res.data.data);
        

        const {
          selectedGodown: selectedGodownFromAPi,
          selectedGodownId: selectedGodownIdFromApi,
          items: apiItems,
          finalAmount: finalAmountFromApi,
          createdAt: createdAtFromApi,
          stockTransferNumber: stockTransferNumberFromApi,
        } = res.data.data;

        setStockTransferNumber(stockTransferNumberFromApi);


        if (
          selectedGodown === "" &&
          selectedGodownId === "" &&
          selectedGodownIdFromApi &&
          selectedGodownFromAPi
        ) {
          const data = {
            id: selectedGodownIdFromApi,
            godown: selectedGodownFromAPi,
          };
          dispatch(addSelectedGodown(data));
        }
        if (items.length === 0 && apiItems.length > 0) {
          dispatch(addAllItems(apiItems));
        }

        if (!finalAmount && finalAmountFromApi) {
          dispatch(AddFinalAmount(finalAmountFromApi));
        }
        if (!createdAt && createdAtFromApi) {
          dispatch(changeDate(createdAtFromApi));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSalesDetails();
  }, []);


  

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    setSubTotal(subTotal);
  }, [items]);

  const totalAmount = parseFloat(subTotal);


  const navigate = useNavigate();

  const handleAddItem = () => {
    if (!selectedGodown) {
      toast.error("Select a Godown first");
      return;
    }
    navigate("/sUsers/addItemStockTransfer");
  };

  const submitHandler = async () => {
    if (items.length == 0) {
      toast.error("Add at least an item");
      return;
    }

    const lastAmount = totalAmount.toFixed(2);

    dispatch(AddFinalAmount(lastAmount));

    const formData = {
      selectedDate,
      orgId,
      selectedGodown,
      selectedGodownId,
      items,
      lastAmount,
      // salesNumber,
    };


    try {
      const res = await api.post(`/api/sUsers/editStockTransfer/${id}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      console.log(res.data);
      toast.success(res.data.message);

      console.log(res.data.data._id);

      dispatch(removeAll());
      navigate(`/sUsers/StockTransferDetails/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  

  return (
    <div className="">
      <div className="flex-1 bg-slate-100 h -screen ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={"/sUsers/dashboard"}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
          </Link>
          <p className="text-white text-lg   font-bold ">Edit Stock Transfer</p>
        </div>

        {/* invoiec date */}
        <HeaderTile
          title={"Transfer"}
          number={stockTransferNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="edit"
        />

        {/* adding party */}

        <AddGodown
          selectedGodown={selectedGodown}
          dispatch={dispatch}
          removeGodown={removeGodown}
          link="/sUsers/searchGodown"
          tab={"edit"}
        />

        {/* adding items */}

        <AddItemTile
          items={items}
          handleAddItem={handleAddItem}
          dispatch={dispatch}
          removeItem={removeItem}
          removeGodownOrBatch={removeGodownOrBatch}
          navigate={navigate}
          godownname={""}
          subTotal={subTotal}
          type="stockTransfer"
          urlToAddItem="/sUsers/addItemStockTransfer"
          urlToEditItem="/sUsers/editItemstockTransfer"
        />

        <div className="flex justify-between bg-white mt-2 p-3">
          <p className="font-bold text-lg">Total Amount</p>
          <div className="flex flex-col items-center">
            <p className="font-bold text-lg">₹ {totalAmount.toFixed(2) ?? 0}</p>
            <p className="text-[9px] text-gray-400">(rounded)</p>
          </div>
        </div>

        <div className=" md:hidden ">
          <div className="flex justify-center overflow-hidden w-full">
            <button
              onClick={submitHandler}
              className="fixed bottom-0 text-white bg-violet-700  w-full  p-2 py-4 flex items-center justify-center gap-2 hover_scale cursor-pointer "
            >
              <IoIosAddCircle className="text-2xl" />
              <p>Create Stock Transfer</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditStockTransferSecondary;
