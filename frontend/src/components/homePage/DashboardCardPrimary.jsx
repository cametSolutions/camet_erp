/* eslint-disable react/prop-types */
import { BiSolidAddToQueue } from 'react-icons/bi';
import { MdInventory } from 'react-icons/md';

function DashboardCardPrimary({ receiptTotal, handleLinkClick }) {
  const cardData = [
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
      title: '',
      subtitle: 'Inventory',
      link: '/pUsers/Inventory'
    }
  ];

  return (
    <div className="w-full md:w-6.5/12 sticky top-[100px] grid grid-cols-2 lg:grid-cols-2 p-6 gap-4 md:gap-6 bg-white">
      {cardData.map((card, index) => (
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
}

export default DashboardCardPrimary;