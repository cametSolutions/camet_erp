import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
function SaleSummaryTable({ handleLedger, selectedOption }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Retrieve the data passed via state
  const { summaryReport } = location.state || {}
  console.log(summaryReport)
  if (!summaryReport) {
    return (
      <div>
        <p>No data available</p>
        {/* <button
          className="px-2 py-0.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition duration-200 cursor-pointer mx-3"
          onClick={() => navigate(-1)} // Navigate back to the previous page
        >
          Go Back
        </button> */}
      </div>
    )
  }
  return (
    <div className="px-2 bg-gray-50 rounded-lg shadow-lg ">
      {/* <button
        className="bg-gradient-to-r from-blue-900 via-blue-900 to-blue-900 text-white px-4 py-2 rounded-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-200"
        onClick={() => navigate(-1)} // Navigate back to the previous page
      >
        Go Back
      </button> */}
      <table className="w-full text-center border">
        <thead>
          <tr className="border-b bg-gray-300">
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
              {selectedOption === "Ledger"
                ? "Item Name"
                : selectedOption === "Stock Group"
                ? "Category Name"
                : selectedOption === "Stock Category"
                ? "Group Name"
                : selectedOption === "Stock Item"
                ? "Party Name"
                : ""}
            </th>
            <th className="p-2 font-semibold text-gray-600">
              {selectedOption === "Ledger"
                ? "Category Name"
                : selectedOption === "Stock Group"
                ? "Party Name"
                : selectedOption === "Stock Category"
                ? "Item Name"
                : selectedOption === "Stock Item"
                ? "Group Name"
                : ""}
            </th>
            <th className="p-2 font-semibold text-gray-600">
              {" "}
              {selectedOption === "Ledger"
                ? "Group Name"
                : selectedOption === "Stock Group"
                ? "Item Name"
                : selectedOption === "Stock Category"
                ? "Party Name"
                : selectedOption === "Stock Item"
                ? "Category Name"
                : ""}
            </th>
            <th className="p-2 font-semibold text-gray-600">Batch</th>
            <th className="p-2 font-semibold text-gray-600">Quantity</th>
            <th className="p-2 font-semibold text-gray-600">Rate</th>
            <th className="p-2 font-semibold text-gray-600">Discount</th>
            <th className="p-2 font-semibold text-gray-600">Amount</th>
            <th className="p-2 font-semibold text-gray-600">Tax%</th>
            <th className="p-2 font-semibold text-gray-600">Tax Amount</th>
            <th className="p-2 font-semibold text-gray-600">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {summaryReport?.map((party, partyIndex) => (
            <>
              {/* Add a thicker border between parties */}
              {partyIndex !== 0 && (
                <tr>
                  <td
                    colSpan={14}
                    className="h-2 bg-gray-300" // Adds a gray row for visual separation
                  ></td>
                </tr>
              )}
              {party?.sale.map((saleItem, saleIndex) => (
                <tr
                  key={`${partyIndex}-${saleIndex}`}
                  className="border-b hover:bg-pink-100 transition duration-200 text-sm "
                >
                  {/* Display Party Name only for the first item in the sale array */}
                  {saleIndex === 0 ? (
                    <td
                      className="px-1 py-2 text-gray-800 font-bold"
                      rowSpan={party.sale.length} // Merge rows for the same party
                    >
                      {party?.partyName ||
                        party?.groupName ||
                        party?.categoryName ||
                        party?.itemName}
                    </td>
                  ) : null}
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.billnumber}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {/* {saleItem?.billDate} */}
                    {new Date(saleItem?.billDate).toISOString().split("T")[0]}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.groupName || saleItem?.partyName}
                  </td>
                  <td className="px-1 py-2 text-gray-800">{saleItem?.batch}</td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.itemName}
                  </td>
                  <td className="px-1 py-2 text-gray-800">{saleItem?.batch}</td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.quantity}
                  </td>
                  <td className="px-1 py-2 text-gray-800">{saleItem?.rate}</td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.discount}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.amount}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.taxPercentage}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.taxAmount}
                  </td>
                  <td className="px-1 py-2 text-gray-800">
                    {saleItem?.netAmount}
                  </td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default SaleSummaryTable
