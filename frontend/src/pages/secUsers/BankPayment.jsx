import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import BankListComponent from "../../components/common/List/BankListComponent";
import { addAllBankList, addPaymentDetails } from "../../../slices/payment";
import { useNavigate } from "react-router-dom";
function BankPayment() {
  const [banks, setBanks] = useState([]);
  const cmp_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const { bankList } = useSelector((state) => state.payment);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const bankSubmitHandler = (data) => {
    // console.log(data);
    
    dispatch(addPaymentDetails(data));
    navigate("/sUsers/paymentPurchase");
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
  }, [cmp_id]);0

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

export default BankPayment;
