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
  const [summaryReport, setSummaryReport] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(null)
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
    loading: Loading,
    error: Error
  } = useFetch(salesummaryUrl)
  useEffect(() => {
    if (salesummaryData && salesummaryData?.flattenedResults) {
      setSummary(salesummaryData.flattenedResults)
    }
  }, [salesummaryData])
  useEffect(() => {
    if (summary && summary.length > 0) {
      setSelectedIndex(null)
      handleLedger(selectedOption)
    }
  }, [summary])
  console.log(selectedOption)
  const handleLedger = (option) => {
    setSelectedOption(option)
    let check = []
    let arr = []
    console.log(option)
    if (option === "Ledger") {
      const partybase = summary.map((item) => {
        console.log(item)
        console.log(check)
        let existingParty = check.find((data) => {
          console.log(data.partyId)
          console.log(item.party._id)
          return data.partyId === item.party?._id
        })

        console.log(existingParty)
        if (existingParty) {
          let c = 0
          console.log(existingParty)
          const sale = item.items.map((it) => {
            if (it.hasGodownOrBatch) {
              if (
                it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
              ) {
                const godown = it.GodownList.reduce((acc, items) => {
                  const existing = acc.find(
                    (entry) => entry.godown_id === items.godown_id
                  )

                  if (existing && items.added) {
                    console.log("inddddd")
                    // Update totals for the existing entry
                    existing.quantity += items?.count || 0
                    existing.discount += items?.discount || 0
                    existing.netAmount += items?.individualTotal || 0
                    existing.taxAmount += items?.igstAmt || 0
                    c += items?.individualTotal
                  } else if (!existing && items.added) {
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
                    c += items?.individualTotal
                  }
                  return acc
                }, [])
                existingParty.saleAmount = c
                existingParty.sale.push(godown)
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
                    existingParty.saleAmount += items?.individualTotal
                    existingParty.sale.push(a)
                  }
                })
              }
            } else {
              console.log("hh")
              const godown = it.GodownList.map((items) => {
                const a = {
                  billnumber: item?.salesNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,

                  groupName: it?.brand?.name,
                  quantity: it?.count,
                  rate: items?.selectedPriceRate,
                  discount: it?.discount,
                  taxPercentage: it?.igst,
                  taxAmount: it?.igstAmt,
                  netAmount: items?.individualTotal
                }
                existingParty.saleAmount += items?.individualTotal
                existingParty.sale.push(a)
              })
            }
          })
        } else {
          const object = {
            partyName: item?.party?.partyName,
            partyId: item?.party?._id,
            sale: [],
            saleAmount: 0
          }
          let a = 0
          const sale = item.items.map((it) => {
            console.log(it)
            if (it.hasGodownOrBatch) {
              if (
                it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
              ) {
                const godown = it.GodownList.reduce((acc, items) => {
                  if (items.added) {
                    if (Object.keys(acc).length > 0) {
                      console.log(Object.keys(acc).length > 0)
                      console.log("j")
                      // Update the existing object's values
                      acc.quantity += items?.count || 0
                      acc.discount += items?.discount || 0
                      acc.netAmount += items?.individualTotal || 0
                      acc.taxAmount += items?.igstAmt || 0
                      console.log(items?.individualTotal)
                      console.log(a)
                      a += items?.individualTotal
                      console.log(a)
                    } else {
                      // Populate the object for the first time
                      Object.assign(acc, {
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

                      console.log(a)
                      a += items?.individualTotal
                      console.log(a)
                    }
                    return acc
                  }
                }, {})
                console.log(a)
                console.log(object.saleAmount)

                object.saleAmount += a
                console.log(a)
                console.log(object.saleAmount)
                object.sale.push(godown)
                console.log(object)
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
                    console.log(object)
                    console.log(items?.individualTotal, items?.count)
                    object.saleAmount += items?.individualTotal
                    console.log(object)
                    object.sale.push(a)
                  }
                })
                console.log(object)
              }
            } else {
              const godown = it.GodownList.map((items) => {
                const a = {
                  billnumber: item?.salesNumber,
                  billDate: item?.date,
                  itemName: it?.product_name,

                  groupName: it?.brand?.name,
                  quantity: it?.count,
                  rate: items?.selectedPriceRate,
                  discount: it?.discount,
                  taxPercentage: it?.igst,
                  taxAmount: it?.igstAmt,
                  netAmount: items?.individualTotal
                }
                console.log(object.saleAmount)
                console.log(items?.individualTotal)
                object.saleAmount += items?.individualTotal
                console.log(object.saleAmount)
                object.sale.push(a)
                console.log(object.saleAmount)
              })
              console.log(object)
            }
          })
          console.log(object)
          check.push(object)

          // arr.push(saleobject)
          // object.sale = arr
          // check.push(object)
        }
      })
      setSummaryReport(check)
      console.log("checkk", check)
    } else if (option === "Stock Group") {
      console.log("hii")
      const partybase = summary.map((item) => {
        const z = item.items.map((h) => {
          if (h?.brand?.name) {
            console.log(item)
            console.log(h.brand.name)
            console.log(h)
            let existingParty = check.find((data) => {
              return data.groupId === h.brand?._id
            })
            console.log(existingParty)
            if (existingParty) {
              console.log(existingParty)
              let c = 0
              console.log(existingParty)
              const sale = item.items.map((it) => {
                if (it.hasGodownOrBatch) {
                  if (
                    it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                    it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                  ) {
                    const godown = it.GodownList.reduce((acc, items) => {
                      const existing = acc.find(
                        (entry) => entry.godown_id === items.godown_id
                      )

                      if (existing && items.added) {
                        console.log("inddddd")
                        // Update totals for the existing entry
                        existing.quantity += items?.count || 0
                        existing.discount += items?.discount || 0
                        existing.netAmount += items?.individualTotal || 0
                        existing.taxAmount += items?.igstAmt || 0
                        c += items?.individualTotal
                      } else if (!existing && items.added) {
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
                        c += items?.individualTotal
                      }
                      return acc
                    }, [])
                    existingParty.saleAmount = c
                    existingParty.sale.push(godown)
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
                        existingParty.saleAmount += items?.individualTotal
                        existingParty.sale.push(a)
                      }
                    })
                  }
                } else {
                  console.log("hh")
                  const godown = it.GodownList.map((items) => {
                    const a = {
                      billnumber: item?.salesNumber,
                      billDate: item?.date,
                      itemName: it?.product_name,

                      groupName: it?.brand?.name,
                      quantity: it?.count,
                      rate: items?.selectedPriceRate,
                      discount: it?.discount,
                      taxPercentage: it?.igst,
                      taxAmount: it?.igstAmt,
                      netAmount: items?.individualTotal
                    }
                    existingParty.saleAmount += items?.individualTotal
                    existingParty.sale.push(a)
                  })
                }
              })
            } else {
              const object = {
                groupName: h?.brand?.name,
                groupId: h?.brand?._id,
                sale: [],
                saleAmount: 0
              }
              console.log(object)
              let a = 0

              if (h.hasGodownOrBatch) {
                console.log("hii")
                if (
                  it.GodownList.every((item) => item.godown_id) && // Check all have godown_id
                  it.GodownList.every((item) => !item.hasOwnProperty("batch")) // Ensure no item has batch
                ) {
                  console.log("gggg")
                  const godown = it.GodownList.reduce((acc, items) => {
                    if (items.added) {
                      if (Object.keys(acc).length > 0) {
                        // Update the existing object's values
                        acc.quantity += items?.count || 0
                        acc.discount += items?.discount || 0
                        acc.netAmount += items?.individualTotal || 0
                        acc.taxAmount += items?.igstAmt || 0
                        a += items?.individualTotal
                      } else {
                        // Populate the object for the first time
                        Object.assign(acc, {
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

                        a += items?.individualTotal
                      }
                      return acc
                    }
                  }, {})
                  object.saleAmount = a
                  object.sale.push(godown)
                } else {
                  console.log("hi")
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
                      object.saleAmount += items?.individualTotal
                      object.sale.push(a)
                    }
                  })
                }
              } else {
                console.log("uu")
                console.log(h)
                console.log(item)
                const godown = h.GodownList.map((items) => {
                  console.log(items)
                  const a = {
                    billnumber: item?.salesNumber,
                    billDate: item?.date,
                    itemName: h?.product_name,

                    partyName: item?.party?.partyName,
                    quantity: h?.count,
                    rate: items?.selectedPriceRate,
                    discount: h?.discount,
                    taxPercentage: h?.igst,
                    taxAmount: h?.igstAmt,
                    netAmount: items?.individualTotal
                  }
                  console.log(a)
                  object.saleAmount += items?.individualTotal
                  object.sale.push(a)
                })
              }

              console.log(object)
              check.push(object)
            }
          }
        })
      })
      setSummaryReport(check)
    }
  }

  const handleUserAndCompanyData = (data) => {
    setUserAndCompanyData(data)
  }
  console.log(summaryReport)
  console.log(selectedOption)
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

        {Loading && (
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
              onChange={(e) => {
                console.log(e.target.value)
                handleLedger(e.target.value)
              }}
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

      {!Loading && Error && (
        <section>
          <p className="text-gray-500 text-center font-bold  mt-20">
            Oops!.. No data found
          </p>
        </section>
      )}
      <div>
        {summaryReport && summaryReport.length > 0 && (
          <>
            <div className="flex justify-end mt-2">
              <button
                className="px-2 py-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200 cursor-pointer"
                onClick={() => setSelectedIndex(!null)} // Reset when "View Details" is clicked
              >
                View Details
              </button>
            </div>
            <div className="mb-2">
              {summaryReport &&
                summaryReport.length > 0 &&
                selectedIndex === null &&
                summaryReport.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-md transform transition duration-300 hover:shadow-xl hover:scale-55 hover:-translate-y-1"
                  >
                    <span className="text-gray-800 font-medium">
                      {item.partyName || item.groupName}
                    </span>
                    <span className="text-gray-600 font-semibold">
                      {item.saleAmount}
                    </span>
                  </div>
                ))}
            </div>
          </>
        )}

        {selectedIndex !== null && (
          <div className="px-2 bg-gray-50 rounded-lg shadow-lg ">
            <div className="flex justify-between items-center mb-1  ">
              <button
                className="px-4 py-1 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 transition duration-200 cursor-pointer"
                onClick={() => setSelectedIndex(null)} // Reset to close the table view
              >
                Close
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-gray-200">
                  <th className="p-2 font-semibold text-gray-600">
                    {" "}
                    {selectedOption === "Ledger"
                      ? "Party Name"
                      : selectedOption === "Stock Group"
                      ? "Group Name"
                      : selectedOption === "Stock Category"
                      ? "Category Name"
                      : selectedOption === "Stock Item"
                      ? "Item Name"
                      : ""}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Bill No</th>
                  <th className="p-2 font-semibold text-gray-600">Bill Date</th>
                  <th className="p-2 font-semibold text-gray-600">
                    {selectedOption === "Ledger" ? "Group Name" : "Party Name"}
                  </th>
                  <th className="p-2 font-semibold text-gray-600">Batch</th>
                  <th className="p-2 font-semibold text-gray-600">Item Name</th>
                  <th className="p-2 font-semibold text-gray-600">Quantity</th>
                  <th className="p-2 font-semibold text-gray-600">Rate</th>
                  <th className="p-2 font-semibold text-gray-600">Discount</th>
                  <th className="p-2 font-semibold text-gray-600">Amount</th>
                  <th className="p-2 font-semibold text-gray-600">Tax%</th>
                  <th className="p-2 font-semibold text-gray-600">
                    Tax Amount
                  </th>
                  <th className="p-2 font-semibold text-gray-600">
                    Net Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {summaryReport.map((party, partyIndex) =>
                  party.sale.map((saleItem, saleIndex) => (
                    <tr
                      key={`${partyIndex}-${saleIndex}`}
                      className="border-b hover:bg-gray-100 transition duration-200"
                    >
                      {/* Display Party Name only for the first item in the sale array */}
                      {saleIndex === 0 ? (
                        <td
                          className="p-2 text-gray-800 font-bold"
                          rowSpan={party.sale.length} // Merge rows for the same party
                        >
                          {party.partyName || party.groupName}
                        </td>
                      ) : null}

                      <td className="p-2 text-gray-800">
                        {saleItem?.billnumber}
                      </td>
                      <td className="p-2 text-gray-800">
                        {" "}
                        {
                          new Date(saleItem?.billDate)
                            .toISOString()
                            .split("T")[0]
                        }
                      </td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.groupName || saleItem?.partyName}
                      </td>
                      <td className="p-2 text-gray-800">{saleItem?.batch}</td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.itemName}
                      </td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.quantity}
                      </td>
                      <td className="p-2 text-gray-800">{saleItem?.rate}</td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.discount}
                      </td>
                      <td className="p-2 text-gray-800">{saleItem?.amount}</td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.taxPercentage}
                      </td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.taxAmount}
                      </td>
                      <td className="p-2 text-gray-800">
                        {saleItem?.netAmount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SalesSummary
