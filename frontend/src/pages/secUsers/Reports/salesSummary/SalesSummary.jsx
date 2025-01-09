import { useMemo, useState } from "react"
import TitleDiv from "../../../../components/common/TitleDiv"
import FindUserAndCompany from "../../../../components/Filters/FindUserAndCompany"
import PartyFilter from "../../../../components/Filters/party/PartyFilter"
import SelectDate from "../../../../components/Filters/SelectDate"
import StatusFilter from "../../../../components/Filters/status/StatusFilter"
import { useSelector } from "react-redux"
import { MdAddLink } from "react-icons/md"
import { useNavigate, useParams } from "react-router-dom"
import useFetch from "../../../../customHook/useFetch"
import DashboardTransaction from "../../../../components/common/DashboardTransaction"
import { BarLoader } from "react-spinners"
// import { useLocation } from "react-router-dom";
import { MdDoNotDisturbOnTotalSilence } from "react-icons/md"

function SalesSummary() {
  const [userAndCompanyData, setUserAndCompanyData] = useState(null)
  const [selectedOption, setSelectedOption] = useState("Ledger")
  // const location = useLocation();

  const { accGroup } = useParams()

  const { start, end } = useSelector((state) => state.date)
  const { _id: partyID } = useSelector(
    (state) => state.partyFilter.selectedParty
  )

  const salesummaryUrl = useMemo(() => {
    if (userAndCompanyData && start && end && selectedOption) {
      return `/api/sUsers/salesSummary/${
        userAndCompanyData?.org?._id
      }?party_id=${
        partyID ?? ""
      }&startOfDayParam=${start}&endOfDayParam=${end}&selectedVoucher=sale&selectedOption=${selectedOption}`
    }
    return null // Or return an empty string if preferred
  }, [userAndCompanyData, start, end, selectedOption])

  const {
    data: transactionData,
    loading: transactionLoading,
    error: transactionError
  } = useFetch(salesummaryUrl)
  console.log(transactionData)
  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data)
  }
  console.log("hiiiddd", transactionData)
  return (
    <div>
      <div className="sticky top-0 z-50">
        <FindUserAndCompany getUserAndCompany={handleUserAndCompanyData} />
        <TitleDiv title="Sales Summary" from={"/sUsers/reports"} />
        <section className="shadow-lg border-b">
          <SelectDate />
        </section>
        {/* <section className="shadow-lg p-3 flex items-center gap-6 bg-white  border-b">
          <PartyFilter />
          <StatusFilter />
        </section> */}

        {transactionLoading && (
          <section className="w-full">
            <BarLoader color="#9900ff" width="100%" />
          </section>
        )}
        <div
          style={{ backgroundColor: "#219ebc" }}
          className=" opacity-80  flex flex-col   pb-11 shadow-xl justify-center"
        >
          <div className="m-2">
            <select
              className="w-full sm:max-w-sm md:max-w-xs bg-[#219ebc] text-white font-semibold py-2 px-3 rounded-lg shadow-lg hover:shadow-xl cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            >
              <option value="Ledger">Ledger</option>
              <option value="Stock Item">Stock Item</option>
              <option value="Stock Group">Stock Group</option>
              <option value="Stock Category">Stock Category</option>
            </select>
          </div>

          <div
            className={`   text-center  text-white  flex justify-center items-center flex-col mt-5`}
          >
            {/* <h2 className="text-3xl sm:text-4xl font-bold">₹{grandTotal}</h2> */}
            <p className="text-sm mt-4 font-semibold opacity-90">
              {new Date(start).toDateString()} - {new Date(end).toDateString()}
            </p>
            {/* <p className="text-sm mt-4 font-bold opacity-90">{title}</p> */}
          </div>
        </div>
      </div>

      {!transactionLoading && transactionError && (
        <section>
          <p className="text-gray-500 text-center font-bold  mt-20">
            Oops!.. No data found
          </p>
        </section>
      )}

      {/* <section>
        <DashboardTransaction
          filteredData={transactionData?.data?.combined}
          userType={userAndCompanyData?.userType}
          from="/sUsers/reports/salesSummary"
        />
      </section> */}
    </div>
  )
}

export default SalesSummary
