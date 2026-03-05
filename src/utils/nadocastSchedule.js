/**
 * Nadocast issuance schedule management
 * 
 * 00z run: Available between 00z and 05z
 * 12z run: Available between 12z and 17z
 */

const ISSUANCE_WINDOWS = {
  '00z': {
    startHour: 0,
    endHour: 5
  },
  '12z': {
    startHour: 12,
    endHour: 17
  }
};

/**
 * Check if current time is within the issuance window for a given run
 * @param {string} run - Run time ('00z' or '12z')
 * @returns {boolean} - True if within window
 */
export const isWithinIssuanceWindow = (run) => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  const window = ISSUANCE_WINDOWS[run];
  if (!window) return false;
  
  return currentHour >= window.startHour && currentHour < window.endHour;
};

/**
 * Get next issuance window start time for a given run
 * @param {string} run - Run time ('00z' or '12z')
 * @returns {Date|null} - Next issuance time
 */
export const getNextIssuanceTime = (run) => {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  const window = ISSUANCE_WINDOWS[run];
  if (!window) return null;
  
  const nextDate = new Date(now);
  nextDate.setUTCMinutes(0);
  nextDate.setUTCSeconds(0);
  nextDate.setUTCMilliseconds(0);
  
  // If we're before this run's window today, use today
  if (currentHour < window.startHour) {
    nextDate.setUTCHours(window.startHour);
    return nextDate;
  }
  
  // If we're in the window or past it, next window is tomorrow
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);
  nextDate.setUTCHours(window.startHour);
  return nextDate;
};

/**
 * Get the refresh interval based on whether we're in an issuance window
 * Returns null if not in window (no refresh), or 1 minute if in window
 * @param {string} run - Run time ('00z' or '12z')
 * @param {boolean} dataLoaded - Whether data has successfully loaded
 * @returns {number|null} - Refresh interval in milliseconds
 */
export const getRefreshInterval = (run, dataLoaded = false) => {
  // Don't poll if data is already loaded
  if (dataLoaded) {
    return null;
  }
  
  // Only poll once per minute during issuance windows
  if (isWithinIssuanceWindow(run)) {
    return 60000; // 1 minute
  }
  
  return null;
};
