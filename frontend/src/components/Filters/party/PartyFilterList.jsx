/* eslint-disable react/no-unknown-property */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import PartyList from "../../secUsers/main/PartyList";
import FindUserAndCompany from "../FindUserandCompany";
import useFetch from "../../../../src/customHook/useFetch";
import { setSelectedParty } from "../../../../slices/filterSlices/partyFIlter";

// import { MdCancel } from "react-icons/md";

function PartyFilterList() {
  const [parties, setParties] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredParties, setFilteredParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAndCompanyData, setUserAndCompanyData] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  // Callback function to receive data from FindUserAndCompany
  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data);
  };

  const searchData = (data) => {
    setSearch(data);
  };

  const {
    data: partyData,
    loading: partyLoading,
    error,
  } = useFetch(
    userAndCompanyData &&
      `/api/sUsers/PartyList/${userAndCompanyData?.org?._id}`
  );

  useEffect(() => {
    if (partyData && !partyLoading) {
      // partyData.partyList.append
      setParties(partyData.partyList);

      setLoading(false);
    }
  }, [partyData, partyLoading]);

  const selectHandler = (party) => {
    dispatch(setSelectedParty(party));

    navigate(location.state.from, { replace: true });
  };

  const backHandler = () => {
    navigate(location.state.from, { replace: true });
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
      <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />
      <PartyList
        filter={true}
        backHandler={backHandler}
        searchData={searchData}
        loading={loading}
        filteredParties={filteredParties}
        selectHandler={selectHandler}
      />
    </div>
  );
}

export default PartyFilterList;
