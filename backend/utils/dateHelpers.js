

//// Utility functions for date manipulation    
////// These functions help in converting date formats and ensuring UTC compliance with time set to midnight
export function convertToUTCMidnight (value) {
  if (!value) return value;

  const date = new Date(value);

  // Strip time part and set to UTC midnight
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}



/// convert date to future date
export function getFutureDate({ years = 0, months = 0 }) {

  console.log(years, months);
  
  const today = new Date();
  const futureDate = new Date(today);

  futureDate.setFullYear(futureDate.getFullYear() + years);
  futureDate.setMonth(futureDate.getMonth() + months);

  return futureDate;
}


//// check if expiry date is valid
//// expiry date should be greater or equal to manufacture date

export function isExpiryValid(manufactureDate, expiryDate) {
  const mfg = new Date(manufactureDate);
  const exp = new Date(expiryDate);

  return exp >= mfg;
}
