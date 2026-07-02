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
    <div className="m-3 space-y-2">
      <div className="hidden rounded-md border bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700 sm:grid sm:grid-cols-[1.35fr_1fr_0.9fr_0.55fr] sm:gap-2">
        <div>VoucherNo & Arrival Date</div>
        <div>Checkout Date</div>
        <div>Checkout Time</div>
        <div>Days</div>
      </div>

      {checkouts.map((c) => (
        <div
          key={c._id}
          className="rounded-md border bg-white p-3 text-xs sm:grid sm:grid-cols-[1.35fr_1fr_0.9fr_0.55fr] sm:items-center sm:gap-2 sm:p-2"
        >
          <div className="mb-2 sm:mb-0">
            <p className="font-medium text-gray-800">{c.voucherNumber}</p>
            <p className="text-[11px] text-gray-500">
              {new Date(c.arrivalDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <label className="mb-2 block sm:mb-0">
            <span className="mb-1 block text-[11px] font-medium text-gray-500 sm:hidden">
              Checkout Date
            </span>
            <input
              type="date"
              value={c.checkOutDate}
              onChange={(e) => onDateChange(c._id, e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </label>

          <label className="mb-2 block sm:mb-0">
            <span className="mb-1 block text-[11px] font-medium text-gray-500 sm:hidden">
              Checkout Time
            </span>
            <input
              type="time"
              value={formatTimeForInput(c.checkOutTime || "")}
              onChange={(e) => onTimeChange(c._id, e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-medium text-gray-500 sm:hidden">
              Days
            </span>
            <input
              type="number"
              step="0.5"
              value={c.stayDays}
              onChange={(e) => onDaysChange(c._id, e.target.value)}
              className="w-full rounded border px-2 py-1"
            />
          </label>
        </div>
      ))}
    </div>
  );
}
