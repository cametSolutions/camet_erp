import { CgEditBlackPoint } from "react-icons/cg"
import { Link } from "react-router-dom"
import { BiChevronDown } from "react-icons/bi"
import { useSelector } from "react-redux"
function VoucherTypeFilter({ filterKeys = [] }) {
  const selectedVoucher = useSelector(
    (state) => state?.voucherType?.selectedVoucher
  )
  return (
    <div className="flex justify-between  items-center p-3">
      <div className=" flex items-center gap-2">
        <CgEditBlackPoint />
        {}
        <p className="font-semibold text-gray-500 text-xs">
          {selectedVoucher?.title}
        </p>
      </div>

      <div className="">
        <Link
          to="/sUsers/vouchersLIst"
          state={{
            filterKeys:filterKeys
          }}
        >
          <p className="text-violet-500 p-1 px-3  border border-1 border-gray-300 rounded-2xl cursor-pointer">
            <BiChevronDown />
          </p>
        </Link>
      </div>
    </div>
  )
}

export default VoucherTypeFilter
