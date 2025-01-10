import { useEffect, useMemo, useState } from "react"
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
  const [summary, setSummary] = useState([])
  const [datasummary, setdataSummary] = useState([])

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
    data: salesummaryData,
    loading: transactionLoading,
    error: transactionError
  } = useFetch(salesummaryUrl)
  useEffect(() => {
    if (salesummaryData && salesummaryData?.flattenedResults) {
      setSummary(salesummaryData.flattenedResults)
    }
  }, [salesummaryData])
  useEffect(() => {
    if (summary && summary.length > 0) {
      if (selectedOption === "Ledger") {
        handleLedger(selectedOption)
      } else if (selectedOption === "Stock Item") {
      } else if (selectedOption === "") {
      }
    }
  }, [summary])
  const handleLedger = (option) => {
    let check = []
    let arr = []
    const partybase = summary.map((item) => {
      let existingParty = check.find((data) => {
        data.partyId === item.party?._id
      })

      if (existingParty) {
        const sale = item.items.map((it) => {
          if (it.hasGodownOrBatch) {
            return (godown = it.GodownList.map((items) => {
              if (items.added) {
                const a = {
                  billnumber: item?.salesNumber,
                  billDate: item?.date,
                  itemName: item.product_name,
                  batch: items?.batch,
                  groupName: it?.brand?.name,
                  quantity: items?.count,
                  rate: items?.selectedPriceRate,
                  discount: items?.discount,
                  taxPercentage: it?.igst,
                  taxAmount: it?.igstAmt,
                  netAmount: it?.individualTotal
                }
                existingParty.sale.push(a)
              }
            }))
          }
        })
      } else {
        let object = {
          partyName: item?.party?.partyName,
          partyId: item?.party?._id,
          sale: []
        }

        const sale = item.items.map((it) => {
          if (it.hasGodownOrBatch) {
            if (
              it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
              it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
            ) {
              console.log("unddddd")
              const godown = it.GodownList.reduce((acc, items) => {
                const existing = acc.find(
                  (entry) => entry.godown_id === items.godown_id
                )

                if (existing) {
                  console.log("inddddd")
                  // Update totals for the existing entry
                  existing.quantity += items?.count || 0
                  existing.discount += items?.discount || 0
                  existing.netAmount += items?.individualTotal || 0
                  existing.taxAmount += items?.igstAmt || 0
                } else {
                  console.log("mergedddd")
                  // Add a new entry for this godown_id
                  acc.push({
                    godown_id: items?.godown_id,
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: it?.product_name,
                    groupName: it?.brand?.name,
                    quantity: items?.count || 0,
                    rate: items?.selectedPriceRate || 0,
                    discount: items?.discount || 0,
                    taxPercentage: it?.igst || 0,
                    taxAmount: items?.igstAmt || 0,
                    netAmount: items?.individualTotal || 0
                  })
                }
                return acc
              }, [])
              object.sale.push(godown)
            } else {
              const godown = it.GodownList.map((items) => {
                if (items.added) {
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: it?.product_name,
                    batch: items?.batch,
                    groupName: it?.brand?.name,
                    quantity: items?.count,
                    rate: items?.selectedPriceRate,
                    discount: items?.discount,
                    taxPercentage: it?.igst,
                    taxAmount: it?.igstAmt,
                    netAmount: items?.individualTotal
                  }
                  object.sale.push(a)
                }
              })
            }
            // const down = it.GodownList.reduce((acc, ms) => {
            //   if (ms?.godown_id && !ms?.batch) {
            //     acc.push(2)
            //     const existing = acc.find(
            //       (entry) => entry.godown_id === ms.godown_id
            //     )
            //     console.log("godownonly", acc)
            //     console.log("godownonly2", ms)
            //   }
            //   return acc
            // }, [])
          } else {
            const godown = it.GodownList.map((items) => {
              const a = {
                billnumber: item?.salesNumber,
                billDate: item?.date,
                itemName: it?.product_name,

                groupName: it?.brand?.name,
                quantiy: it?.count,
                rate: items?.selectedPriceRate,
                discount: it?.discount,
                taxPercentage: it?.igst,
                taxAmount: it?.igstAmt,
                netAmount: items?.individualTotal
              }
              object.sale.push(a)
            })
          }
        })
        check.push(object)

        // arr.push(saleobject)
        // object.sale = arr
        // check.push(object)
      }
    })
    console.log("checkk", check)
  }

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data)
  }

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
