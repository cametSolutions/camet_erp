/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  removeParty,
  addAdditionalCharges,
  AddFinalAmount,
  deleteRow,
  removeAll,
  removeAdditionalCharge,
  removeItem,
  removeGodownOrBatch,
  setParty,
  setItem,
  setSelectedPriceLevel,
  setAdditionalCharges,
  setFinalAmount,
  addDespatchDetails,
  changeDate,
} from "../../../slices/purchase";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";
import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";

function EditPurchase() {
  ////////////////////////////////state//////////////////////////////////////////////////////


  const [additional, setAdditional] = useState(false);
  const [purchaseNumber, setPurchaseNumber] = useState("");
  const date = useSelector((state) => state.purchase.date);
  const [selectedDate, setSelectedDate] = useState(date);

  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);
  const [subTotal, setSubTotal] = useState(0);

  const additionalChargesFromRedux = useSelector(
    (state) => state.purchase.additionalCharges
  );
  const [rows, setRows] = useState(
    additionalChargesFromRedux.length > 0
      ? additionalChargesFromRedux
      : additionalChragesFromCompany.length > 0
      ? [
          {
            option: additionalChragesFromCompany[0].name,
            value: "",
            action: "add",
            taxPercentage: additionalChragesFromCompany[0].taxPercentage,
            hsn: additionalChragesFromCompany[0].hsn,
            _id: additionalChragesFromCompany[0]._id,
            finalValue: "",
          },
        ]
      : [] // Fallback to an empty array if additionalChragesFromCompany is also empty
  );

  const [godownname, setGodownname] = useState("");
  const [godownId, setGodownId] = useState("");




  
  ////////////////////////////////redux//////////////////////////////////////////////////////

  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );

  const purchaseDetailsFromRedux = useSelector((state) => state.purchase);

  const {
    party: partyFromRedux,
    items: itemsFromRedux,
    despatchDetails: despatchDetailsFromRedux,
    finalAmount: finalAmountFromRedux,
    heights: heightsFromRedux,
    date: dateFromRedux,

  } = purchaseDetailsFromRedux;

  

  ////////////////////////////////utils//////////////////////////////////////////////////////

  const dispatch = useDispatch();
  const { id } = useParams();

  ////////////////////////////////getting invoice details//////////////////////////////////////////////////////

  useEffect(() => {
    const fetchSalesDetails = async () => {
      try {
        const res = await api.get(`/api/sUsers/getPurchaseDetails/${id}`, {
          params:{
            vanSale:true
          },
          withCredentials: true,
        });

        // console.log(res.data.data);
        const {
          party,
          items,
          priceLevel,
          additionalCharges,
          finalAmount,
          purchaseNumber,
          despatchDetails,
          createdAt,
          // selectedGodownName,
          // selectedGodownId

        } = res.data.data;

        console.log(despatchDetails);

        // // additionalCharges: [ { option: 'option 1', value: '95', action: 'add' } ],
        if (Object.keys(partyFromRedux) == 0) {
          console.log("haii");

          dispatch(setParty(party));
        }

        if (itemsFromRedux.length == 0) {
          dispatch(setItem(items));
        }
        if (finalAmount) {
          dispatch(setFinalAmount(finalAmountFromRedux));
        }

        if (!dateFromRedux) {
          setSelectedDate(createdAt);
          dispatch(changeDate(createdAt));
        }

        if (priceLevelFromRedux == "") {
          dispatch(setSelectedPriceLevel(priceLevel));
        }
        if (additionalChargesFromRedux.length == 0) {
          dispatch(setAdditionalCharges(additionalCharges));
        }

        // dispatch(setFinalAmount(finalAmount));

        if (purchaseNumber) {
          setPurchaseNumber(purchaseNumber);
        }

        if (
          additionalCharges &&
          additionalCharges.length > 0 &&
          additionalChargesFromRedux.length == 0
        ) {
          setAdditional(true);

          const newRows = additionalCharges.map((el) => {
            return {
              option: el.option,
              value: el.value,
              action: el.action,
              _id: el._id,
              taxPercentage: el.taxPercentage,
              hsn: el.hsn,
              finalValue: el.finalValue,
            };
          });
          setRows(newRows);
        }
        // if (Object.keys(heightsFromRedux).length == 0) {
        //   console.log("haii");
        //   //   dispatch(setBatchHeight());
        // }

        

        if (
          Object.keys(despatchDetailsFromRedux).every(
            (key) => despatchDetailsFromRedux[key] == ""
          )
        ) {
          console.log("haii");
          dispatch(addDespatchDetails(despatchDetails));
        }

        // setSelectedGodownId(selectedGodownId || "");
        // setSelectedGodownName(selectedGodownName || "");
      } catch (error) {
        console.log(error);
      }
    };
    fetchSalesDetails();
  }, []);

  ////////////////////////////////getting additional charges//////////////////////////////////////////////////////

  useEffect(() => {
    const getAdditionalChargesIntegrated = async () => {
      try {
        const res = await api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
          withCredentials: true,
        });
        console.log(res.data);
        setAdditionalChragesFromCompany(res.data);
      } catch (error) {
        console.log(error);
        toast.error(error.response.data.message);
      }
    };
    if (type != "self") {
      getAdditionalChargesIntegrated();
    }
  }, []);

  useEffect(() => {
    localStorage.removeItem("scrollPositionAddItemSales");
  }, []);

  useEffect(() => {
    const fetchSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${orgId}`,
          {
            withCredentials: true,
          }
        );

        console.log(res.data.organizationData);
        // setCompany(res.data.organizationData);
        if (type == "self") {
          setAdditionalChragesFromCompany(
            res.data.organizationData.additionalCharges
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSingleOrganization();
  }, [ orgId]);

  useEffect(() => {
    const fetchGodownname = async () => {
      try {
        const godown = await api.get(`/api/sUsers/godownsName/${cmp_id}`, {
          withCredentials: true,
        });
        console.log(godown);
        setGodownname(godown.data?.data?.godownName || "");
        setGodownId(godown.data?.data?.godownId || "");
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    };
    fetchGodownname();
  }, []);


  console.log(rows);

  useEffect(() => {
    if (additionalChargesFromRedux.length > 0) {
      setAdditional(true);
    }
  }, []);

  const handleAddRow = () => {
    const hasEmptyValue = rows.some((row) => row.value === "");
    console.log(hasEmptyValue);
    if (hasEmptyValue) {
      toast.error("Please add a value.");
      return;
    }

    setRows([
      ...rows,
      {
        option: additionalChragesFromCompany[0]?.name,
        value: "",
        action: "add",
        taxPercentage: additionalChragesFromCompany[0]?.taxPercentage,
        hsn: additionalChragesFromCompany[0]?.hsn,
        _id: additionalChragesFromCompany[0]?._id,
        finalValue: "",
      },
    ]);
  };

  const handleLevelChange = (index, id) => {
    const selectedOption = additionalChragesFromCompany.find(
      (option) => option._id === id
    );
    console.log(selectedOption);

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      option: selectedOption?.name,
      taxPercentage: selectedOption?.taxPercentage,
      hsn: selectedOption?.hsn,
      _id: selectedOption?._id,
      finalValue: "",
    };
    console.log(newRows);
    setRows(newRows);

    dispatch(addAdditionalCharges({ index, row: newRows[index] }));
  };

  console.log(rows);

  const handleRateChange = (index, value) => {
    const newRows = [...rows];
    let updatedRow = { ...newRows[index], value: value }; // Create a new object with the updated value

    if (updatedRow.taxPercentage && updatedRow.taxPercentage !== "") {
      const taxAmount =
        (parseFloat(value) * parseFloat(updatedRow.taxPercentage)) / 100;
      updatedRow.finalValue = parseFloat(value) + taxAmount;
    } else {
      updatedRow.finalValue = parseFloat(value);
    }
    newRows[index] = updatedRow;
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
  };

  const actionChange = (index, value) => {
    const newRows = [...rows];
    const updatedRow = { ...newRows[index], action: value }; // Create a new object with the updated action
    newRows[index] = updatedRow; // Replace the old row with the updated one in the newRows array
    setRows(newRows);
    dispatch(addAdditionalCharges({ index, row: updatedRow }));
  };

  const handleDeleteRow = (index) => {
    const newRows = rows.filter((_, i) => i !== index); // Create a new array without the deleted row
    setRows(newRows);
    dispatch(deleteRow(index)); // You need to create an action to handle row deletion in Redux
  };
  const party = useSelector((state) => state.purchase.party);
  const items = useSelector((state) => state.purchase.items);
  const priceLevelFromRedux =
    useSelector((state) => state.purchase.selectedPriceLevel) || "";

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    console.log(subTotal);
    setSubTotal(subTotal);
  }, [items]);

  const additionalChargesTotal = useMemo(() => {
    return rows.reduce((acc, curr) => {
      let value = curr.finalValue === "" ? 0 : parseFloat(curr.finalValue);
      if (curr.action === "add") {
        return acc + value;
      } else if (curr.action === "sub") {
        return acc - value;
      }
      return acc;
    }, 0);
  }, [rows]);

  console.log(additionalChargesTotal);
  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);

  console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    console.log(Object.keys(party).length);
    if (Object.keys(party).length === 0) {
      toast.error("Select a party first");
      return;
    }
    navigate("/sUsers/addItemSales");
  };

  const cancelHandler = () => {
    setAdditional(false);
    dispatch(removeAdditionalCharge());
    setRows([
      {
        option: additionalChragesFromCompany[0].name,
        value: "",
        action: "add",
        taxPercentage: additionalChragesFromCompany[0].taxPercentage,
        hsn: additionalChragesFromCompany[0].hsn,
      },
    ]);
  };

  const submitHandler = async () => {
    console.log("haii");
    if (Object.keys(party).length == 0) {
      console.log("haii");

      toast.error("Add a party first");
      return;
    }
    if (items.length == 0) {
      console.log("haii");

      toast.error("Add at least an item");
      return;
    }

    if (additional) {
      console.log("haii");

      const hasEmptyValue = rows.some((row) => row.value === "");
      if (hasEmptyValue) {
        console.log("haii");

        toast.error("Please add a value.");
        return;
      }
      const hasNagetiveValue = rows.some((row) => parseFloat(row.value) < 0);
      if (hasNagetiveValue) {
        console.log("haii");

        toast.error("Please add a positive value");
        return;
      }
      console.log("haii");
    }

    const lastAmount = totalAmount.toFixed(2);

    dispatch(AddFinalAmount(lastAmount));

    const formData = {
      party,
      items,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orgId,
      purchaseNumber,
      despatchDetails: despatchDetailsFromRedux,
      selectedDate:dateFromRedux||new Date(),
      selectedGodownId:godownId,
      selectedGodownName:godownname,
    };

    // console.log("form data", formData);
    


    

    try {
      const res = await api.post(`/api/sUsers/editPurchase/${id}`, formData, {
        params:{
          vanSale:true
        },
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success(res.data.message);

      navigate(`/sUsers/purchaseDetails/${id}`);
      dispatch(removeAll());
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      console.log(error);
    }
  };



  return (
    <div className="flex relative ">
      <div className="flex-1 bg-slate-100  h-screen   ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={-1}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer md:hidden" />
          </Link>
          <p className="text-white text-lg   font-bold ">Purchase Edit</p>
        </div>

        {/* invoiec date */}

        <HeaderTile
          title={"Purchase"}
          number={purchaseNumber}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          dispatch={dispatch}
          changeDate={changeDate}
          submitHandler={submitHandler}
          removeAll={removeAll}
          tab="edit"
        />

        {/* adding party */}

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartyPurchase"
          linkBillTo="/sUsers/billToPurchase"
        />

        {/* Despatch details */}

        <DespatchDetails tab={"purchase"} />

        {/* adding items */}

      
        <AddItemTile
          items={items}
          handleAddItem={handleAddItem}
          dispatch={dispatch}
          removeItem={removeItem}
          removeGodownOrBatch={removeGodownOrBatch}
          navigate={navigate}
          godownname={godownname}
          subTotal={subTotal}
          type="sale"
          additional={additional}
          cancelHandler={cancelHandler}
          rows={rows}
          handleDeleteRow={handleDeleteRow}
          handleLevelChange={handleLevelChange}
          additionalChragesFromCompany={additionalChragesFromCompany}
          actionChange={actionChange}
          handleRateChange={handleRateChange}
          handleAddRow={handleAddRow}
          setAdditional={setAdditional}
          urlToAddItem="/sUsers/addItemPurchase"
          urlToEditItem="/sUsers/editItemPurchase"
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
              <p>Edit Purchase</p>
            </button>
          </div>
        </div>

      
      </div>

  
    </div>
  );
}

export default EditPurchase;
