/* eslint-disable react/jsx-key */
import { useEffect, useState } from "react";
import useFetch from "../../customHook/useFetch";
import { setSelectedCompanyFilter } from "../../../slices/filterSlices/companyFilter";
import { useDispatch } from "react-redux";

// eslint-disable-next-line react/prop-types
function CompanyFilter({ setLoading }) {
  const [companies, setCompanies] = useState([]);

  const dispatch = useDispatch();

  const { data, loading, error } = useFetch(`/api/sUsers/getSecUserData`);

  useEffect(() => {
    setCompanies(data?.data?.userData?.organization || []);
    if (loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [data, loading]);

  const handleSelectChange = (event) => {
    const selectedCompanyId = event.target.value;
    const company = companies.find((comp) => comp._id === selectedCompanyId);
    let dataToTake = {};
    if (company) {
      dataToTake = {
        _id: company?._id,
        name: company?.name,
      };
    }

    dispatch(setSelectedCompanyFilter(dataToTake));
  };

  return (
    <div className="bg-white p-3 shadow-lg w-full">
      <select
        className="rounded border-gray-300 w-full sm:w-1/4 text-xs font-semibold no-focus-box"
        onChange={handleSelectChange}
      >
        <option value="">All</option>
        {companies?.length > 0 && !loading && !error ? (
          companies.map((company) => (
            <option key={company?._id} value={company?._id}>
              {company?.name}
            </option>
          ))
        ) : (
          <option value="">No companies found</option>
        )}
      </select>
    </div>
  );
}

export default CompanyFilter;
