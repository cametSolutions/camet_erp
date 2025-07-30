import React, { useState } from 'react';

const OrdersDashboard = () => {
  const [activeFilter, setActiveFilter] = useState('On Process');
  const [searchQuery, setSearchQuery] = useState('');

  const orders = [
    {
      id: 525,
      customer: 'Ariel Hikmat',
      avatar: 'A4',
      avatarColor: 'teal',
      type: 'Dine In',
      date: 'Wed, July 12, 2023',
      time: '06:12 PM',
      status: 'readytoserve',
      statusType: 'readytoserve',
      items: [
        { name: 'Scrambled eggs with toast', qty: 1, price: 16.99 },
        { name: 'Smoked Salmon Bagel', qty: 1, price: 18.49 },
        { name: 'Belgian Waffles', qty: 2, price: 38.98 },
        { name: 'Classic Lemonade', qty: 1, price: 12.49 }
      ],
      total: 87.34
    },
    {
      id: 523,
      customer: 'Denis Freeman',
      avatar: 'B2',
      avatarColor: 'green',
      type: 'Dine In',
      date: 'Wed, July 12, 2023',
      time: '06:19 PM',
      status: 'Cooking',
      statusType: 'Cooking',
      items: [
        { name: 'Classic Cheeseburger', qty: 1, price: 10.69 },
        { name: 'Fish and Chips', qty: 2, price: 34.00 },
        { name: 'Greek Gyro Plate', qty: 1, price: 13.18 }
      ],
      total: 57.87
    },
    {
      id: 519,
      customer: 'Morgan Cox',
      avatar: 'TA',
      avatarColor: 'yellow',
      type: 'Takeaway',
      date: 'Wed, July 12, 2023',
      time: '05:19 PM',
      status: 'Cooking',
      statusType: 'Cooking',
      items: [
        { name: 'Vegetarian Pad Thai', qty: 1, price: 16.99 },
        { name: 'Shrimp Tacos', qty: 2, price: 19.49 },
        { name: 'Belgian Waffles', qty: 1, price: 19.49 }
      ],
      moreItems: 2,
      total: 86.96
    },
    {
      id: 1,
      customer: 'Paul Rey',
      avatar: 'TA',
      avatarColor: 'yellow',
      type: 'Takeaway',
      date: 'Wed, July 12, 2023',
      time: '06:16 PM',
      status: 'Cooking',
      statusType: 'Cooking',
      items: [
        { name: 'Margherita Pizza', qty: 1, price: 16.99 },
        { name: 'Belgian Waffles', qty: 1, price: 19.49 },
        { name: 'Virgin Mojito', qty: 2, price: 38.98 },
        { name: 'Classic Lemonade', qty: 2, price: 24.98 }
      ],
      total: 93.86
    },
    {
      id: 3,
      customer: 'Maja Backer',
      avatar: 'A9',
      avatarColor: 'green',
      type: 'Dine In',
      date: 'Wed, July 12, 2023',
      time: '03:32 PM',
      status: 'Completed',
      statusType: 'completed',
      items: [
        { name: 'Peri Stuffed Mushrooms', qty: 1, price: 18.99 },
        { name: 'Lobster Ravioli', qty: 1, price: 17.89 },
        { name: 'Thai Coconut Curry', qty: 2, price: 18.48 }
      ],
      moreItems: 6,
      total: 98.34
    },
    {
      id: 8,
      customer: 'Erwan Richard',
      avatar: 'C2',
      avatarColor: 'teal',
      type: 'Dine In',
      date: 'Wed, July 12, 2023',
      time: '05:20 PM',
      status: 'Completed',
      statusType: 'completed',
      items: [
        { name: 'Creamy Garlic Chicken', qty: 1, price: 15.99 },
        { name: 'Greek Gyro Plate', qty: 1, price: 13.59 },
        { name: 'Belgian Waffles', qty: 1, price: 12.99 }
      ],
      moreItems: 3,
      total: 56.06
    }
  ];

  const getAvatarColorClass = (color) => {
    const colors = {
      teal: 'bg-[#0097A7]',
      green: 'bg-[#8BC34A]',
      orange: 'bg-[#FFC107]',
      yellow: 'bg-[#F7DC6F] text-black'
    };
    return colors[color] || 'bg-[#E5E5EA]';
  };

  const getStatusClasses = (statusType) => {
    const statusClasses = {
      readytoserve: 'bg-[#C6F7D0] text-[#009688]',
      Cooking: 'bg-[#F7DC6F] text-[#FFC107]',
      completed: 'bg-[#C5CAE9] text-[#3F51B5]'
    };
    return statusClasses[statusType] || 'bg-[#E5E5EA] text-[#757575]';
  };

  const getStatusIconColor = (statusType) => {
    const iconColors = {
      readytoserve: 'bg-[#009688]',
      Cooking: 'bg-[#FFC107]',
      completed: 'bg-[#3F51B5]'
    };
    return iconColors[statusType] || 'bg-[#757575]';
  };

  const MenuIcon = () => (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-black">Kitchen Orders Ticket Display</h1>
        <div className="text-gray-600 text-sm">Wednesday, 12 July 2023</div>
      </div>

      {/* Controls */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex gap-2">
          {['All', 'On Process', 'Completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 border rounded-md text-sm font-medium cursor-pointer ${
                activeFilter === filter
                  ? 'bg-green-800 text-white border-green-800'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <MenuIcon />
          <input
            type="text"
            className="px-3 py-1.5 border border-gray-300 rounded-md w-64 text-sm"
            placeholder="Search a name, order, or etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchIcon />
        </div>
      </div>

      {/* Orders Grid - 4 cards per row */}
      <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg p-3 shadow-sm">
            {/* Order Header */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColorClass(order.avatarColor)}`}>
                  {order.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-0.5">{order.customer}</h3>
                  <div className="text-xs text-gray-600">
                    #{order.id} • {order.type}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.date} {order.time}
                  </div>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusClasses(order.statusType)}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${getStatusIconColor(order.statusType)}`}></div>
                {order.status}
              </div>
            </div>

            {/* Order Items */}
            <div className="my-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between py-1 border-b border-gray-100 text-xs last:border-b-0">
                  <div className="flex-1 truncate pr-2">{item.name}</div>
                  <div className="text-gray-600 min-w-4">{item.qty}</div>
                  <div className="font-medium min-w-12 text-right">${item.price.toFixed(2)}</div>
                </div>
              ))}
              {order.moreItems && (
                <div className="text-gray-600 text-xs italic text-center py-1">
                  +{order.moreItems} more
                </div>
              )}
            </div>

            {/* Order Total */}
            <div className="flex justify-between font-semibold text-sm my-2 pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            {/* Order Actions */}
            <div className="flex gap-2">
              <button className="flex-1 px-2 py-1.5 bg-white text-green-800 border border-green-800 rounded text-xs font-medium hover:bg-gray-50">
                 See Details
              </button>
              <button className="flex-1 px-2 py-1.5 bg-yellow-400 text-black border border-yellow-400 rounded text-xs font-medium hover:bg-yellow-300">
                Ready To Serve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersDashboard;