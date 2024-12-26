import { countries } from "../../frontend/constants/countries.js";
import OragnizationModel from "../models/OragnizationModel.js";

export const formatToLocalDate = async (date, cmp_id) => {
  try {
    // Fetch the organization details using the company ID 
    const company = await OragnizationModel.findById(cmp_id);
    if (!company) {
      throw new Error("Company not found");
    }

    // Get the country associated with the company
    const countryName = company.country;

    // Find the timezone for the given country
    const countryData = countries.find((country) => country.countryName === countryName);
    if (!countryData) {
      throw new Error("Country not found in the list");
    }

    const timezone = countryData.timeZone;

    // Convert to the local date based on the timezone
    const localDate = new Date(date).toLocaleString("en-US", { timeZone: timezone });

    // Convert back to a Date object
    const dateObj = new Date(localDate);

    // Set the time to 00:00:00.000 in local timezone
    dateObj.setHours(0, 0, 0, 0);

    // Convert to UTC by creating a new Date with the same date and resetting timezone
    const utcDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
    // console.log("utcDate:", utcDate);
    

    return utcDate; // This is now in UTC with time set to 00:00:00.000
  } catch (error) {
    console.error("Error formatting date:", error.message);
    throw error;
  }
};