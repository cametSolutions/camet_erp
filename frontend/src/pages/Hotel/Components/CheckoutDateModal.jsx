/* eslint-disable react/prop-types */


const formatTimeForInput = (time12h = "") => {
  if (!time12h) return "";

  const [time, modifier] = time12h.split(" ");
  if (!time || !modifier) return "";

  let [hours, minutes] = time.split(":");
  hours = parseInt(hours, 10);

  if (modifier.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

export default function CheckoutDateModal({
  checkouts,
  onDateChange,
  onDaysChange,
  onTimeChange,
}) {
console.log(checkouts);
  return (
    <div className="border rounded-md bg-white overflow-hidden m-3">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">VoucherNo & Arrival Date</th>
            <th className="p-2 text-left">Checkout Date</th>
            <th className="p-2 text-left">Checkout Time</th>
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
  type="time"
  value={formatTimeForInput(c.checkOutTime || "")}
  onChange={(e) => onTimeChange(c._id, e.target.value)}
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