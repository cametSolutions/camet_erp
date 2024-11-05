/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  removeParty,
  addAdditionalCharges,
  AddFinalAmount,
  deleteRow,
} from "../../../slices/salesSecondary";
import { useDispatch } from "react-redux";

import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { IoIosAddCircle } from "react-icons/io";
import {
  removeAll,
  removeAdditionalCharge,
  removeItem,
  removeGodownOrBatch,
  changeDate,
} from "../../../slices/salesSecondary";
import { IoIosArrowRoundBack } from "react-icons/io";

import DespatchDetails from "../../components/secUsers/DespatchDetails";
import HeaderTile from "../../components/secUsers/main/HeaderTile";
import AddPartyTile from "../../components/secUsers/main/AddPartyTile";
import AddItemTile from "../../components/secUsers/main/AddItemTile";
function SalesSecondary() {
  const [additional, setAdditional] = useState(false);
  // const [godownname, setGodownname] = useState("");

  const [salesNumber, setSalesNumber] = useState("");
  const [additionalChragesFromCompany, setAdditionalChragesFromCompany] =
    useState([]);

  const date = useSelector((state) => state.salesSecondary.date);
  const [selectedDate, setSelectedDate] = useState(new Date());


  const additionalChargesFromRedux = useSelector(
    (state) => state.salesSecondary.additionalCharges
  );
  const orgId = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const type = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg.type
  );
  const despatchDetails = useSelector(
    (state) => state.salesSecondary.despatchDetails
  );

  useEffect(() => {
    const getAdditionalChargesIntegrated = async () => {
      try {
        const res = await api.get(`/api/sUsers/additionalcharges/${cmp_id}`, {
          withCredentials: true,
        });
        // console.log(res.data);
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
    if (date) {
      setSelectedDate(date);
    }
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

        // console.log(res.data.organizationData);
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
  }, [orgId]);

  useEffect(() => {
    const fetchConfigurationNumber = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/fetchConfigurationNumber/${orgId}/sales`,

          {
            withCredentials: true,
          }
        );

        // console.log(res.data);
        if (res.data.message === "default") {
          const { configurationNumber } = res.data;
          setSalesNumber(configurationNumber);
          return;
        }

        const { configDetails, configurationNumber } = res.data;
        // console.log(configDetails);
        // console.log(configurationNumber);

        if (configDetails) {
          const { widthOfNumericalPart, prefixDetails, suffixDetails } =
            configDetails;
          const newOrderNumber = configurationNumber.toString();
          // console.log(newOrderNumber);
          // console.log(widthOfNumericalPart);
          // console.log(prefixDetails);
          // console.log(suffixDetails);

          const padedNumber = newOrderNumber.padStart(widthOfNumericalPart, 0);
          // console.log(padedNumber);
          const finalOrderNumber = [prefixDetails, padedNumber, suffixDetails]
            .filter(Boolean)
            .join("-");
          // console.log(finalOrderNumber);
          setSalesNumber(finalOrderNumber);
        } else {
          setSalesNumber(salesNumber);
        }
      } catch (error) {
        console.log(error);
      }
    };

    // console.log(salesNumber);
    

    fetchConfigurationNumber();
  }, []);

  // useEffect(() => {
  //   const fetchGodownname = async () => {
  //     try {
  //       const godown = await api.get(`/api/sUsers/godownsName/${cmp_id}`, {
  //         withCredentials: true,
  //       });
  //       console.log(godown);
  //       setGodownname(godown.data || "");
  //     } catch (error) {
  //       console.log(error);
  //       toast.error(error.message);
  //     }
  //   };
  //   fetchGodownname();
  // }, []);

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

  useEffect(() => {
    if (additionalChargesFromRedux.length > 0) {
      setAdditional(true);
    }
  }, []);
  const [subTotal, setSubTotal] = useState(0);
  const dispatch = useDispatch();

  const handleAddRow = () => {
    const hasEmptyValue = rows.some((row) => row.value === "");
    // console.log(hasEmptyValue);
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
    // console.log(selectedOption);

    const newRows = [...rows];
    newRows[index] = {
      ...newRows[index],
      option: selectedOption?.name,
      taxPercentage: selectedOption?.taxPercentage,
      hsn: selectedOption?.hsn,
      _id: selectedOption?._id,
      finalValue: "",
    };
    // console.log(newRows);
    setRows(newRows);

    dispatch(addAdditionalCharges({ index, row: newRows[index] }));
  };

  // console.log(rows);

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
  const party = useSelector((state) => state.salesSecondary.party);
  const items = useSelector((state) => state.salesSecondary.items);
  const priceLevelFromRedux =
    useSelector((state) => state.salesSecondary.selectedPriceLevel) || "";
  const batchHeights = useSelector((state) => state.salesSecondary.heights);

  useEffect(() => {
    const subTotal = items.reduce((acc, curr) => {
      return (acc = acc + (parseFloat(curr.total) || 0));
    }, 0);
    setSubTotal(subTotal);

    // console.log ("subTotal", subTotal);
   
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

  // console.log("additionalChargesTotal", additionalChargesTotal);
  const totalAmountNotRounded =
    parseFloat(subTotal) + additionalChargesTotal || parseFloat(subTotal);
  const totalAmount = Math.round(totalAmountNotRounded);

  // console.log(totalAmount);

  const navigate = useNavigate();

  const handleAddItem = () => {
    // console.log(Object.keys(party).length);
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
    // console.log("haii");
    if (Object.keys(party).length == 0) {
      // console.log("haii");

      toast.error("Add a party first");
      return;
    }
    if (items.length == 0) {
      // console.log("haii");

      toast.error("Add at least an item");
      return;
    }

    if (additional) {
      ("haii");

      const hasEmptyValue = rows.some((row) => row.value === "");
      if (hasEmptyValue) {

        toast.error("Please add a value.");
        return;
      }
      const hasNagetiveValue = rows.some((row) => parseFloat(row.value) < 0);
      if (hasNagetiveValue) {

        toast.error("Please add a positive value");
        return;
      }
    }

    const lastAmount = totalAmount.toFixed(2);

    dispatch(AddFinalAmount(lastAmount));

    const formData = {
      party,
      items,
      despatchDetails,
      priceLevelFromRedux,
      additionalChargesFromRedux,
      lastAmount,
      orgId,
      salesNumber,
      batchHeights,
      selectedDate,
    };

    // console.log(formData);

    try {
      const res = await api.post(
        `/api/sUsers/createSale?vanSale=${false}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // console.log(res.data);
      toast.success(res.data.message);

      navigate(`/sUsers/salesDetails/${res.data.data._id}`);
      dispatch(removeAll());
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  // console.log(items);

  return (
    <div className="">
      <div className="flex-1 bg-slate-100 h -screen ">
        <div className="bg-[#012a4a] shadow-lg px-4 py-3 pb-3 flex  items-center gap-2 sticky top-0 z-50  ">
          {/* <IoReorderThreeSharp
            onClick={handleToggleSidebar}
            className="block md:hidden text-white text-3xl"
          /> */}
          <Link to={"/sUsers/selectVouchers"}>
            <IoIosArrowRoundBack className="text-3xl text-white cursor-pointer" />
          </Link>
          <p className="text-white text-lg   font-bold ">Sales</p>
        </div>

        {/* invoiec date */}
        <HeaderTile
          title={"Sale"}
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

        <AddPartyTile
          party={party}
          dispatch={dispatch}
          removeParty={removeParty}
          link="/sUsers/searchPartySales"
          linkBillTo="/sUsers/billToSales"
        />

        {/* Despatch details */}

        <DespatchDetails tab={"sale"} />

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
          urlToAddItem="/sUsers/addItemSales"
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
              <p>Generate Sale</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesSecondary;
