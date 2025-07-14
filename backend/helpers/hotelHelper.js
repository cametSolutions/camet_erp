import roomModal from "../models/roomModal.js";

// helper function used to add search concept with room
export const buildDatabaseFilterForRoom = (params) => {
  const filter = {
    cmp_id: params.cmp_id,
    primary_user_id: params.Primary_user_id,
  };
  console.log("params.type",params);
  if(params?.type !== "All"){
    filter.roomType = params.type;
  }

  // Add search functionality if search term is provided
  if (params.searchTerm) {
    filter.$or = [
      { roomName: { $regex: params.searchTerm, $options: "i" } },
    ];
  }

  return filter;
};

export const fetchRoomsFromDatabase = async (filter, params) => {

  // Count total products matching the filter for pagination
  const totalRooms = await roomModal.countDocuments(filter);
  // Build query with pagination
  let query = roomModal.find(filter);

  // Apply pagination if limit is specified
  if (params?.limit > 0) {
    query = query.skip(params?.skip).limit(params?.limit);
  }

  // Execute query with population and sorting
  const rooms = await query
    .sort({ roomName: 1 }).populate('priceLevel.priceLevel');

  return { rooms,totalRooms };
};


export const sendRoomResponse = (res, rooms, totalRooms, params) => {
  console.log(rooms.length);
  if (rooms && rooms.length > 0) {
    return res.status(200).json({
      roomData: rooms,
      pagination: {
        total: totalRooms,
        page: params.page,
        limit: params.limit,
        hasMore: params.skip + rooms.length < totalRooms,
      },
      message: "Rooms fetched successfully",
    });
  } else {
    return res.status(404).json({ 
      message: "No rooms were found matching the criteria" 
    });
  }
};