
const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
const cloud_name = import.meta.env.VITE_CLOUD_NAME;
const api_key = import.meta.env.API_KEY;

// console.log("API Key:", api_key);
// console.log("Cloud Name:", cloud_name);
// console.log("Upload Preset:", upload_preset);



const uploadImageToCloudinary = async (file) => {
  const uploadData = new FormData();

  uploadData.append("file", file);
  uploadData.append("upload_preset", 'Camet-IT-Solutions');
  uploadData.append("cloud_name", cloud_name);
  uploadData.append("api_key", 563411627733318);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
    {
      method: "post",
      body: uploadData,
    }
  );

  const data = await res.json();
  return data;
};

export default uploadImageToCloudinary;
