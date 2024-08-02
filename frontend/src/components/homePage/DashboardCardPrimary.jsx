/* eslint-disable react/prop-types */
import { BiSolidAddToQueue } from 'react-icons/bi';
import { IoReceiptSharp } from 'react-icons/io5';
import { MdInventory } from 'react-icons/md';
import { RiContactsFill } from 'react-icons/ri';
import { BiTransfer } from "react-icons/bi";


const DashboardCards = ({ userType, receiptTotal, handleLinkClick }) => {
  const cardData = {
    primary: [
      {
        icon: <BiSolidAddToQueue />,
        bgColor: 'bg-green-500',
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: 'Transactions',
        link: '/pUsers/transaction'
      },
      {
        icon: <MdInventory />,
        bgColor: 'bg-blue-500',
        subtitle: 'Stock Register',
        link: '/pUsers/Inventory'
      }
    ],
    secondary: [
      {
        icon: <BiSolidAddToQueue />,
        bgColor: 'bg-green-500',
        title: `₹${receiptTotal.toFixed(2)}`,
        subtitle: 'Transactions',
        link: '/sUsers/transaction'
      },
      {
        icon: <IoReceiptSharp />,
        bgColor: 'bg-red-500',
        subtitle: 'Outstanding',
        link: '/sUsers/outstanding'
      },
      {
        icon: <MdInventory />,
        bgColor: 'bg-blue-500',
        subtitle: 'Stock Register',
        link: '/sUsers/Inventory'
      },
      {
        icon: <RiContactsFill />,
        bgColor: 'bg-[#9b5de5]',
        subtitle: 'Contacts',
        link: '/sUsers/contacts'
      },
      {
        icon: <BiTransfer />,
        bgColor: 'bg-[#134074]',
        subtitle: 'Stock Transfer',
        link: '/sUsers/stockTransfer'
      }
    ]
  };

  const cards = cardData[userType];

  return (
    <div className={`grid grid-cols-2 p-6 lg:px-6 gap-4 md:gap-6 bg-white w-full md:w-6.5/12 sticky top-[100px] `}>
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleLinkClick(card.link)}
          className="flex flex-wrap -mx-6 duration-150 hover:scale-105 ease-in-out cursor-pointer"
        >
          <div className="w-full px-6">
            <div className="flex items-center px-2 py-3 md:px-5 md:py-2 shadow-sm rounded-md bg-slate-100 h-24">
              <div className={`p-3 rounded-full ${card.bgColor} bg-opacity-75 text-2xl text-white`}>
                {card.icon}
              </div>
              <div className="mx-2 md:mx-5">
                {card.title && (
                  <h4 className="sm:text-md md:text-lg font-semibold text-gray-700">
                    {card.title}
                  </h4>
                )}
                <div className="text-gray-500 text-[15px]">
                  {card.subtitle}
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