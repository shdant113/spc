/**
 * SPC Outlook Issuance Times (UTC)
 * Day 1: 0600Z, 1300Z, 1630Z, 2000Z, 0100Z (next day)
 * Day 2: 0700Z, 1730Z
 * Day 3: 0730Z
 * Day 4-8: 1000Z (not implemented yet)
 */

const ISSUANCE_TIMES = {
  1: [
    { hour: 6, minute: 0 },   // 0600Z
    { hour: 13, minute: 0 },  // 1300Z
    { hour: 16, minute: 30 }, // 1630Z
    { hour: 20, minute: 0 },  // 2000Z
    { hour: 1, minute: 0 }    // 0100Z
  ],
  2: [
    { hour: 7, minute: 0 },   // 0700Z
    { hour: 17, minute: 30 }  // 1730Z
  ],
  3: [
    { hour: 7, minute: 30 }   // 0730Z
  ]
};

/**
 * Check if current time is within a time window of any issuance time
 * @param {number} day - Outlook day (1, 2, or 3)
 * @param {number} windowMinutes - Window size in minutes (default: 30)
 * @returns {boolean} - True if within window of an issuance time
 */
export const isWithinIssuanceWindow = (day, windowMinutes = 30) => {
  const now = new Date();
  const currentUTC = new Date(now.getTime());
  
  const issuanceTimes = ISSUANCE_TIMES[day] || [];
  
  for (const { hour, minute } of issuanceTimes) {
    // Create a UTC time for today with the issuance hour/minute
    const issuanceTime = new Date(Date.UTC(
      currentUTC.getUTCFullYear(),
      currentUTC.getUTCMonth(),
      currentUTC.getUTCDate(),
      hour,
      minute,
      0
    ));
    
    const diffMinutes = Math.abs((currentUTC - issuanceTime) / (1000 * 60));
    
    if (diffMinutes <= windowMinutes) {
      return true;
    }
    
    // Also check yesterday and tomorrow for the same time (for edge cases around midnight)
    const yesterday = new Date(issuanceTime);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const diffYesterday = Math.abs((currentUTC - yesterday) / (1000 * 60));
    
    const tomorrow = new Date(issuanceTime);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const diffTomorrow = Math.abs((currentUTC - tomorrow) / (1000 * 60));
    
    if (diffYesterday <= windowMinutes || diffTomorrow <= windowMinutes) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get the appropriate refresh interval based on issuance schedule.
 * 
 * If within 30 minutes of an expected issuance time, returns 60 seconds to enable smart polling.
 * Otherwise, returns null to disable auto-refresh.
 * 
 * @param {number} day - Outlook day (1, 2, or 3)
 * @returns {number|null} - Refresh interval in milliseconds, or null for no refresh
 */
export const getRefreshInterval = (day) => {
  if (isWithinIssuanceWindow(day, 30)) {
    return 60000; // 60 seconds when within 30-minute window
  }
  return null; 
};

/**
 * Get next issuance time for display
 * @param {number} day - Outlook day (1, 2, or 3)
 * @returns {Date|null} - Next issuance time or null
 */
export const getNextIssuanceTime = (day) => {
  const now = new Date();
  const currentUTC = new Date(now.getTime());
  
  const issuanceTimes = ISSUANCE_TIMES[day] || [];
  let nextTime = null;
  let minDiff = Infinity;
  
  for (const { hour, minute } of issuanceTimes) {
    const issuanceTime = new Date(Date.UTC(
      currentUTC.getUTCFullYear(),
      currentUTC.getUTCMonth(),
      currentUTC.getUTCDate(),
      hour,
      minute,
      0
    ));
    
    const diff = issuanceTime - currentUTC;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextTime = issuanceTime;
    }
    
    // Check tomorrow
    const tomorrow = new Date(issuanceTime);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const diffTomorrow = tomorrow - currentUTC;
    if (diffTomorrow > 0 && diffTomorrow < minDiff) {
      minDiff = diffTomorrow;
      nextTime = tomorrow;
    }
  }
  
  return nextTime;
};
