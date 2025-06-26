import TitleDiv from "../TitleDiv"
import { BsFillRecord2Fill } from "react-icons/bs"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setSelectedVoucher } from "../../../../slices/filterSlices/voucherType"
import { useLocation } from "react-router-dom"
const vouchers = [
  { title: "All Vouchers", value: "all" },
  { title: "Sale", value: "sale" },
  { title: "Sale Order", value: "saleOrder" },
  { title: "Van Sale", value: "vanSale" },
  { title: "Purchase", value: "purchase" },
  { title: "Debit Note", value: "debitNote" },
  { title: "Credit Note", value: "creditNote" },
  { title: "Receipt", value: "receipt" },
  { title: "Payment", value: "payment" },
  { title: "Stock Transfer", value: "stockTransfer" }
]
function VouchersList() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
const location=useLocation()
const filterKeys=location?.state?.filterKeys
console.log(filterKeys)
  const filteredVouchers = filterKeys.length
    ? vouchers.filter((v) => filterKeys.includes(v.value))
    : vouchers
console.log(filteredVouchers)

  const handleSelect = (voucher) => {
    console.log(voucher)
    dispatch(setSelectedVoucher(voucher))
    navigate(-1)
  }

  return (
    <>
      <TitleDiv title="Vouchers" />
      <div className="flex flex-col gap-3 z-10">
        {filteredVouchers.map((voucher, index) => (
          <div
            onClick={() => handleSelect(voucher)}
            key={index}
            className="flex justify-between   shadow-md  items-center p-6 px-6 border-b border-gray-300 cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            <div className="flex justify-evenly items-center gap-3 text-xs">
              <BsFillRecord2Fill size={15} />
              <p className="font-semibold text-gray-500">{voucher?.title}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default VouchersList
