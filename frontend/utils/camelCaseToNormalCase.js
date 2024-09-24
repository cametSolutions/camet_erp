export const camelToNormalCase = (str) => {
  // Replace capital letters with space followed by the letter in lowercase
  const result = str.replace(/([A-Z])/g, " $1");
  // Capitalize the first letter and trim any leading spaces
  return result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
};
