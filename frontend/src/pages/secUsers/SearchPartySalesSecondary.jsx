/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addParty } from "../../../slices/salesSecondary";
import { useLocation } from "react-router-dom";

import PartyList from "../../components/secUsers/main/PartyList";
import { addAllParties } from "../../../slices/partySlice";

// import { MdCancel } from "react-icons/md";

function SearchPartySalesSecondary() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const searchData = (data) => {
    setSearch(data);
  };

  let url;

  if (location.pathname === "/sUsers/orderPending/partyList") {
    url = "/api/sUsers/PartyListWithOrderPending";
  } else {
    url = "/api/sUsers/PartyList";
  }

  useEffect(() => {
    if (url) {
      const fetchParties = async () => {
        try {
          const res = await api.get(`${url}/${cpm_id}`, {
            withCredentials: true,
          });

          setParties(res.data.partyList);
          dispatch(addAllParties(res.data.partyList));
          setLoading(false);
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      };
      fetchParties();
    }
  }, [cpm_id, url]);

  const selectHandler = (el) => {
    if (location.pathname === "/sUsers/partyStatement/partyList") {
      navigate("/sUsers/partyStatement", { state: el });
    } else if (location.pathname === "/sUsers/orderPending/partyList") {
      navigate(`/sUsers/pendingOrders/${el?._id}`);
    } else {
      dispatch(addParty(el));
      navigate(-1, { replace: true });
    }
  };

  const backHandler = () => {
    if (location?.state?.from === "convertedSaleDetail") {
      navigate("/sUsers/selectVouchers");
    } else {
      navigate(-1, { replace: true });
    }
  };

  useEffect(() => {
    if (search === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter((el) =>
        el.partyName.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredParties(filtered);
    }
  }, [search, parties]);

  return (
    <div className=" ">
      <PartyList
        backHandler={backHandler}
        searchData={searchData}
        loading={loading}
        filteredParties={filteredParties}
        selectHandler={selectHandler}
      />
    </div>
  );
}

export default SearchPartySalesSecondary;
