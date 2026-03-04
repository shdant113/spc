import { useState, useEffect } from 'react';
import { useSPCOutlook } from '../hooks/useSPCOutlook';
import { getNextIssuanceTime } from '../utils/outlookSchedule';
import './OutlookCard.css';

export const OutlookCard = ({ day }) => {
  const [selectedView, setSelectedView] = useState('categorical');
  const [isZoomed, setIsZoomed] = useState(false);
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
      <img 
        src={imageUrl} 
        alt={`Day ${day} ${selectedView} outlook`}
        className={`outlook-image ${isZoomed ? 'zoomed' : ''}`}
        onClick={() => setIsZoomed(!isZoomed)}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
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
        <h2>{getTitle()}</h2>
        <div className="outlook-meta">
          <div className="status-info">
            {outlook.isWithinWindow && (
              <span className="auto-refresh-status active">
                Auto-refreshing every 60s
              </span>
            )}
            {!outlook.isWithinWindow && (
              <span className="auto-refresh-status inactive">
                {formatNextIssuance()}
              </span>
            )}
          </div>
          <span className="last-updated">
            Last updated: {outlook.lastUpdated?.toLocaleTimeString()}
          </span>
          <button onClick={outlook.refresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="outlook-controls">
        {outlook.categorical && (
          <button 
            className={selectedView === 'categorical' ? 'active' : ''}
            onClick={() => {
              setSelectedView('categorical');
              setIsZoomed(false);
            }}
          >
            Categorical
          </button>
        )}
        {outlook.tornado && (
          <button 
            className={selectedView === 'tornado' ? 'active' : ''}
            onClick={() => {
              setSelectedView('tornado');
              setIsZoomed(false);
            }}
          >
            Tornado
          </button>
        )}
        {outlook.wind && (
          <button 
            className={selectedView === 'wind' ? 'active' : ''}
            onClick={() => {
              setSelectedView('wind');
              setIsZoomed(false);
            }}
          >
            Wind
          </button>
        )}
        {outlook.hail && (
          <button 
            className={selectedView === 'hail' ? 'active' : ''}
            onClick={() => {
              setSelectedView('hail');
              setIsZoomed(false);
            }}
          >
            Hail
          </button>
        )}
      </div>

      <div className="outlook-content">
        {renderImage()}
        <div className="no-image" style={{ display: 'none' }}>
          Failed to load image
        </div>
        {!isZoomed && outlook[selectedView] && (
          <div className="zoom-hint">
            Tap to zoom • Pinch to zoom
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
