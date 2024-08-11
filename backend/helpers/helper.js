
export const  truncateToNDecimals=(num, n)=> {
  const parts = num.toString().split(".");
  if (parts.length === 1) return num; // No decimal part
  parts[1] = parts[1].substring(0, n); // Truncate the decimal part
  return parseFloat(parts.join("."));
}


