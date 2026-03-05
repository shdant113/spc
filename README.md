# SPC Outlook Viewer

A mobile-friendly React application for viewing Storm Prediction Center (SPC) convective outlooks as soon as they are released.

## About

This application displays real-time convective outlooks from the NOAA Storm Prediction Center, including:

- **Day 1 Outlook**: Updated at 0600Z, 1300Z, 1630Z, 2000Z, and 0100Z
- **Day 2 Outlook**: Updated at 0600Z and 1730Z
- **Day 3 Outlook**: Updated at 0730Z

Each outlook includes:
- Categorical risk maps showing overall severe weather threat levels
- Probabilistic tornado, wind, and hail outlooks (Day 1 and Day 2 only)
- Full text discussion from SPC forecasters

## Features

- **Smart Refresh Schedule**: Automatically polls for new outlooks every 60 seconds when within 30 minutes of an issuance time. Outside of these windows, no automatic refreshes occur to minimize server load.
- **Mobile Responsive**: Optimized for mobile viewing with tap-to-zoom and pinch-to-zoom support for detailed map inspection.
- **Fast Loading**: Images are fetched directly from the SPC partners directory for the fastest possible updates. Further work is needed to determine if there are any potential improvements to be made here. Submit a suggestion if so.

## Data Source

All outlook data is provided by the [NOAA Storm Prediction Center](https://www.spc.noaa.gov/). This is an unofficial viewer - always refer to official SPC products for decision-making.

Image data: `https://www.spc.noaa.gov/partners/outlooks/national/`  
Text products: `https://www.spc.noaa.gov/products/outlook/`

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
- Vite
- CSS3 with mobile-first responsive design

## License

This project is for educational and informational purposes. All weather data and imagery are provided by NOAA/NWS and remain in the public domain.
