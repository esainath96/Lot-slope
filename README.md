<div align="center">
  <img src="./public/logo.jpg" alt="LotSlope Logo" width="120" style="border-radius: 24px; margin-bottom: 20px;" />
  
  # LotSlope 🏔️
  
  **Instantly discover if a real estate lot is flat, sloped, or steep.**
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg)](https://vitejs.dev/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

</div>

---

## 📖 About LotSlope

LotSlope is a lightning-fast, purely client-side web application designed to help home buyers, real estate agents, and developers quickly assess the terrain of any given address. 

Instead of dealing with complex GIS software or expensive topography reports, LotSlope gives you a playful, instant verdict using 100% free, public APIs. It requires **zero backend** and costs **$0 to run**.

## ✨ Features

- 📍 **Instant Geocoding**: Type any address, and it instantly converts it to coordinates using the Nominatim free public service.
- 🗺️ **Interactive Map**: Drag, drop, and click anywhere on the Leaflet map to analyze custom locations instantly via reverse-geocoding.
- ⛰️ **Elevation Sampling**: Automatically generates a bounding box (approximate lot size) and samples the elevation at all four corners using the Open-Elevation API.
- 🎛️ **Customizable Thresholds**: Adjust what you consider "flat" or "steep" (in feet) using the intuitive UI, and the results update dynamically.
- 🎨 **Playful UI**: Features a bright, Duolingo-inspired chunky design with satisfying interactive elements and responsive mobile layouts.

## ⚙️ How It Works (The Technical Magic)

Because LotSlope has no backend, everything happens directly in the browser:

1. **Forward Geocoding**: When you search an address, we call the `nominatim.openstreetmap.org/search` API to get the center `[lat, lng]`.
2. **Bounding Box**: We mathematically generate a bounding box around the center coordinate to approximate the lot corners (NW, NE, SW, SE).
3. **Elevation Query**: We batch query the 4 corner coordinates against `api.open-elevation.com/api/v1/lookup`.
4. **Analysis**: We convert the resulting meters to feet, calculate the maximum elevation delta (highest point minus lowest point), and run it against the user's defined thresholds to output a verdict.

## 🚀 Getting Started (Local Development)

To run LotSlope locally, you'll need [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/lotslope.git
   cd lotslope
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:** Navigate to `http://localhost:5173`.

## 🌐 Deployment (GitHub Pages)

LotSlope is the perfect candidate for free hosting via GitHub Pages since it requires no database or server.

1. In `vite.config.ts`, add the `base` property if deploying to a subfolder:
   ```typescript
   export default defineConfig({
     plugins: [react()],
     base: '/lotslope/', // Required if deploying to username.github.io/lotslope
   })
   ```
2. Run the deployment script:
   ```bash
   npm run deploy
   ```
   *(Ensure you have pushed your code to GitHub first!)*

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

*Please note: The public Nominatim and Open-Elevation APIs have rate limits. If you are adding features that make heavy API calls, please ensure you respect their fair usage policies by debouncing and batching requests.*

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
