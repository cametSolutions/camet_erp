/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../api/api";
import { useDispatch } from "react-redux";
import { addParty } from "../../../slices/receipt";
import { useLocation } from "react-router-dom";
import PartyList from "../../components/secUsers/main/PartyList";

// import { MdCancel } from "react-icons/md";

function SearchPartyReciept() {
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
  useEffect(() => {
    const fetchParties = async () => {
      try {
        const res = await api.get(
          `/api/sUsers/PartyList/${cpm_id}`,
          {
            withCredentials: true,
          }
        );
        setLoading(false);

        setParties(res.data.partyList);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchParties();
  }, [cpm_id]);

  const searchData = (data) => {
    setSearch(data);
  };

  const selectHandler = (el) => {
    dispatch(addParty(el));
    navigate("/sUsers/receipt");
  };
  const backHandler = () => {
    navigate("/sUsers/receipt");
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
    <div className="flex relative  ">
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

export default SearchPartyReciept;
