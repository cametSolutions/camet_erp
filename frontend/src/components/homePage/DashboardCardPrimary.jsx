/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */

import transactionImg from "../../assets/images/transactions.png";
import customers from "../../assets/images/customers.png";
import vouchers from "../../assets/images/application.png";
import product from "../../assets/images/product.png";
import reportImg from "../../assets/images/reports.png";
import hotelImg from "../../assets/images/hotel.png";
import restaurantImg from "../../assets/images/restaurant.png";

const DashboardCards = ({
  userType,
  receiptTotal,
  handleLinkClick,
  organization,
}) => {
  const primary = [
    {
      icon: transactionImg,
      title: `₹${receiptTotal.toFixed(2)}`,
      subtitle: "Transactions",
      link: "/pUsers/transaction",
    },
    {
      icon: customers,
      subtitle: "Stock Register",
      link: "/pUsers/Inventory",
    },
  ];

  let secondary = [];

  if (organization?.industry === 6 || organization?.industry === 7) {
    secondary = [
      {
        icon: hotelImg,
        subtitle: "Hotel Management",
        link: "/sUsers/hotelDashBoard",
      },
      {
        icon: restaurantImg,
        subtitle: "Restaurant Management",
        link: "/sUsers/hotelDashBoard",
      },
      {
        icon: vouchers,
        subtitle: "Vouchers",
        link: "/sUsers/selectVouchers",
      },
      {
        icon: reportImg,
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: "Reports",
        link: "/sUsers/reports",
      },
    ];
  } else {
    secondary = [
      {
        icon: product,
        subtitle: "Products",
        link: "/sUsers/productList",
      },
      {
        icon: customers,
        subtitle: "Customers",
        link: "/sUsers/partyList",
      },
      {
        icon: vouchers,
        subtitle: "Vouchers",
        link: "/sUsers/selectVouchers",
      },
      {
        icon: reportImg,
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: "Reports",
        link: "/sUsers/reports",
      },
    ];
  }

  const cardData = {
    primary,
    secondary,
  };

  const cards = cardData[userType];

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 p-6 lg:px-6 gap-4 md:gap-6 bg-white w-full md:w-6.5/12  `}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleLinkClick(card.link)}
          className="flex flex-wrap  "
        >
          <div className="w-full  cursor-pointer ">
            <div className="flex items-center   px-2 py-4  shadow-md rounded-md bg-slate-50  hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
              <div className="bg-white p-1.5 rounded-lg flex justify-center items-center w-12 h-12 md:w-14 md:h-14 shadow-lg">
                <img src={card.icon} alt={card.title} className="" />
              </div>
              <div className="mx-2 md:mx-5">
                {/* {card.title && (
                  <h4 className="sm:text-md md:text-lg font-semibold text-gray-700">
                    {card.title}
                  </h4>
                )} */}
                <div className="text-gray-500 text-[15px]">
                  {card?.subtitle}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
