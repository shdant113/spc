import { useState } from 'react'
import { OutlookCard } from './components/OutlookCard'
import { NadocastCard } from './components/NadocastCard'
import './App.css'

function App() {
  const [selectedView, setSelectedView] = useState('spc'); // 'spc' by default or 'nadocast'
  const [selectedDay, setSelectedDay] = useState(1);

  return (
    <div className="app">
      <div className="view-selector">
        <select 
          value={selectedView} 
          onChange={(e) => setSelectedView(e.target.value)}
          className="view-dropdown"
        >
          <option value="spc">SPC Outlooks</option>
          <option value="nadocast">Nadocast</option>
        </select>
      </div>

      <header className="app-header">
        <h1>{selectedView === 'spc' ? 'SPC Outlooks For Your Phone' : 'Nadocast Viewer For Your Phone'}</h1>
        {selectedView === 'spc' && (
          <div className="header-controls">
            <div className="day-selector">
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
              <button 
                className={selectedDay === 3 ? 'active' : ''}
                onClick={() => setSelectedDay(3)}
              >
                Day 3
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="app-main">
        {selectedView === 'spc' ? (
          <OutlookCard day={selectedDay} />
        ) : (
          <NadocastCard />
        )}
      </main>

      <footer className="app-footer">
        <p>
          {selectedView === 'spc' ? (
            <>
              Data from <a href="https://www.spc.noaa.gov/" target="_blank" rel="noopener noreferrer">
                NOAA Storm Prediction Center
              </a>
            </>
          ) : (
            <>
              Data from <a href="https://data.nadocast.com/" target="_blank" rel="noopener noreferrer">
                Nadocast
              </a>
            </>
          )}
        </p>
        <p className="disclaimer">
          This is an unofficial viewer. Always refer to official sources for decision-making.
        </p>
      </footer>
    </div>
  )
}

export default App
