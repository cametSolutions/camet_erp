

//// Utility functions for date manipulation    
////// These functions help in converting date formats and ensuring UTC compliance with time set to midnight
export function convertToUTCMidnight (value) {
  if (!value) return value;

  const date = new Date(value);

  // Strip time part and set to UTC midnight
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}
