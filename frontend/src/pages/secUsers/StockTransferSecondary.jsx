/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";

import {
  removeAll,
  removeGodown,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  AddFinalAmount
} from "../../../slices/stockTransferSecondary";
import { IoIosArrowRoundBack } from "react-icons/io";

import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";
import AddGodown from "../../components/secUsers/AddGodown";
function StockTransferSecondary() {

  const [salesNumber, setSalesNumber] = useState("");


  const date = useSelector((state) => state.stockTransferSecondary.date);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );



  useEffect(() => {
    // localStorage.removeItem("scrollPositionAddItemSales");
    if (date) {
      setSelectedDate(date);
    }
  }, []);


  // useEffect(() => {
  //   const fetchConfigurationNumber = async () => {
  //     try {
  //       const res = await api.get(
  //         `/api/sUsers/fetchConfigurationNumber/${orgId}/sales`,

  //         {
  //           withCredentials: true,
  //         }
  //       );

  //       console.log(res.data);
  //       if (res.data.message === "default") {
  //         const { configurationNumber } = res.data;
  //         setSalesNumber(configurationNumber);
  //         return;
  //       }

  //       const { configDetails, configurationNumber } = res.data;
  //       console.log(configDetails);
  //       console.log(configurationNumber);

  //       if (configDetails) {
  //         const { widthOfNumericalPart, prefixDetails, suffixDetails } =
  //           configDetails;
  //         const newOrderNumber = configurationNumber.toString();
  //         // console.log(newOrderNumber);
  //         // console.log(widthOfNumericalPart);
  //         // console.log(prefixDetails);
  //         // console.log(suffixDetails);

  //         const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
  //         // console.log(padedNumber);
  //         const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
  //           .filter(Boolean)
  //           .join("-");
  //         // console.log(finalOrderNumber);
  //         setSalesNumber(finalOrderNumber);
  //       } else {
  //         setSalesNumber(salesNumber);
  //       }
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   fetchConfigurationNumber();
  // }, []);





  const [subTotal, setSubTotal] = useState(0);
  const dispatch = useDispatch();



  const selectedGodown = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown
  );


  const selectedGodownId = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown_id
  );
  console.log(selectedGodownId);
  const items = useSelector((state) => state.stockTransferSecondary.items);

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    setSubTotal(subTotal);
  }, [items]);




  const totalAmount = parseFloat(subTotal)

  console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    if (!selectedGodown) {
      toast.error("Select a Godown first");
      return;
    }
    navigate("/sUsers/addItemStockTransfer");
  };


  const submitHandler = async () => {
    console.log("haii");
  
    if (items.length == 0) {
      console.log("haii");

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

    console.log(formData);

    try {
      const res = await api.post(
        `/api/sUsers/createStockTransfer`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/salesDetails/${res.data.data._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  console.log(items);

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
          <p className="text-white text-lg   font-bold ">Stock Transfer</p>
        </div>

        {/* invoiec date */}
        <HeaderTile
          title={"stockTransfer"}
          number={salesNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="add"
        />

        {/* adding party */}

        <AddGodown
          selectedGodown={selectedGodown}
          dispatch={dispatch}
          removeGodown={removeGodown}
          link="/sUsers/searchGodown"
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
          urlToEditItem="/sUsers/editItemSales"
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

export default StockTransferSecondary;
