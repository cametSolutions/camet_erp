/* eslint-disable react/prop-types */


export default function CheckoutDateModal({
  checkouts,
  onDateChange,
  onDaysChange,
}) {
console.log(checkouts);
  return (
    <div className="border rounded-md bg-white overflow-hidden m-3">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">VoucherNo & Arrival Date</th>
            <th className="p-2 text-left">Checkout Date</th>
            <th className="p-2 text-left">Days</th>
          </tr>
        </thead>

        <tbody>
          {checkouts.map((c) => (
            <tr key={c._id} className="border-t">
              <td className="p-2">
                <p>{c.voucherNumber} </p>{" "}
                <p>
                  {new Date(c.arrivalDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>{" "}
              </td>
              <td className="p-2">
                <input
                  type="date"
                  value={c.checkOutDate}
                  onChange={(e) => onDateChange(c._id, e.target.value)}
                  className="border rounded px-2 py-1 w-full"
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  step="0.5"
                  value={c.stayDays}
                  onChange={(e) => onDaysChange(c._id, e.target.value)}
                  className="border rounded px-2 py-1 w-24"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}