import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useSPCOutlook } from '../hooks/useSPCOutlook';
import { getNextIssuanceTime } from '../utils/outlookSchedule';
import './OutlookCard.css';

export const OutlookCard = ({ day }) => {
  const [selectedView, setSelectedView] = useState('categorical');
  const transformRef = useRef(null);
  const outlook = useSPCOutlook(day);

  // Auto-select first available view when outlook data loads
  useEffect(() => {
    if (!outlook.loading && !outlook[selectedView]) {
      if (outlook.categorical) setSelectedView('categorical');
      else if (outlook.tornado) setSelectedView('tornado');
      else if (outlook.wind) setSelectedView('wind');
      else if (outlook.hail) setSelectedView('hail');
    }
  }, [outlook, selectedView]);

  // Reset zoom when view changes
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
  }, [selectedView, outlook[selectedView]]);

  const getTitle = () => {
    return `Day ${day} Convective Outlook`;
  };

  const formatNextIssuance = () => {
    const nextTime = getNextIssuanceTime(day);
    if (!nextTime) return null;
    
    const now = new Date();
    const diffMs = nextTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Next update in ~${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `Next update in ~${diffMinutes}m`;
    } else {
      return 'Update expected now';
    }
  };

  const renderImage = () => {
    const imageUrl = outlook[selectedView];
    
    if (!imageUrl) {
      return <div className="no-image">No {selectedView} outlook available</div>;
    }

    return (
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={1}
        maxScale={4}
        doubleClick={{ 
          disabled: false,
          mode: 'reset',
          animationTime: 200
        }}
        pinch={{ 
          disabled: false
        }}
        wheel={{ 
          disabled: false,
          step: 0.3 
        }}
        panning={{ 
          disabled: false 
        }}
        smooth={false}
        alignmentAnimation={{
          disabled: true
        }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img 
            src={imageUrl} 
            alt={`Day ${day} ${selectedView} outlook`}
            className="outlook-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </TransformComponent>
      </TransformWrapper>
    );
  };

  if (outlook.loading) {
    return (
      <div className="outlook-card">
        <h2>{getTitle()}</h2>
        <div className="loading">Loading outlook data...</div>
      </div>
    );
  }

  if (outlook.error) {
    return (
      <div className="outlook-card">
        <h2>{getTitle()}</h2>
        <div className="error">Error: {outlook.error}</div>
        <button onClick={outlook.refresh}>Retry</button>
      </div>
    );
  }

  return (
    <div className="outlook-card">
      <div className="outlook-header">
        <div className="outlook-title-row">
          <h2>{getTitle()}</h2>
          <select 
            value={selectedView} 
            onChange={(e) => setSelectedView(e.target.value)}
            className="view-selector"
          >
            {outlook.categorical && <option value="categorical">Categorical</option>}
            {outlook.tornado && <option value="tornado">Tornado</option>}
            {outlook.wind && <option value="wind">Wind</option>}
            {outlook.hail && <option value="hail">Hail</option>}
          </select>
        </div>
        <div className="outlook-meta">
          <div className="status-info">
            {outlook.allImagesLoaded && (
              <span className="auto-refresh-status inactive">
                All images loaded
              </span>
            )}
            {!outlook.allImagesLoaded && outlook.isWithinWindow && (
              <span className="auto-refresh-status active">
                New outlook due soon. Auto-refreshing.
              </span>
            )}
            {!outlook.allImagesLoaded && !outlook.isWithinWindow && (
              <span className="auto-refresh-status inactive">
                {formatNextIssuance()}
              </span>
            )}
          </div>
          <span className="last-updated">
            Last updated: {outlook.lastUpdated?.toLocaleTimeString()}
          </span>
          <button onClick={outlook.refresh} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="outlook-content">
        {renderImage()}
        {outlook.categorical && (
          <img 
            src={outlook.categorical} 
            alt="Preload categorical"
            style={{ display: 'none' }}
            onLoad={() => outlook.markImageLoaded('categorical')}
            onError={() => outlook.markImageLoaded('categorical')}
          />
        )}
        {outlook.tornado && (
          <img 
            src={outlook.tornado} 
            alt="Preload tornado"
            style={{ display: 'none' }}
            onLoad={() => outlook.markImageLoaded('tornado')}
            onError={() => outlook.markImageLoaded('tornado')}
          />
        )}
        {outlook.wind && (
          <img 
            src={outlook.wind} 
            alt="Preload wind"
            style={{ display: 'none' }}
            onLoad={() => outlook.markImageLoaded('wind')}
            onError={() => outlook.markImageLoaded('wind')}
          />
        )}
        {outlook.hail && (
          <img 
            src={outlook.hail} 
            alt="Preload hail"
            style={{ display: 'none' }}
            onLoad={() => outlook.markImageLoaded('hail')}
            onError={() => outlook.markImageLoaded('hail')}
          />
        )}
        <div className="no-image" style={{ display: 'none' }}>
          Failed to load image
        </div>
        {outlook[selectedView] && (
          <div className="zoom-hint">
            Pinch to zoom
            <button 
              className="reset-zoom-btn"
              onClick={() => transformRef.current?.resetTransform()}
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {outlook.text && (
        <details className="outlook-text">
          <summary>View Text Discussion</summary>
          <pre>{outlook.text}</pre>
        </details>
      )}
    </div>
  );
};
