/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
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

import HeaderTile from "../voucher/voucherCreation/HeaderTile";
import AddItemTile from "../voucher/voucherCreation/AddItemTile";
import AddGodown from "../voucher/voucherCreation/AddGodownTile";
import TitleDiv from "../../components/common/TitleDiv";
import FooterButton from "../voucher/voucherCreation/FooterButton";
function EditStockTransferSecondary() {
  // const [salesNumber, setSalesNumber] = useState("");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [subTotal, setSubTotal] = useState(0);
  const [stockTransferNumber, setStockTransferNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

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
  const date = useSelector((state) => state.stockTransferSecondary.date);

  useEffect(() => {
    setSelectedDate(new Date(date));
  }, [date]);

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
      setLoading(true);
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
          // date: createdAtFromApi,
          date: dateFromApi,
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
        if (!date && dateFromApi) {
          console.log("dateFromApi:", dateFromApi);
          
          dispatch(changeDate(dateFromApi));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
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
      // salesNumber,
    };

    try {
      const res = await api.post(
        `/api/sUsers/editStockTransfer/${id}`,
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

      console.log(res.data.data._id);

      dispatch(removeAll());
      navigate(`/sUsers/StockTransferDetails/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-14 sm:mb-0">
      <div className="flex-1 bg-slate-100 h -screen ">
        <TitleDiv
          title=" Edit Stock Transfer"
          from={`/sUsers/selectVouchers`}
          loading={loading || submitLoading}
        />
        <div className={`${loading ? "pointer-events-none opacity-70" : ""}`}>

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

        <FooterButton
            submitHandler={submitHandler}
            tab="edit"
            title="Stock Transfer"
            loading={submitLoading || loading}
          />
      </div>
      </div>
    </div>
  );
}

export default EditStockTransferSecondary;
