/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addParty } from "../../../slices/purchase";
import { useLocation } from "react-router-dom";
import PartyList from "../../components/secUsers/main/PartyList";



// import { MdCancel } from "react-icons/md";

function SearchPartyPurchase() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  console.log(parties);

  const cpm_id = useSelector(
    (state) => state.secSelectedOrganization.secSelectedOrg._id
  );

  const searchData = (data) => {
    setSearch(data);
  };

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get(`/api/sUsers/PartyList/${cpm_id}`, {
          withCredentials: true,
        });

        setParties(res.data.partyList);
        setLoading(false);

      } catch (error) {
        console.log(error);
        setLoading(false);

      }
    };
    fetchParties();
  }, [cpm_id]);

  const selectHandler = (el) => {
    dispatch(addParty(el));
    if (location?.state?.from === "editPurchase") {
      navigate(`/sUsers/editPurchase/${location?.state?.id}`);
    } else {
      navigate("/sUsers/purchase");
    }
  };

  const backHandler=()=>{
    if (location?.state?.from === "editPurchase") {
      navigate(`/sUsers/editPurchase/${location?.state?.id}`);
    } else {
      navigate("/sUsers/purchase");
    }

  }

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

export default SearchPartyPurchase;
