import { useState } from 'react'
import { OutlookCard } from './components/OutlookCard'
import './App.css'

function App() {
  const [selectedDay, setSelectedDay] = useState(1);

  return (
    <div className="app">
      <header className="app-header">
        <h1>SPC Outlooks For Your Phone</h1>
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
      </header>

      <main className="app-main">
        <OutlookCard day={selectedDay} />
      </main>

      <footer className="app-footer">
        <p>
          Data from <a href="https://www.spc.noaa.gov/" target="_blank" rel="noopener noreferrer">
            NOAA Storm Prediction Center
          </a>
        </p>
        <p className="disclaimer">
          This is an unofficial viewer. Always refer to official SPC products for decision-making.
        </p>
      </footer>
    </div>
  )
}

export default App
