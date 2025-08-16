/* eslint-disable react/prop-types */
import { IoIosAddCircle } from "react-icons/io";
import { Link } from "react-router-dom";

function VoucherSubmitButton({
  title,
  enablePaymentSplittingAsCompulsory,
  loading,
  submitHandler,
  mode,
  titleText,
}) {
  return (
    <div>
      {title === "Sales" && enablePaymentSplittingAsCompulsory ? (
        // Special case → link button
        <Link
          to="/sUsers/sales/paymentSplitting"
          className={`${
            loading && "pointer-events-none opacity-80"
          } bottom-0 text-white bg-violet-700 w-full sm:rounded-md p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer`}
        >
          <IoIosAddCircle className="text-2xl" />
          <p>Receive Payment</p>
        </Link>
      ) : (
        // Normal button case
        <button
          onClick={submitHandler}
          className={`${
            loading && "pointer-events-none opacity-80"
          } bottom-0 text-white bg-violet-700 w-full sm:rounded-md p-2 flex items-center justify-center gap-2 hover_scale cursor-pointer`}
        >
          <IoIosAddCircle className="text-2xl" />
          {title === "Stock Transfer" ? (
            <p>{mode === "create" ? "Transfer Stock" : "Edit Transfer"}</p>
          ) : (
            <p>
              {mode === "create"
                ? `Generate ${titleText}`
                : `Edit ${titleText}`}
            </p>
          )}
        </button>
      )}
    </div>
  );
}

export default VoucherSubmitButton;
