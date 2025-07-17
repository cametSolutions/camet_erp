import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Search, Star, Clock, Users, TrendingUp, Filter, Menu, X } from 'lucide-react';
import { motion } from "framer-motion";
const RestaurantPOS = () => {
  const [selectedCuisine, setSelectedCuisine] = useState('Indian');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

 const cuisines = [
  { name: 'Indian', icon: '🇮🇳', color: '#f97316' },     // Tailwind: bg-orange-500
  { name: 'Chinese', icon: '🇨🇳', color: '#ef4444' },    // Tailwind: bg-red-500
  { name: 'Japanese', icon: '🇯🇵', color: '#ec4899' },   // Tailwind: bg-pink-500
  { name: 'Mexican', icon: '🇲🇽', color: '#eab308' },    // Tailwind: bg-yellow-500
  { name: 'Italian', icon: '🇮🇹', color: '#22c55e' },    // Tailwind: bg-green-500
  { name: 'Thai', icon: '🇹🇭', color: '#3b82f6' }        // Tailwind: bg-blue-500
];


  const categoryByCuisine = {
    Indian: [
      { name: 'All', icon: '🍽️' },
      { name: 'Biryani Varieties', icon: '🍛' },
      { name: 'Curry Dishes', icon: '🍲' },
      { name: 'Chicken Varieties', icon: '🍗' },
      { name: 'Snacks & Appetizers', icon: '🥟' },
      { name: 'Meals & Thali', icon: '🍽️' },
      { name: 'Bread & Rice', icon: '🍞' },
      { name: 'Desserts', icon: '🍮' },
      { name: 'Beverages', icon: '☕' }
    ],
    Chinese: [
      { name: 'All', icon: '🍽️' },
      { name: 'Noodles', icon: '🍜' },
      { name: 'Fried Rice', icon: '🍚' },
      { name: 'Dim Sum', icon: '🥟' },
      { name: 'Stir Fry', icon: '🥢' },
      { name: 'Soups', icon: '🍲' },
      { name: 'Appetizers', icon: '🥠' },
      { name: 'Desserts', icon: '🥮' },
      { name: 'Beverages', icon: '🍵' }
    ],
    Japanese: [
      { name: 'All', icon: '🍽️' },
      { name: 'Sushi', icon: '🍣' },
      { name: 'Ramen', icon: '🍜' },
      { name: 'Tempura', icon: '🍤' },
      { name: 'Bento', icon: '🍱' },
      { name: 'Udon', icon: '🍜' },
      { name: 'Appetizers', icon: '🥢' },
      { name: 'Desserts', icon: '🍡' },
      { name: 'Beverages', icon: '🍵' }
    ],
    Mexican: [
      { name: 'All', icon: '🍽️' },
      { name: 'Tacos', icon: '🌮' },
      { name: 'Burritos', icon: '🌯' },
      { name: 'Quesadillas', icon: '🧀' },
      { name: 'Nachos', icon: '🌽' },
      { name: 'Fajitas', icon: '🥘' },
      { name: 'Appetizers', icon: '🥑' },
      { name: 'Desserts', icon: '🍰' },
      { name: 'Beverages', icon: '🥤' }
    ],
    Italian: [
      { name: 'All', icon: '🍽️' },
      { name: 'Pizza', icon: '🍕' },
      { name: 'Pasta', icon: '🍝' },
      { name: 'Risotto', icon: '🍚' },
      { name: 'Salads', icon: '🥗' },
      { name: 'Appetizers', icon: '🧄' },
      { name: 'Desserts', icon: '🍨' },
      { name: 'Beverages', icon: '🍷' }
    ],
    Thai: [
      { name: 'All', icon: '🍽️' },
      { name: 'Curry', icon: '🍛' },
      { name: 'Pad Thai', icon: '🍜' },
      { name: 'Stir Fry', icon: '🥢' },
      { name: 'Soups', icon: '🍲' },
      { name: 'Salads', icon: '🥗' },
      { name: 'Appetizers', icon: '🥟' },
      { name: 'Desserts', icon: '🍮' },
      { name: 'Beverages', icon: '🥤' }
    ]
  };

  const menuItems = {
    Indian: [
      // Biryani Varieties
      { id: 1, name: 'Chicken Biryani', price: 350, image: '🍛', category: 'Biryani Varieties', rating: 4.8, time: '25 min' },
      { id: 2, name: 'Mutton Biryani', price: 450, image: '🍛', category: 'Biryani Varieties', rating: 4.9, time: '30 min' },
      { id: 3, name: 'Veg Biryani', price: 280, image: '🍛', category: 'Biryani Varieties', rating: 4.5, time: '20 min' },
      { id: 4, name: 'Hyderabadi Biryani', price: 420, image: '🍛', category: 'Biryani Varieties', rating: 4.7, time: '35 min' },
      
      // Curry Dishes
      { id: 5, name: 'Butter Chicken', price: 380, image: '🍗', category: 'Curry Dishes', rating: 4.8, time: '20 min' },
      { id: 6, name: 'Dal Makhani', price: 220, image: '🍲', category: 'Curry Dishes', rating: 4.6, time: '15 min' },
      { id: 7, name: 'Paneer Butter Masala', price: 280, image: '🧀', category: 'Curry Dishes', rating: 4.5, time: '18 min' },
      { id: 8, name: 'Fish Curry', price: 350, image: '🐟', category: 'Curry Dishes', rating: 4.7, time: '22 min' },
      
      // Chicken Varieties
      { id: 9, name: 'Tandoori Chicken', price: 420, image: '🍗', category: 'Chicken Varieties', rating: 4.8, time: '25 min' },
      { id: 10, name: 'Chicken Tikka', price: 320, image: '🍢', category: 'Chicken Varieties', rating: 4.7, time: '18 min' },
      { id: 11, name: 'Chicken 65', price: 280, image: '🍗', category: 'Chicken Varieties', rating: 4.6, time: '15 min' },
      { id: 12, name: 'Chicken Korma', price: 350, image: '🍗', category: 'Chicken Varieties', rating: 4.5, time: '20 min' },
      
      // Snacks & Appetizers
      { id: 13, name: 'Samosa', price: 80, image: '🥟', category: 'Snacks & Appetizers', rating: 4.4, time: '10 min' },
      { id: 14, name: 'Pakoras', price: 120, image: '🥔', category: 'Snacks & Appetizers', rating: 4.3, time: '12 min' },
      { id: 15, name: 'Chaat', price: 100, image: '🥗', category: 'Snacks & Appetizers', rating: 4.5, time: '8 min' },
      { id: 16, name: 'Kebabs', price: 200, image: '🍢', category: 'Snacks & Appetizers', rating: 4.7, time: '15 min' },
      
      // Meals & Thali
      { id: 17, name: 'Veg Thali', price: 250, image: '🍽️', category: 'Meals & Thali', rating: 4.6, time: '15 min' },
      { id: 18, name: 'Non-Veg Thali', price: 350, image: '🍽️', category: 'Meals & Thali', rating: 4.8, time: '20 min' },
      { id: 19, name: 'South Indian Meals', price: 280, image: '🍽️', category: 'Meals & Thali', rating: 4.5, time: '18 min' },
      
      // Bread & Rice
      { id: 20, name: 'Butter Naan', price: 60, image: '🫓', category: 'Bread & Rice', rating: 4.4, time: '8 min' },
      { id: 21, name: 'Garlic Naan', price: 80, image: '🫓', category: 'Bread & Rice', rating: 4.5, time: '10 min' },
      { id: 22, name: 'Jeera Rice', price: 120, image: '🍚', category: 'Bread & Rice', rating: 4.3, time: '12 min' },
      
      // Desserts
      { id: 23, name: 'Gulab Jamun', price: 120, image: '🍮', category: 'Desserts', rating: 4.6, time: '5 min' },
      { id: 24, name: 'Ras Malai', price: 140, image: '🍰', category: 'Desserts', rating: 4.8, time: '5 min' },
      { id: 25, name: 'Kulfi', price: 100, image: '🍦', category: 'Desserts', rating: 4.5, time: '5 min' },
      
      // Beverages
      { id: 26, name: 'Masala Chai', price: 40, image: '☕', category: 'Beverages', rating: 4.5, time: '5 min' },
      { id: 27, name: 'Mango Lassi', price: 80, image: '🥭', category: 'Beverages', rating: 4.4, time: '5 min' },
      { id: 28, name: 'Fresh Lime Soda', price: 60, image: '🍋', category: 'Beverages', rating: 4.3, time: '3 min' }
    ],
    Chinese: [
      // Noodles
      { id: 29, name: 'Hakka Noodles', price: 180, image: '🍜', category: 'Noodles', rating: 4.5, time: '15 min' },
      { id: 30, name: 'Schezwan Noodles', price: 200, image: '🍜', category: 'Noodles', rating: 4.6, time: '18 min' },
      { id: 31, name: 'Singapore Noodles', price: 220, image: '🍜', category: 'Noodles', rating: 4.4, time: '20 min' },
      
      // Fried Rice
      { id: 32, name: 'Veg Fried Rice', price: 160, image: '🍚', category: 'Fried Rice', rating: 4.3, time: '12 min' },
      { id: 33, name: 'Chicken Fried Rice', price: 200, image: '🍚', category: 'Fried Rice', rating: 4.5, time: '15 min' },
      { id: 34, name: 'Schezwan Fried Rice', price: 180, image: '🍚', category: 'Fried Rice', rating: 4.4, time: '14 min' },
      
      // Dim Sum
      { id: 35, name: 'Veg Momos', price: 120, image: '🥟', category: 'Dim Sum', rating: 4.6, time: '10 min' },
      { id: 36, name: 'Chicken Momos', price: 150, image: '🥟', category: 'Dim Sum', rating: 4.7, time: '12 min' },
      { id: 37, name: 'Steamed Dumplings', price: 180, image: '🥟', category: 'Dim Sum', rating: 4.5, time: '15 min' },
      
      // Stir Fry
      { id: 38, name: 'Chilli Chicken', price: 280, image: '🍗', category: 'Stir Fry', rating: 4.7, time: '18 min' },
      { id: 39, name: 'Manchurian', price: 220, image: '🥢', category: 'Stir Fry', rating: 4.5, time: '16 min' },
      { id: 40, name: 'Honey Chilli Potato', price: 180, image: '🥔', category: 'Stir Fry', rating: 4.4, time: '14 min' }
    ],
    Japanese: [
      // Sushi
      { id: 41, name: 'California Roll', price: 320, image: '🍣', category: 'Sushi', rating: 4.6, time: '15 min' },
      { id: 42, name: 'Salmon Sashimi', price: 450, image: '🍣', category: 'Sushi', rating: 4.8, time: '10 min' },
      { id: 43, name: 'Tuna Roll', price: 380, image: '🍣', category: 'Sushi', rating: 4.7, time: '12 min' },
      
      // Ramen
      { id: 44, name: 'Tonkotsu Ramen', price: 350, image: '🍜', category: 'Ramen', rating: 4.8, time: '20 min' },
      { id: 45, name: 'Miso Ramen', price: 320, image: '🍜', category: 'Ramen', rating: 4.6, time: '18 min' },
      { id: 46, name: 'Shoyu Ramen', price: 300, image: '🍜', category: 'Ramen', rating: 4.5, time: '16 min' },
      
      // Tempura
      { id: 47, name: 'Prawn Tempura', price: 380, image: '🍤', category: 'Tempura', rating: 4.7, time: '15 min' },
      { id: 48, name: 'Vegetable Tempura', price: 250, image: '🥕', category: 'Tempura', rating: 4.4, time: '12 min' },
      
      // Bento
      { id: 49, name: 'Chicken Teriyaki Bento', price: 420, image: '🍱', category: 'Bento', rating: 4.6, time: '20 min' },
      { id: 50, name: 'Salmon Bento', price: 480, image: '🍱', category: 'Bento', rating: 4.8, time: '22 min' }
    ],
    Mexican: [
      // Tacos
      { id: 51, name: 'Chicken Tacos', price: 250, image: '🌮', category: 'Tacos', rating: 4.5, time: '12 min' },
      { id: 52, name: 'Beef Tacos', price: 280, image: '🌮', category: 'Tacos', rating: 4.6, time: '15 min' },
      { id: 53, name: 'Fish Tacos', price: 300, image: '🌮', category: 'Tacos', rating: 4.7, time: '18 min' },
      
      // Burritos
      { id: 54, name: 'Chicken Burrito', price: 320, image: '🌯', category: 'Burritos', rating: 4.5, time: '15 min' },
      { id: 55, name: 'Beef Burrito', price: 350, image: '🌯', category: 'Burritos', rating: 4.6, time: '18 min' },
      { id: 56, name: 'Veggie Burrito', price: 280, image: '🌯', category: 'Burritos', rating: 4.4, time: '12 min' },
      
      // Quesadillas
      { id: 57, name: 'Cheese Quesadilla', price: 200, image: '🧀', category: 'Quesadillas', rating: 4.3, time: '10 min' },
      { id: 58, name: 'Chicken Quesadilla', price: 280, image: '🧀', category: 'Quesadillas', rating: 4.5, time: '15 min' },
      
      // Nachos
      { id: 59, name: 'Loaded Nachos', price: 320, image: '🌽', category: 'Nachos', rating: 4.6, time: '12 min' },
      { id: 60, name: 'Cheese Nachos', price: 220, image: '🌽', category: 'Nachos', rating: 4.4, time: '8 min' }
    ],
    Italian: [
      // Pizza
      { id: 61, name: 'Margherita Pizza', price: 350, image: '🍕', category: 'Pizza', rating: 4.5, time: '20 min' },
      { id: 62, name: 'Pepperoni Pizza', price: 420, image: '🍕', category: 'Pizza', rating: 4.7, time: '22 min' },
      { id: 63, name: 'Veggie Supreme', price: 380, image: '🍕', category: 'Pizza', rating: 4.4, time: '25 min' },
      
      // Pasta
      { id: 64, name: 'Spaghetti Carbonara', price: 320, image: '🍝', category: 'Pasta', rating: 4.6, time: '18 min' },
      { id: 65, name: 'Penne Arrabbiata', price: 280, image: '🍝', category: 'Pasta', rating: 4.5, time: '16 min' },
      { id: 66, name: 'Fettuccine Alfredo', price: 350, image: '🍝', category: 'Pasta', rating: 4.7, time: '20 min' },
      
      // Risotto
      { id: 67, name: 'Mushroom Risotto', price: 380, image: '🍚', category: 'Risotto', rating: 4.6, time: '25 min' },
      { id: 68, name: 'Seafood Risotto', price: 450, image: '🍚', category: 'Risotto', rating: 4.8, time: '28 min' }
    ],
    Thai: [
      // Curry
      { id: 69, name: 'Green Curry', price: 280, image: '🍛', category: 'Curry', rating: 4.6, time: '18 min' },
      { id: 70, name: 'Red Curry', price: 300, image: '🍛', category: 'Curry', rating: 4.7, time: '20 min' },
      { id: 71, name: 'Massaman Curry', price: 320, image: '🍛', category: 'Curry', rating: 4.5, time: '22 min' },
      
      // Pad Thai
      { id: 72, name: 'Chicken Pad Thai', price: 250, image: '🍜', category: 'Pad Thai', rating: 4.5, time: '15 min' },
      { id: 73, name: 'Prawn Pad Thai', price: 300, image: '🍜', category: 'Pad Thai', rating: 4.6, time: '18 min' },
      
      // Stir Fry
      { id: 74, name: 'Basil Chicken', price: 220, image: '🥢', category: 'Stir Fry', rating: 4.4, time: '12 min' },
      { id: 75, name: 'Cashew Chicken', price: 280, image: '🥢', category: 'Stir Fry', rating: 4.6, time: '15 min' }
    ]
  };

  const addToOrder = (item) => {
    const existingItem = orderItems.find(orderItem => orderItem.id === item.id);
    if (existingItem) {
      setOrderItems(orderItems.map(orderItem =>
        orderItem.id === item.id
          ? { ...orderItem, quantity: orderItem.quantity + 1 }
          : orderItem
      ));
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromOrder = (itemId) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromOrder(itemId);
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return orderItems.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredItems = () => {
    let items = menuItems[selectedCuisine] || [];
    
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };

  // Reset category when cuisine changes
  useEffect(() => {
    setSelectedCategory('All');
  }, [selectedCuisine]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-[#0b1d34] text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold"> 🍽️ Restaurant Management System</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="text-sm">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Table 12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuisine Categories */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 text-xs">
        {cuisines.map((cuisine) => (
  <button
    key={cuisine.name}
    onClick={() => setSelectedCuisine(cuisine.name)}
    style={{
      backgroundColor: selectedCuisine === cuisine.name ? cuisine.color : '#f3f4f6', // gray-100 fallback
      color: selectedCuisine === cuisine.name ? '#fff' : '#374151', // white or gray-700
    }}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:brightness-110`}
  >
    <span className="text-xl">{cuisine.icon}</span>
    <span>{cuisine.name}</span>
  </button>
))}

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Categories */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xs font-bold text-gray-800">{selectedCuisine} Categories</h2>
          </div>
          <div className="p-4">
            {categoryByCuisine[selectedCuisine]?.map((category) => (
             <motion.button
  key={category.name}
  onClick={() => setSelectedCategory(category.name)}
  whileHover={{ scale: 1.03, x: 5 }}       // slide & scale effect
  whileTap={{ scale: 0.98 }}               // tap effect
  transition={{ type: "spring", stiffness: 300 }}
  className={`w-full text-left p-2 mb-1 rounded-md font-medium transition-all duration-200 flex items-center space-x-2 ${
    selectedCategory === category.name
      ? 'bg-green-600 text-white'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  <span className="text-base">{category.icon}</span>     {/* smaller icon */}
  <span className="text-xs">{category.name}</span>       {/* smaller text */}
</motion.button>

            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Search Bar */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search ${selectedCuisine} items...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Menu Grid and Order Summary */}
          <div className="flex-1 flex">
            {/* Menu Items Grid */}
            <div className="flex-1 p-4">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-800">
                  {selectedCuisine} - {selectedCategory} ({filteredItems().length} items)
                </h3>
              </div>
             <div className="grid grid-cols-5 gap-3"> {/* smaller tiles by increasing columns */}
  {filteredItems().map((item) => (
    <motion.div
      key={item.id}
      className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={() => addToOrder(item)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-2"> {/* reduced padding */}
        <div className="text-center mb-2">
          <div className="text-2xl mb-1">{item.image}</div> {/* smaller emoji */}
          <h3 className="font-semibold text-gray-800 text-xs">{item.name}</h3> {/* smaller text */}
        </div>
        <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{item.rating}</span>
          </div>
          <span>{item.time}</span>
        </div>
        <div className="text-center">
          <span className="text-sm font-bold text-green-600">₹{item.price}</span>
        </div>
      </div>
    </motion.div>
  ))}
</div>

            </div>

            {/* Order Summary Sidebar */}
            <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2 text-green-600" />
                  Order Summary ({getTotalItems()})
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {orderItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in order</p>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item) => (
                                          <div key={item.id} className="bg-gray-100 rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                         <motion.button
                         whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
 
  className="bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full"
  onClick={() => updateQuantity(item.id, item.quantity + 1)}
>
  <Plus className="w-4 h-4" />
</motion.button>
                          
                         
                          <span className="text-sm font-medium">{item.quantity}</span>
                         <motion.button
  whileTap={{ scale: 0.85 }}
  className="bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full"
  onClick={() => updateQuantity(item.id, item.quantity - 1)}
>
  <Minus className="w-4 h-4" />
</motion.button>
                            
                         
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total and Checkout Button */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-green-600">₹{getTotalAmount()}</span>
                </div>
               <motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
  disabled={orderItems.length === 0}
>
  Proceed to Checkout
</motion.button>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPOS;
