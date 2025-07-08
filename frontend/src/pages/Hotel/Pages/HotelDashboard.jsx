import { BedDouble } from "lucide-react";
import AnimatedBackground from "../Components/AnimatedBackground";
import RoomStatus from "../Components/RoomStatus";
import { useNavigate } from "react-router-dom";
const HotelDashboard = () => {
  const rooms = [
    { room: "1001", status: "vacant", type: "DELUXE" },
    {
      room: "1003A",
      status: "vacant",
      guest: "RIYAS JABBAR",
      checkIn: "26-Sep-2020",
      checkOut: "27-Sep-2020",
      type: "JAQUZI",
    },
    {
      room: "1004",
      status: "occupied",
      guest: "RIYAS JABBAR",
      checkIn: "26-Sep-2020",
      checkOut: "27-Sep-2020",
      type: "JAQUZI",
    },
    {
      room: "1005",
      status: "occupied",
      guest: "AADIVIKASAI RE SIDENCY",
      checkIn: "26-Sep-2020",
      checkOut: "27-Sep-2020",
      type: "S.ROOM",
    },
    {
      room: "1006",
      status: "occupied",
      guest: "AADIVIKASAI RE SIDENCY",
      checkIn: "26-Sep-2020",
      checkOut: "27-Sep-2020",
      type: "D.ROOM",
    },
    {
      room: "1003",
      status: "occupied",
      guest: "VAISHAK",
      checkIn: "11-Oct-2020",
      checkOut: "12-Oct-2020",
      type: "Suite",
    },
    {
      room: "1010",
      status: "occupied",
      guest: "VAISHAK",
      checkIn: "11-Oct-2020",
      checkOut: "12-Oct-2020",
      type: "S.ROOM",
    },
    {
      room: "1011",
      status: "occupied",
      guest: "VAISHAK",
      checkIn: "11-Oct-2020",
      checkOut: "12-Oct-2020",
      type: "D.ROOM",
    },
    { room: "1012", status: "dirty", type: "DELUXE" },
    {
      room: "1014",
      status: "occupied",
      guest: "RIYAS K SEETHI",
      checkIn: "22-Oct-2020",
      checkOut: "23-Oct-2020",
      type: "Suite",
    },
    { room: "2005", status: "vacant", type: "JAQUZI" },
    { room: "2006", status: "vacant", type: "JAQUZI" },
    { room: "2007", status: "vacant", type: "DELUXE" },
    { room: "2008", status: "dirty", type: "JAQUZI" },
    { room: "2009", status: "vacant", type: "DELUXE" },
    { room: "2010", status: "vacant", type: "DELUXE" },
  ];
  // Grouping rooms by type
  const grouped = rooms.reduce((acc, room) => {
    acc[room.type] = acc[room.type] || [];
    acc[room.type].push(room);
    return acc;
  }, {});

  const navigate = useNavigate();

  const setSelectedRoom = () => {};
  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden p-3 ">
      <AnimatedBackground />
      <div className=" mx-auto relative z-10">
        {/* Heading and Legend */}
        <div>
          <div className="bg-[#0B1D34] flex flex-col md:flex-row p-2 gap-2 md:gap-0">
            <div>
              <h3 className="font-bold text-blue-400 flex items-center gap-2 text-base md:text-lg">
                <BedDouble className="w-5 h-5 text-cyan-400" />
                Room Status Overview
              </h3>
            </div>

            <div className="md:ml-auto flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
               <button
                className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                onClick={() => navigate("/sUsers/checkInPage")}
              >
                Check In
              </button> 
              <button
                className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                onClick={() => navigate("/sUsers/checkOut")}
              >
               Check Out
              </button>
              
              <button
                className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                onClick={() => navigate("/sUsers/bookingPage")}
              >
                Room Booking
              </button>
              <button
                className="bg-blue-500 hover:bg-[#60A5FA] text-white font-bold px-3 py-1 rounded text-sm"
                onClick={() => navigate("/sUsers/partyList")}
              >
                New Guest
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4  pt-6 border-t border-white/20">
            {[
              {
                label: "Vacant",
                color: "from-emerald-500 to-teal-600",
                count: 24,
              },
              {
                label: "Occupied",
                color: "from-orange-500 to-red-600",
                count: 11,
              },
              { label: "Booked", color: "from-red-500 to-pink-600", count: 16 },
              {
                label: "Dirty",
                color: "from-yellow-500 to-orange-600",
                count: 21,
              },
              {
                label: "Blocked",
                color: "from-gray-500 to-slate-800",
                count: 2,
              },
            ].map((status, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-7 h-6 rounded bg-gradient-to-r ${status.color} text-center `}
                >
                  {" "}
                  <p className="text-white">{status.count}</p>
                </div>
                <span className="text-gray-300 text-sm">{status.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 ml-auto"></div>
          </div>
        </div>

        {/* Room Grid */}
        {Object.entries(grouped).map(([type, rooms]) => (
          <div key={type} className="mt-6">
            <h2 className="text-white text-lg font-semibold mb-2">
              {type} Rooms
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {rooms.map((room, index) => (
                <div
                  key={room.room}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  className="animate-slide-in"
                >
                  <RoomStatus {...room} onClick={() => setSelectedRoom(room)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
export default HotelDashboard;
