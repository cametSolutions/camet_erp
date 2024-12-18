import TitleDiv from "../../../../components/common/TitleDiv";
import SettingsCard from "../../../../components/common/SettingsCard";
import { FiUsers, FiSave, FiPercent, FiInfo, FiFileText } from "react-icons/fi";
import { GiBank } from "react-icons/gi";
import { RiStockFill } from "react-icons/ri";
import { MdOutlineAttachMoney } from "react-icons/md";
import useFetch from "../../../../customHook/useFetch";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../../../../api/api";
import { toast } from "react-toastify";
import { updateConfiguration } from "../../../../../slices/secSelectedOrgSlice";
import { useDispatch } from "react-redux";
import { MdTitle } from "react-icons/md";
import PrintTitleModal from "./PrintTitleModal";
import { FaDollarSign } from "react-icons/fa";


const SaleOrderPrintConfiguration = () => {
  const [settings, setSettings] = useState([]);
  const [printTitleModal, setPrintTitleModal] = useState(false);
  const dispatch = useDispatch();

  ///// redux and api call
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );
  const {
    data: apiData,
    loading,
    refreshHook,
  } = useFetch(
    `/api/sUsers/getPrintingConfiguration/${cmp_id}?voucher=saleOrder`
  );
  const data = apiData?.data;

  useEffect(() => {
    if (data) {
      setSettings([
        {
          title: "Print Title",
          description: "Update ",
          icon: <MdTitle />,
          to: "/sUsers/EnableCompanyDetails",
          active: true,
          toggle: false,
          modal: true,
          dbField: "showCompanyDetails",
        },
        {
          title: "Enable Company Details",
          description: "Enable company details",
          icon: <FiSave />,
          to: "/sUsers/EnableCompanyDetails",
          active: true,
          toggle: true,
          toggleValue: data.showCompanyDetails,
          dbField: "showCompanyDetails",
        },
        {
          title: "Enable Discount Column",  
          description: "Enable discount for parties",
          icon: <FiPercent />,
          to: "/sUsers/enableDiscount",
          active: true,
          toggle: true,
          toggleValue: data.showDiscount,
          dbField: "showDiscount",
        },
        {
          title: "Enable Discount Amount",
          description:"Show discount amount and hide percentage in the invoice",
          icon: <FaDollarSign />,
          to: "/sUsers/enableDiscount",
          active: data?.showDiscount,
          toggle: true,
          toggleValue: data.showDiscountAmount,
          dbField: "showDiscountAmount",
        },
        {
          title: "Enable HSN",
          description: "Enable HSN for parties",
          icon: <FiInfo />,
          to: "/sUsers/enableHSN",
          active: true,
          toggle: true,
          toggleValue: data.showHsn,
          dbField: "showHsn",
        },
        {
          title: "Enable Tax Percentage",
          description: "Enable tax percentage for parties",
          icon: <FiFileText />,
          to: "/sUsers/enableTaxPercentage",
          active: true,
          toggle: true,
          toggleValue: data.showTaxPercentage,
          dbField: "showTaxPercentage",
        },
        {
          title: "Enable Incl. Tax Rate",
          description:
            "Enable Inclusive tax rate, This will hide tax amount column in invoice",
          icon: <RiStockFill />,
          to: "/sUsers/EnableStockWiseTaxAmount",
          active: true,
          toggle: true,
          toggleValue: data.showInclTaxRate,
          dbField: "showInclTaxRate",
        },
        {
          title: "Enable Tax Analysis",
          description: "Enable tax analysis for parties",
          icon: <FiFileText />,
          to: "/sUsers/enableTaxAnalysis",
          active: true,
          toggle: true,
          toggleValue: data.showTaxAnalysis,
          dbField: "showTaxAnalysis",
        },
        {
          title: "Enable Teams & Conditions",
          description: "Enable teams & conditions for parties",
          icon: <FiUsers />,
          to: "/sUsers/enableTeamsConditions",
          active: true,
          toggle: true,
          toggleValue: data.showTeamsAndConditions,
          dbField: "showTeamsAndConditions",
        },
        {
          title: "Enable Bank Details",
          description: "Enable bank details for parties",
          icon: <GiBank />,
          to: "/sUsers/enableBankDetails",
          active: true,
          toggle: true,
          toggleValue: data.showBankDetails,
          dbField: "showBankDetails",
        },
        {
          title: "Enable Tax Amount",
          description: "Enable tax amount",
          icon: <MdOutlineAttachMoney />,
          to: "/sUsers/EnableTaxAmount",
          active: true,
          toggle: true,
          toggleValue: data.showTaxAmount,
          dbField: "showTaxAmount",
        },
      ]);
    }
  }, [data]);

  const handleToggleChange = async (newState) => {
    const apiData = {
      ...newState,
      type: "printConfiguration",
      voucher: "saleOrder",
    };

    try {
      const res = await api.put(
        `/api/sUsers/updateConfiguration/${cmp_id}`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(updateConfiguration(res?.data?.data));
      localStorage.setItem("secOrg", JSON.stringify(res.data.data));

      refreshHook();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  const savePrintTitle = async (value) => {
    const apiData = {
      input: "printTitle",
      value,
      type: "printConfiguration",
      voucher: "saleOrder",
    };

    try {
      const res = await api.put(
        `/api/sUsers/updateConfiguration/${cmp_id}`,
        apiData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      dispatch(updateConfiguration(res?.data?.data));
      localStorage.setItem("secOrg", JSON.stringify(res.data.data));

      refreshHook();
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };

  return (
    <div className="bg-white">
      <TitleDiv
        title="Print Configuration (Sale Order)"
        from="/sUsers/printConfiguration"
        loading={loading}
      />

      <PrintTitleModal
        isOpen={printTitleModal}
        onClose={() => setPrintTitleModal(false)}
        onSubmit={savePrintTitle}
        data={data}
        loading={loading}
      />
      <div className="space-y-4 b-white p-4 mx-1">
        {settings.map((option, index) => (
          <SettingsCard
            option={option}
            index={index}
            key={index}
            modalHandler={() => setPrintTitleModal(true)}
            handleToggleChangeFromParent={handleToggleChange}
          />
        ))}
      </div>
    </div>
  );
};

export default SaleOrderPrintConfiguration;
