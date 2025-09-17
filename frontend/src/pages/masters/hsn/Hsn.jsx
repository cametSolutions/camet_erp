/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";
import HsnForm from "../../../components/common/Forms/HsnForm";
import { useLocation } from "react-router-dom";

// import "./hsn.css";

function Hsn() {
  const [tab, setTab] = useState("onValue");
  const [hsn, setHsn] = useState("");
  const [description, setDescription] = useState("");
  const [taxabilityType, setTaxabilityType] = useState("");
  const [igstRate, setIgstRate] = useState("");
  const [cgstRate, setCgstRate] = useState("");
  const [sgstUtgstRate, setSgstUtgstRate] = useState("");
  const [onValue, setOnValue] = useState("");
  const [onQuantity, setOnQuantity] = useState("");

  const [isRevisedChargeApplicable, setIsRevisedChargeApplicable] =
    useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  //   table    ///////////////////////////

  const [rows, setRows] = useState([
    {
      greaterThan: "0",
      upto: "",
      taxabilityType: "",
      igstRate: "",
      cgstRate: "",
      sgstUtgstRate: "",
      basedOnValue: "",
      basedOnQuantity: "",
    },
  ]);

  const handleAddRow = () => {
    let hasEmptyField = false;

    rows.forEach((row) => {
      if (row.taxabilityType === "") {
        // toast.error("Select taxability type");
        hasEmptyField = true; // Set the flag to true to indicate an error
        return; // Exit the loop if the condition is met
      }
      if (row.taxabilityType === "Taxable") {
        const nonEmptyFields = Object.keys(row).filter((key) => {
          return key !== "basedOnValue" && key !== "basedOnQuantity";
        });

        const isEmpty = nonEmptyFields.some((key) => row[key] === "");

        if (isEmpty) {
          hasEmptyField = true;
          return; // Exit the loop if the condition is met
        }
      }
    });

    if (hasEmptyField) {
      toast.error("All required fields must be filled");
      return; // Exit the function if there's an error
    }

    setRows([
      ...rows,
      {
        greaterThan: rows[rows.length - 1].upto,
        upto: "",
        taxabilityType: "",
        igstRate: "",
        cgstRate: "",
        sgstUtgstRate: "",
        basedOnValue: "",
        basedOnQuantity: "",
      },
    ]);
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newRows = [...rows];
    newRows[index][name] = value;

    // Automatically calculate CGST and SGST/UTGST rates if taxability type is Taxable
    if (name === "igstRate" && newRows[index].taxabilityType === "Taxable") {
      newRows[index].cgstRate = (parseFloat(value) / 2).toString();
      newRows[index].sgstUtgstRate = (parseFloat(value) / 2).toString();
    }

    setRows(newRows);
  };

  const isExemptOrNilRatedOrNonGST = (taxabilityType) => {
    return (
      taxabilityType === "Exempt" ||
      taxabilityType === "Nil Rated" ||
      taxabilityType === "Non GST" ||
      taxabilityType === ""
    );
  };

  const handleDeleteRow = () => {
    if (rows.length > 1) {
      setRows(rows.slice(0, -1)); // Remove the last element from the rows array
    }
  };

  //   table    ///////////////////////////

  useEffect(() => {
    if (igstRate !== "") {
      setCgstRate(parseFloat(igstRate / 2).toString());
      setSgstUtgstRate(parseFloat(igstRate / 2).toString());
    }
  }, [igstRate]);

  const [checkedValue, setCheckedValue] = useState("onValue");
  const handleChangeCheck = (value) => {
    setCheckedValue(value);
  };

  const handleRevisedChargeChange = (e) => {
    setIsRevisedChargeApplicable(e.target.checked);
  };

  let cpm_id = useSelector(
    (state) => state?.secSelectedOrganization?.secSelectedOrg?._id
  );

  console.log(location.state);

  const submitHandler = async () => {
    if (tab == "onValue") {
      if (
        [hsn, description, taxabilityType].some((field) => field.trim() === "")
      ) {
        toast.error("All fields are required");
        return;
      }

      if (taxabilityType === "taxable") {
        if (igstRate === "" || cgstRate === "" || sgstUtgstRate === "") {
          toast.error("All fields are required");
          return;
        }
      }
    } else {
      if ([hsn, description].some((field) => field.trim() === "")) {
        toast.error("All fields are required");
        return;
      }
      if (rows.length === 1) {
        if (rows[0].upto === "") {
          toast.error("Upto fied must be filled");
          return;
        }
        if (rows[0].taxabilityType === "") {
          toast.error("Taxability Type must be filled");
          return;
        }
        if (rows[0].taxabilityType === "Taxable") {
          if (rows[0].igstRate === "") {
            toast.error("IgstRate Type must be filled");
            return;
          }

          if (rows[0].cgstRate === "") {
            toast.error("CgstRate Type must be filled");
            return;
          }

          if (rows[0].sgstUtgstRate === "") {
            toast.error("sgstUtgstRate Type must be filled");
            return;
          }
        }
      } else {
        const lastRow = rows[rows.length - 1];

        if (lastRow.taxabilityType === "") {
          toast.error("Taxability Type must be filled");
          return;
        }

        // console.log(lastRow.taxabilityType);

        if (lastRow.taxabilityType === "Taxable") {
          if (lastRow.igstRate === "") {
            toast.error("IgstRate Type must be filled");
            return;
          }

          if (lastRow.cgstRate === "") {
            toast.error("CgstRate Type must be filled");
            return;
          }

          if (lastRow.sgstUtgstRate === "") {
            toast.error("sgstUtgstRate Type must be filled");
            return;
          }
        }
      }
    }

    let formData;

    if (tab == "onValue") {
      formData = {
        cpm_id,
        hsn,
        description,
        tab,
        taxabilityType,
        igstRate,
        cgstRate,
        sgstUtgstRate,
        onValue,
        onQuantity,
        isRevisedChargeApplicable,
      };
    } else {
      formData = {
        cpm_id,
        hsn,
        description,
        tab,
        rows,
        isRevisedChargeApplicable,
      };
    }

    //     console.log(formData);

    try {
      const res = await api.post(`/api/sUsers/addHsn`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      toast.success(res.data.message);
      navigate(-1, {
        state: {
          from: location.state?.from || "/sUsers/hsn",
          data: location.state?.data || {},
        },
        replace: true,
      });

      // Resetting individual state variables
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <HsnForm
      navigate={navigate}
      hsn={hsn}
      setHsn={setHsn}
      description={description}
      setDescription={setDescription}
      tab={tab}
      setTab={setTab}
      taxabilityType={taxabilityType}
      setTaxabilityType={setTaxabilityType}
      igstRate={igstRate}
      setIgstRate={setIgstRate}
      cgstRate={cgstRate}
      setCgstRate={setCgstRate}
      sgstUtgstRate={sgstUtgstRate}
      setSgstUtgstRate={setSgstUtgstRate}
      onValue={onValue}
      setOnValue={setOnValue}
      onQuantity={onQuantity}
      setOnQuantity={setOnQuantity}
      isRevisedChargeApplicable={isRevisedChargeApplicable}
      rows={rows}
      handleDeleteRow={handleDeleteRow}
      handleAddRow={handleAddRow}
      submitHandler={submitHandler}
      checkedValue={checkedValue}
      handleChangeCheck={handleChangeCheck}
      handleRevisedChargeChange={handleRevisedChargeChange}
      isExemptOrNilRatedOrNonGST={isExemptOrNilRatedOrNonGST}
      handleChange={handleChange}
    />
  );
}

export default Hsn;
