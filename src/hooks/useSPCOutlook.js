import { useState, useEffect, useCallback } from 'react';
import { getRefreshInterval, isWithinIssuanceWindow } from '../utils/outlookSchedule';

/**
 * Hook to fetch and manage SPC outlook data.
 * 
 * Day 4-8 not made available yet. Day 1-3 is available with all categorical 
 * hazards for Days 1 and 2. Text is still in flight, currently drawn directly
 * from SPC but there is probably a better way to do this in the future
 * so that it loads immediately is not reliant on the slow SPC site. TBD.
 * 
 * @param {number} day - Day number (1, 2, or 3)
 */
export const useSPCOutlook = (day) => {
  const [outlookData, setOutlookData] = useState({
    categorical: null,
    tornado: null,
    wind: null,
    hail: null,
    text: null,
    lastUpdated: null,
    loading: true,
    error: null,
    isWithinWindow: false
  });
  
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [allImagesLoaded, setAllImagesLoaded] = useState(false);

  const baseUrl = 'https://www.spc.noaa.gov/partners/outlooks/national';

  // Generate image URLs with timestamp to bust cache
  const getImageUrls = useCallback(() => {
    const timestamp = Date.now();
    const urls = {
      categorical: `${baseUrl}/swody${day}.png?t=${timestamp}`
    };
    
    if (day !== 3) {
      urls.tornado = `${baseUrl}/swody${day}_TORN.png?t=${timestamp}`;
      urls.wind = `${baseUrl}/swody${day}_WIND.png?t=${timestamp}`;
      urls.hail = `${baseUrl}/swody${day}_HAIL.png?t=${timestamp}`;
    }
    
    return urls;
  }, [day]);

  // Fetch text product via proxy or direct (will depend on CORS)
  const fetchText = useCallback(async () => {
    try {
      // Text products are only available in the products directory
      const productsTextUrl = `https://www.spc.noaa.gov/products/outlook/day${day}otlk.html`;
      const productsResponse = await fetch(productsTextUrl);
      if (productsResponse.ok) {
        const html = await productsResponse.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const preElement = doc.querySelector('pre');
        return preElement ? preElement.textContent : null;
      }
      
      return null;
    } catch (error) {
      // Silently handle errors - text products may be CORS-blocked or unavailable
      console.debug('Text product not available:', error.message);
      return null;
    }
  }, [day]);

  const fetchOutlooks = useCallback(async () => {
    setOutlookData(prev => ({ ...prev, loading: true, error: null }));
    setLoadedImages(new Set());
    setAllImagesLoaded(false);
    
    try {
      const imageUrls = getImageUrls();
      const text = await fetchText();

      setOutlookData({
        categorical: imageUrls.categorical,
        tornado: imageUrls.tornado || null,
        wind: imageUrls.wind || null,
        hail: imageUrls.hail || null,
        text,
        lastUpdated: new Date(),
        loading: false,
        error: null,
        isWithinWindow: isWithinIssuanceWindow(day, 30)
      });
    } catch (error) {
      console.error('Error fetching outlooks:', error);
      setOutlookData(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isWithinWindow: isWithinIssuanceWindow(day, 30)
      }));
    }
  }, [day, getImageUrls, fetchText]);

  useEffect(() => {
    fetchOutlooks();
  }, [fetchOutlooks]);

  // Mark an image as loaded
  const markImageLoaded = useCallback((viewType) => {
    setLoadedImages(prev => {
      const newSet = new Set(prev);
      newSet.add(viewType);
      return newSet;
    });
  }, []);
  
  // Check if all available images are loaded
  useEffect(() => {
    const availableViews = [];
    if (outlookData.categorical) availableViews.push('categorical');
    if (outlookData.tornado) availableViews.push('tornado');
    if (outlookData.wind) availableViews.push('wind');
    if (outlookData.hail) availableViews.push('hail');
    
    if (availableViews.length > 0) {
      const allLoaded = availableViews.every(view => loadedImages.has(view));
      if (allLoaded && !allImagesLoaded) {
        console.log(`All Day ${day} images loaded - stopping auto-refresh`);
        setAllImagesLoaded(true);
      }
    }
  }, [loadedImages, outlookData, day, allImagesLoaded]);

  // Set up smart polling based on issuance schedule
  useEffect(() => {
    const refreshInterval = getRefreshInterval(day);
    
    if (refreshInterval && !allImagesLoaded) {
      console.log(`Auto-refresh enabled for Day ${day}: checking every ${refreshInterval / 1000}s`);
      const interval = setInterval(fetchOutlooks, refreshInterval);
      return () => clearInterval(interval);
    } else if (allImagesLoaded) {
      console.log(`Auto-refresh disabled for Day ${day}: all images loaded`);
    } else {
      console.log(`Auto-refresh disabled for Day ${day}: outside issuance window`);
    }
  }, [fetchOutlooks, day, allImagesLoaded]);

  // Check window status every minute to update UI
  useEffect(() => {
    const checkWindow = setInterval(() => {
      setOutlookData(prev => ({
        ...prev,
        isWithinWindow: isWithinIssuanceWindow(day, 30)
      }));
    }, 60000);
    
    return () => clearInterval(checkWindow);
  }, [day]);

  return {
    ...outlookData,
    refresh: fetchOutlooks,
    markImageLoaded,
    allImagesLoaded
  };
};
