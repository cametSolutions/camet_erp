import { v2 as cloudinary } from "cloudinary"; 

export const deleteImageFromCloudinary = async (publicId) => {
      console.log("Deleting image with public ID:", publicId);

  try {
    await cloudinary.uploader.destroy(publicId, {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log(
      `Successfully deleted image from Cloudinary: ${publicId}`
    );
  } catch (deleteError) {
    console.error(
      "Error deleting image from Cloudinary:",
      deleteError
    );
    throw new Error("Failed to delete image from Cloudinary");
  }
};
