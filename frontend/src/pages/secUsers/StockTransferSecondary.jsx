/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

import {
  removeAll,
  removeGodown,
  removeItem,
  removeGodownOrBatch,
  changeDate,
  AddFinalAmount,
} from "../../../slices/stockTransferSecondary";

import HeaderTile from "../voucher/voucherCreation/HeaderTile";
import AddItemTile from "../voucher/voucherCreation/AddItemTile";
import AddGodown from "../voucher/voucherCreation/AddGodownTile";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../voucher/voucherCreation/FooterButton";
function StockTransferSecondary() {
  const [stockTransferNumber, setStockTransferNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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

  useEffect(() => {
    const fetchConfigurationNumber = async () => {
      setLoading(true);

      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationNumber/${orgId}/stockTransfer`,

          {
            withCredentials: true,
          }
        );

        if (res.data.message === "default") {
          const { configurationNumber } = res.data;
          setStockTransferNumber(configurationNumber);
          return;
        }

        const { configDetails, configurationNumber } = res.data;

        if (configDetails) {
          const { widthOfNumericalPart, prefixDetails, suffixDetails } =
            configDetails;
          const newOrderNumber = configurationNumber.toString();

          const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
          // console.log(padedNumber);
          const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
            .filter(Boolean)
            .join("-");
          // console.log(finalOrderNumber);
          setStockTransferNumber(finalOrderNumber);
        } else {
          setStockTransferNumber(stockTransferNumber);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfigurationNumber();
  }, []);

  // console.log(stockTransferNumber);

  const [subTotal, setSubTotal] = useState(0);
  const dispatch = useDispatch();

  const selectedGodown = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown
  );

  const selectedGodownId = useSelector(
    (state) => state.stockTransferSecondary.selectedGodown.godown_id
  );
  // console.log(selectedGodownId);
  const items = useSelector((state) => state.stockTransferSecondary.items);

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    setSubTotal(subTotal);
  }, [items]);

  const totalAmount = parseFloat(subTotal);

  // console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    if (!selectedGodown) {
      toast.error("Select a Godown first");
      return;
    }
    navigate("/sUsers/addItemStockTransfer");
  };

  const submitHandler = async () => {
    setSubmitLoading(true);
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
      stockTransferNumber,
    };

    try {
      const res = await api.post(`/api/sUsers/createStockTransfer`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      // console.log(res.data.data);

      toast.success(res.data.message);
      navigate(`/sUsers/StockTransferDetails/${res.data.data._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-14 sm:mb-0">
      <div className="flex-1 bg-slate-100 h -screen ">
        <TitleDiv
          title="Stock Transfer"
          from={`/sUsers/selectVouchers`}
          loading={loading || submitLoading}
        />

        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>
          {/* invoiec date */}
          <HeaderTile
            title={"Stock Transfer"}
            number={stockTransferNumber}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dispatch={dispatch}
            changeDate={changeDate}
            submitHandler={submitHandler}
            removeAll={removeAll}
            tab="add"
            loading={submitLoading}
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
              <p className="font-bold text-lg">
                ₹ {totalAmount.toFixed(2) ?? 0}
              </p>
              <p className="text-[9px] text-gray-400">(rounded)</p>
            </div>
          </div>

        
          <FooterButton
            submitHandler={submitHandler}
            tab="add"
            title="Stock Transfer"
            loading={submitLoading || loading}
          />
        </div>
      </div>
    </div>
  );
}

export default StockTransferSecondary;
