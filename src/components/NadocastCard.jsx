import { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useNadocast } from '../hooks/useNadocast';
import { getNextIssuanceTime } from '../utils/nadocastSchedule';
import './NadocastCard.css';

export const NadocastCard = () => {
  const [selectedView, setSelectedView] = useState('tornado');
  const [selectedRun, setSelectedRun] = useState('00z');
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedModel, setSelectedModel] = useState('2022');
  const [imageError, setImageError] = useState(false);
  const transformRef = useRef(null);
  const nadocast = useNadocast(selectedRun, selectedDay, selectedModel);

  // Reset day to 1 when switching to 00z (since 00z only has day 1)
  // Also reset image error state when changing runs or models
  useEffect(() => {
    if (selectedRun === '00z') {
      setSelectedDay(1);
    }
    setImageError(false);
  }, [selectedRun, selectedDay, selectedModel]);

  // Reset zoom and error state when view changes
  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform();
    }
    setImageError(false);
  }, [selectedView, nadocast[selectedView]]);

  const getTitle = () => {
    const modelLabel = selectedModel === '2024' ? '2024' : '2022';
    if (selectedRun === '00z') {
      return `Nadocast Today (00z) - ${modelLabel}`;
    } else {
      return `Nadocast Day ${selectedDay} (12z) - ${modelLabel}`;
    }
  };

  const formatNextIssuance = () => {
    const nextTime = getNextIssuanceTime(selectedRun);
    if (!nextTime) return null;
    
    const now = new Date();
    const diffMs = nextTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `Next ${selectedRun} window in ~${diffHours}h ${diffMinutes}m`;
    } else if (diffMinutes > 0) {
      return `Next ${selectedRun} window in ~${diffMinutes}m`;
    } else {
      return `${selectedRun} window active now`;
    }
  };

  const renderImage = () => {
    const imageUrl = nadocast[selectedView];
    
    if (!imageUrl) {
      return <div className="no-image">No {selectedView} forecast available</div>;
    }

    if (imageError) {
      const modelLabel = selectedModel === '2024' ? '2024 (Preliminary)' : '2022';
      const runLabel = selectedRun === '12z' ? '12z' : '00z';
      return (
        <div className="nadocast-unavailable">
          <h3>{runLabel} run not available yet</h3>
          <p>The {modelLabel} {runLabel} forecast hasn't been published yet. Try switching models or runs, or check back later.</p>
          {selectedRun === '12z' && (
            <button onClick={() => setSelectedRun('00z')} className="switch-run-btn">
              Switch to 00z Run
            </button>
          )}
          {selectedModel === '2024' && (
            <button 
              onClick={() => setSelectedModel('2022')} 
              className="switch-run-btn"
              style={{ marginTop: '10px' }}
            >
              Switch to 2022 Models
            </button>
          )}
        </div>
      );
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
            alt={`Nadocast ${selectedView} forecast`}
            className="outlook-image"
            onLoad={() => {
              nadocast.markDataLoaded();
            }}
            onError={() => {
              setImageError(true);
            }}
          />
        </TransformComponent>
      </TransformWrapper>
    );
  };

  if (nadocast.loading) {
    return (
      <div className="outlook-card">
        <h2>{getTitle()}</h2>
        <div className="loading">Loading forecast data...</div>
      </div>
    );
  }

  if (nadocast.error) {
    return (
      <div className="outlook-card">
        <h2>{getTitle()}</h2>
        <div className="error">Error: {nadocast.error}</div>
        <button onClick={nadocast.refresh}>Retry</button>
      </div>
    );
  }



  return (
    <div className="outlook-card">
      <div className="outlook-header">
        <h2>{getTitle()}</h2>
        <div className="outlook-meta">
          <div className="status-info">
            {nadocast.isWithinWindow && !nadocast.dataLoaded && (
              <span className="auto-refresh-status active">
                Auto-refreshing every 60s
              </span>
            )}
            {nadocast.isWithinWindow && nadocast.dataLoaded && (
              <span className="auto-refresh-status inactive">
                Data loaded - polling stopped
              </span>
            )}
            {!nadocast.isWithinWindow && (
              <span className="auto-refresh-status inactive">
                {formatNextIssuance()}
              </span>
            )}
          </div>
          <span className="last-updated">
            Last updated: {nadocast.lastUpdated?.toLocaleTimeString()}
          </span>
          <button onClick={nadocast.refresh} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      <div className="outlook-controls">
        <button 
          className={selectedModel === '2022' ? 'active' : ''}
          onClick={() => setSelectedModel('2022')}
        >
          2022 Models
        </button>
        <button 
          className={selectedModel === '2024' ? 'active' : ''}
          onClick={() => setSelectedModel('2024')}
        >
          2024 Models
        </button>
      </div>

      <div className="outlook-controls" style={{ marginTop: '10px' }}>
        <button 
          className={selectedRun === '00z' ? 'active' : ''}
          onClick={() => setSelectedRun('00z')}
        >
          00z Run
        </button>
        <button 
          className={selectedRun === '12z' ? 'active' : ''}
          onClick={() => setSelectedRun('12z')}
        >
          12z Run
        </button>
      </div>

      {selectedRun === '12z' && (
        <div className="outlook-controls" style={{ marginTop: '10px' }}>
          <button 
            className={selectedDay === 1 ? 'active' : ''}
            onClick={() => setSelectedDay(1)}
          >
            Day 1
          </button>
          <button 
            className={selectedDay === 2 ? 'active' : ''}
            onClick={() => setSelectedDay(2)}
          >
            Day 2
          </button>
        </div>
      )}

      <div className="outlook-controls" style={{ marginTop: selectedRun === '12z' ? '10px' : '0' }}>
        <button 
          className={selectedView === 'tornado' ? 'active' : ''}
          onClick={() => setSelectedView('tornado')}
        >
          Tornado
        </button>
        <button 
          className={selectedView === 'wind' ? 'active' : ''}
          onClick={() => setSelectedView('wind')}
        >
          Wind
        </button>
        <button 
          className={selectedView === 'hail' ? 'active' : ''}
          onClick={() => setSelectedView('hail')}
        >
          Hail
        </button>
      </div>

      <div className="outlook-content">
        {renderImage()}
        {nadocast[selectedView] && !imageError && (
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
    </div>
  );
};
