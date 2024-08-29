import api from "./api";

export const fetchDataFromApi = async (url) => {
  try {
    const { data } = await api.get(url, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.log(error);
    throw error; // Throw error so that it can be caught by the caller
  }
};