import productModel from "../models/productModel.js";
import restaurantModels from "../models/restaurantModels.js";
import roomModal from "../models/roomModal.js";
import product from "../models/productModel.js";

// helper function used to add search concept with room
export const buildDatabaseFilterForRoom = (params) => {
  const filter = {
    cmp_id: params.cmp_id,
    Primary_user_id: params.Primary_user_id,
  };
  console.log("params.type",params);
 

  // Add search functionality if search term is provided
  if (params.searchTerm) {
    filter.$or = [
      { product_name: { $regex: params.searchTerm, $options: "i" } },
    ];
  }

  return filter;
};

export const fetchRoomsFromDatabase = async (filter, params) => {

  // Count total products matching the filter for pagination
  const totalItems = await product.countDocuments(filter);
  // Build query with pagination
  let query = product.find(filter).populate("hsn_code")
  

  // Apply pagination if limit is specified
  if (params?.limit > 0) {
    query = query.skip(params?.skip).limit(params?.limit);
  }

  // Execute query with population and sorting
  const items = await query
    .sort({ itemName: 1 });

  return { items,totalItems };
};


export const sendRoomResponse = (res, items, totalItems, params) => {
  console.log(items?.length);
  if (items && items.length > 0) {
    return res.status(200).json({
      roomData: items,
      pagination: {
        total: totalItems,
        page: params.page,
        limit: params.limit,
        hasMore: params.skip + items.length < totalItems,
      },
      message: "Rooms fetched successfully",
    });
  } else {
    return res.status(404).json({ 
      message: "No rooms were found matching the criteria" 
    });
  }
};