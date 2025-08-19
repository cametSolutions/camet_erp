const RoomTooltipContent = ({ room, tooltipData }) => {
  // Extract checkins and bookings arrays from tooltipData
  const checkins = tooltipData?.checkins || [];
  const bookings = tooltipData?.bookings || [];

  // Find the checkin record matching this room by roomId
  const checkin = checkins.find((c) =>
    c.selectedRooms?.some((sr) => sr.roomId === room._id)
  );

  if (checkin) {
    return (
      <div className="z-9999">
        <div>
          Guest:{" "}
          <span className="font-bold">{checkin.customerName || "N/A"}</span>
        </div>
        <div>
          Check-Out Date:{" "}
          <span className="font-bold">{checkin.checkOutDate || "N/A"}</span>
        </div>
        <div>
          Check-in Number:{" "}
          <span className="font-bold">{checkin.voucherNumber || "N/A"}</span>
        </div>
        <div>
          Room: <span className="font-bold">{room.roomName}</span>
        </div>
      </div>
    );
  }

  // Find the booking record matching this room by roomId
  const booking = bookings.find((b) =>
    b.selectedRooms?.some((sr) => sr.roomId === room._id)
  );

  if (booking) {
    return (
      <div className="z-9999">
        <div>
          Guest: <span className="font-bold">{booking.customerName}</span>
        </div>
        <div>
          Booking Number:{" "}
          <span className="font-bold">{booking.voucherNumber}</span>
        </div>
        <div>
          Book-in Date: <span className="font-bold">{booking.bookingDate}</span>
        </div>
        <div>
          Book-in Time: <span className="font-bold">{booking.arrivalTime}</span>
        </div>
        <div>
          Phone Number:{" "}
          <span className="font-bold">{booking.mobileNumber}</span>
        </div>
      </div>
    );
  }

  return <div>No Data Available</div>;
};

export default RoomTooltipContent;
