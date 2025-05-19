/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { addStockTransferToGodown } from "../../../slices/voucherSlices/commonVoucherSlice";
import GodownList from "../../components/secUsers/StockTransfer/GodownList";
import useFetch from "@/customHook/useFetch";

function SearchGodown() {
  const [godowns, setGodowns] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredGodowns, setFilteredGodowns] = useState([]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const searchData = (data) => {
    setSearch(data);
  };

  const { data, loading } =
    useFetch(`/api/sUsers/getProductSubDetails/${cpm_id}?type=godown
`);

  useEffect(() => {
    if (data) {
      setGodowns(data?.data);
      setFilteredGodowns(data?.data);
    }
  }, [data]);

  // useEffect(() => {
  //   const fetchGodowns = async () => {
  //     try {
  //       const res = await api.get(`/api/sUsers/fetchGodowns/${cpm_id}`, {
  //         withCredentials: true,
  //       });

  //       setGodowns(res?.data?.data?.godowns);
  //       setLoading(false);
  //     } catch (error) {
  //       console.log(error);
  //       setLoading(false);
  //     }
  //   };
  //   fetchGodowns();
  // }, [cpm_id]);

  const selectHandler = (el) => {
    dispatch(addStockTransferToGodown(el));
    navigate(-1);
  };

  useEffect(() => {
    if (search === "") {
      setFilteredGodowns(godowns);
    } else {
      const filtered = godowns?.filter((el) =>
        el?.godown?.toLowerCase()?.includes(search.toLowerCase())
      );
      setFilteredGodowns(filtered);
    }
  }, [search, godowns]);

  return (
    <div className=" ">
      <GodownList
        searchData={searchData}
        loading={loading}
        filteredGodowns={filteredGodowns}
        selectHandler={selectHandler}
      />
    </div>
  );
}

export default SearchGodown;
