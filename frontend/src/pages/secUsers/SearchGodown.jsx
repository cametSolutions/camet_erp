/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addSelectedGodown } from "../../../slices/stockTransferSecondary";

import GodownList from "../../components/secUsers/StockTransfer/GodownList";

// import { MdCancel } from "react-icons/md";

function SearchGodown() {
  const [godowns, setGodowns] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredGodowns, setFilteredGodowns] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();


  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const res = await api.get(`/api/sUsers/fetchGodowns/${cpm_id}`, {
          withCredentials: true,
        });

        setGodowns(res?.data?.data?.godowns);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchGodowns();
  }, [cpm_id]);

  const selectHandler = (el) => {
    dispatch(addSelectedGodown(el));
    navigate(-1);
  };

  const backHandler = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (search === "") {
      setFilteredGodowns(godowns);
    } else {
      const filtered = godowns.filter((el) =>
        el.partyName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredGodowns(filtered);
    }
  }, [search, godowns]);

  return (
    <div className=" ">
      <GodownList
        backHandler={backHandler}
        searchData={searchData}
        loading={loading}
        filteredGodowns={filteredGodowns}
        selectHandler={selectHandler}
      />
    </div>
  );
}

export default SearchGodown;
