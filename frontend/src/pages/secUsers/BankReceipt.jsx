import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import BankListComponent from "../../components/common/List/BankListComponent";
import { addAllBankList, addPaymentDetails } from "../../../slices/receipt";
import { useNavigate } from "react-router-dom";
function BankReceipt() {
  const [banks, setBanks] = useState([]);
  const cmp_id = useSelector(
    (state) => state.setSelectedOrganization.selectedOrg._id
  );

  const { bankList } = useSelector((state) => state.receipt);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bankSubmitHandler = (data) => {
    dispatch(addPaymentDetails(data));
    navigate("/sUsers/receipt");
  };

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await api.get(`api/sUsers/fetchBanks/${cmp_id}`, {
          withCredentials: true,
        });

        const bankData = res.data.data;
        const filteredBanks = bankData.filter(
          (bank) =>
            bank.bank_name &&
            bank.bank_name !== "null" &&
            bank.bank_ledname &&
            bank.bank_ledname !== "null"
        );

        setBanks(filteredBanks);
        dispatch(addAllBankList(filteredBanks));
      } catch (error) {
        console.log(error);
      }
    };

    if (bankList.length === 0) {
      fetchBanks();
    }else{
      setBanks(bankList);
    }
  }, [cmp_id]);

  return (
    <div>
      <BankListComponent
        data={banks}
        user="secondary"
        submitHandler={bankSubmitHandler}
      />
    </div>
  );
}

export default BankReceipt;
