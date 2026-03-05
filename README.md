# SPC Outlook & Nadocast Mobile Viewer

A mobile-friendly React application for viewing Storm Prediction Center (SPC) convective outlooks and Nadocast ensemble forecasts as soon as they are released.

This app is specifically designed for your phone.

## About

This application provides real-time severe weather outlooks from two sources:

### SPC Outlooks

Convective outlooks from the NOAA Storm Prediction Center:

- **Day 1 Outlook**: Updated at 0600Z, 1300Z, 1630Z, 2000Z, and 0100Z
- **Day 2 Outlook**: Updated at 0600Z and 1730Z
- **Day 3 Outlook**: Updated at 0730Z

Each outlook includes:
- Categorical risk maps showing overall severe weather threat levels
- Probabilistic tornado, wind, and hail outlooks (Day 1 and Day 2 only)
- Full text discussion from SPC forecasters

### Nadocast Forecasts

Ensemble-based severe weather forecasts from [Nadocast](https://data.nadocast.com/):

- **00z Run**: Day 1 forecast, available 00:00-05:00 UTC
- **12z Run**: Day 1 and Day 2 forecasts, available 12:00-17:00 UTC

Both **2022 models** and **2024 preliminary models** are supported, with probabilistic outlooks for:
- Tornado
- Wind
- Hail

## Features

- **Dual Data Sources**: Switch between SPC and Nadocast forecasts with a dropdown selector
- **Smart Refresh Schedule**: 
  - **SPC**: Polls every 60 seconds when within 30 minutes of issuance times
  - **Nadocast**: Polls every 60 seconds during run windows (00z-05z and 12z-17z). Stops polling once data loads successfully.
- **Mobile Responsive**: Optimized for mobile viewing with pinch-to-zoom support for detailed map inspection
- **Fast Loading**: Images are fetched directly from source servers for the fastest possible updates
- **Multiple Model Support**: Compare 2022 and 2024 Nadocast models side-by-side

## Data Sources

### NOAA Storm Prediction Center

All SPC outlook data is provided by the [NOAA Storm Prediction Center](https://www.spc.noaa.gov/). This is an unofficial viewer - always refer to official SPC products for decision-making.

- Image data: `https://www.spc.noaa.gov/partners/outlooks/national/`  
- Text products: `https://www.spc.noaa.gov/products/outlook/`

### Nadocast

Nadocast data is provided by [Nadocast](https://data.nadocast.com/), an experimental ensemble-based severe weather forecasting system.

- Data source: `http://data.nadocast.com/`
- 2022 Models: Operational model suite
- 2024 Models: Preliminary experimental models

**Note**: Nadocast is an experimental product and should be used for research and educational purposes. Always refer to official NWS/SPC products for decision-making.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spc
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Viewing SPC Outlooks

1. Select "SPC Outlooks" from the dropdown at the top
2. Choose Day 1, Day 2, or Day 3
3. Select between Categorical, Tornado, Wind, or Hail outlooks (Day 1 and Day 2 only)
4. View the text discussion by expanding the "View Text Discussion" section

### Viewing Nadocast Forecasts

1. Select "Nadocast" from the dropdown at the top
2. Choose between 2022 Models or 2024 Models
3. Select the run time (00z or 12z)
4. For 12z runs, choose Day 1 or Day 2
5. Select the hazard type: Tornado, Wind, or Hail

### Image Zoom

- **Mobile**: Use pinch-to-zoom gestures to inspect maps in detail
- **Desktop**: Scroll wheel to zoom
- Click "Reset" button to return to normal zoom level

### Building for Production

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Deployment

GitHub Pages is configured and ready to use. It supports custom domains with free HTTPS.

**Quick Deploy:**
```bash
npm run deploy
```

## Technology Stack

- React 18
- Vite 5
- react-zoom-pan-pinch for image zoom functionality
- CSS3 with mobile-first responsive design

## License

This project is for educational and informational purposes. All weather data and imagery are provided by NOAA/NWS and remain in the public domain.
