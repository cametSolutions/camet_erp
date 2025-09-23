import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { IoReorderThreeSharp } from "react-icons/io5";

import { useSidebar } from "../../layout/Layout";
import ConfigurationForm from "../../components/common/Forms/ConfigurationForm";
import { setSecSelectedOrganization } from "../../../slices/secSelectedOrgSlice";
import { useDispatch } from "react-redux";

function OrderConfigurationsSecondary() {
  const [bank, setBank] = useState("");
  const [company, setCompany] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [termsInput, setTermsInput] = useState("");
  const [termsList, setTermsList] = useState([]);
  const [enableBillToShipTo, setEnableBillToShipTo] = useState(true);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [tab, setTab] = useState("terms");
  const [despatchDetails, setDespatchDetails] = useState({
    challanNo: "",
    containerNo: "",
    despatchThrough: "",
    destination: "",
    vehicleNo: "",
    orderNo: "",
    termsOfPay: "",
    termsOfDelivery: "",
  });

  const org = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg
  );
  const { handleToggleSidebar } = useSidebar();
  const dispatch = useDispatch();

  useEffect(() => {
    const getSingleOrganization = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/getSingleOrganization/${org._id}`,
          {
            withCredentials: true,
          }
        );
        const company = res?.data?.organizationData;
        setCompany(company);

        if (company && company.configurations.length > 0) {
          const {
            bank,
            terms,
            enableBillToShipTo,
            despatchDetails,
            taxInclusive,
          } = company.configurations[0];

          if (despatchDetails) {
            setDespatchDetails(despatchDetails);
          }

          if (bank) {
            setSelectedBank(bank._id);
          }

          if (taxInclusive) {
            setTaxInclusive(taxInclusive);
          }
          setEnableBillToShipTo(enableBillToShipTo);
          if (terms) {
            const termsInput = terms.join("\n");
            setTermsInput(termsInput);
            setTermsList(terms);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    getSingleOrganization();
  }, [org]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const res = await api.get(`/api/sUsers/fetchBanks/${org._id}`, {
          withCredentials: true,
        });

        setBank(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchBank();
  }, []);

  const handleTermsChange = (e) => {
    const value = e.target.value;
    setTermsInput(value);

    // Split the input into terms based on the character limit
    const terms = value.match(/.{1,1000}/g) || [];
    setTermsList(terms);
  };

  const updateDespatchDetails = (newDetails) => {
    setDespatchDetails(newDetails);
  };

  const validateDespatchDetails = (details) => {
    let isValid = true; // Assume validation passes initially

    Object.keys(details).forEach((key) => {
      if (details[key]) {
        // Check if the field is filled
        if (typeof details[key] === "string" && details[key].trim() !== "") {
          if (details[key].length > 20) {
            toast.error(`Field ${key} exceeds maximum length of 20 characters`);
            isValid = false; // Validation failed
          }
        } else {
          toast.error(`Field ${key} should not contain empty spaces`);
          isValid = false; // Validation failed
        }
      }
    });

    return isValid; // Return the validation result
  };

  const submitHandler = async () => {
    // if (!selectedBank && termsList.length == 0) {
    //   toast.error("At least configure one field");
    //   return;
    // }

    const continueWithSubmission = validateDespatchDetails(despatchDetails);

    if (!continueWithSubmission) {
      return; // Do not proceed with submission if validation failed
    }

    console.log(taxInclusive)

    const formData = {
      selectedBank,
      termsList,
      enableBillToShipTo,
      despatchDetails,
      taxInclusive,
    };

    console.log(formData);

    try {
      const res = await api.post(
        `/api/sUsers/addconfigurations/${org._id}`,
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
      dispatch(setSecSelectedOrganization(res.data.data));
      navigate("/sUsers/dashboard");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className=" ">
      <div className="bg-[#201450] sticky top-0 p-3 z-100 text-white text-lg font-bold flex items-center gap-3 z-20">
        <IoReorderThreeSharp
          onClick={handleToggleSidebar}
          className="block md:hidden text-3xl cursor-pointer"
        />
        <p className="">Order Configurations</p>
      </div>

      <ConfigurationForm
        org={org}
        submitHandler={submitHandler}
        setSelectedBank={setSelectedBank}
        selectedBank={selectedBank}
        bank={bank}
        enableBillToShipTo={enableBillToShipTo}
        setEnableBillToShipTo={setEnableBillToShipTo}
        tab={tab}
        setTab={setTab}
        handleTermsChange={handleTermsChange}
        termsInput={termsInput}
        despatchDetails={despatchDetails}
        updateDespatchDetails={updateDespatchDetails}
        termsList={termsList}
        taxInclusive={taxInclusive}
        setTaxInclusive={setTaxInclusive}
      />
    </div>
  );
}

export default OrderConfigurationsSecondary;
