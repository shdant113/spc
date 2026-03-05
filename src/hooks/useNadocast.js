import { useState, useEffect, useCallback } from 'react';
import { getRefreshInterval, isWithinIssuanceWindow } from '../utils/nadocastSchedule';

/**
 * Hook to fetch and manage Nadocast data.
 * Supports both 00z and 12z runs.
 * Supports both 2022 and 2024 models.
 * 00z runs only have day 1 (today).
 * 12z runs have day 1 (today) and day 2 (tomorrow).
 * 
 * Polls every 60 seconds during issuance windows:
 * - 00z run: 00z to 05z
 * - 12z run: 12z to 17z
 * 
 * Stops polling once data is successfully loaded.
 * 
 * Brian if you read this and think I'm a nasty bot crawler don't get mad at me, I'm sorry.
 * 
 * @param {string} run - Run time: '00z' or '12z'
 * @param {number} day - Day number: 1 or 2 (only 1 is valid for 00z)
 * @param {string} model - Model version: '2022' or '2024'
 */
export const useNadocast = (run = '00z', day = 1, model = '2022') => {
  const [nadocastData, setNadocastData] = useState({
    tornado: null,
    wind: null,
    hail: null,
    lastUpdated: null,
    loading: true,
    error: null,
    isWithinWindow: false,
    dataLoaded: false
  });

  // Generate image URLs based on current date and run type
  const getImageUrls = useCallback(() => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const dayStr = String(now.getUTCDate()).padStart(2, '0');
    
    const yearMonth = `${year}${month}`;
    const dateStr = `${year}${month}${dayStr}`;
    
    let runPath, runStr, forecastHours;
    
    if (run === '00z') {
      runPath = 't0z';
      runStr = 't00z';
      forecastHours = 'f12-35';
    } else if (run === '12z') {
      runPath = 't12z';
      runStr = 't12z';
      forecastHours = day === 1 ? 'f02-23' : 'f26-47';
    }
    
    // Determine model string for URL
    const modelStr = model === '2024' ? '2024_preliminary_models' : '2022_models';
    
    const baseUrl = `http://data.nadocast.com/${yearMonth}/${dateStr}/${runPath}`;
    const timestamp = Date.now(); // Cache busting
    
    return {
      tornado: `${baseUrl}/nadocast_${modelStr}_conus_tornado_${dateStr}_${runStr}_${forecastHours}.png?t=${timestamp}`,
      hail: `${baseUrl}/nadocast_${modelStr}_conus_hail_${dateStr}_${runStr}_${forecastHours}.png?t=${timestamp}`,
      wind: `${baseUrl}/nadocast_${modelStr}_conus_wind_${dateStr}_${runStr}_${forecastHours}.png?t=${timestamp}`
    };
  }, [run, day, model]);

  const fetchData = useCallback(async () => {
    try {
      const urls = getImageUrls();
      const inWindow = isWithinIssuanceWindow(run);
      
      setNadocastData(prev => ({
        tornado: urls.tornado,
        wind: urls.wind,
        hail: urls.hail,
        lastUpdated: new Date(),
        loading: false,
        error: null,
        isWithinWindow: inWindow,
        dataLoaded: prev.dataLoaded // preserve dataLoaded state
      }));
    } catch (error) {
      setNadocastData(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isWithinWindow: isWithinIssuanceWindow(run)
      }));
    }
  }, [getImageUrls, run]);

  // Callback for component to signal successful image load
  const markDataLoaded = useCallback(() => {
    setNadocastData(prev => ({
      ...prev,
      dataLoaded: true
    }));
  }, []);

  // Manual refresh function
  const refresh = useCallback(() => {
    setNadocastData(prev => ({ ...prev, loading: true, dataLoaded: false }));
    fetchData();
  }, [fetchData]);

  // Initial fetch and refetch when run, day, or model changes
  useEffect(() => {
    setNadocastData(prev => ({ ...prev, dataLoaded: false })); // reset dataLoaded on change
    fetchData();
  }, [fetchData]);

  // Set up polling interval based on schedule and dataLoaded state
  useEffect(() => {
    const interval = getRefreshInterval(run, nadocastData.dataLoaded);
    
    if (interval) {
      const timer = setInterval(() => {
        fetchData();
      }, interval);
      
      return () => clearInterval(timer);
    }
  }, [run, nadocastData.dataLoaded, fetchData]);

  return {
    ...nadocastData,
    refresh,
    markDataLoaded
  };
};
