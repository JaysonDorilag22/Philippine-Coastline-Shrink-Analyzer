# Philippine Coastline Shrink Analyzer

🌊 A visual and analytical web app that tracks and predicts shoreline changes in coastal communities across the Philippines.

![Philippine Coastline Analyzer](https://img.shields.io/badge/Status-Active%20Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18.2-blue)

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| 🗺️ **Coastline Comparison Map** | Interactive map showing past vs present coastlines using overlay (shapefiles or satellite imagery) |
| 🧠 **Shrink Risk Detection** | Identify areas with visible loss of landmass |
| 📈 **Trend Visualizer** | Show how much shoreline has moved inland (km² lost per year) |
| 🔮 **Future Projection** | Predict erosion rate for next few years based on past trends |
| 💾 **Data Upload / Auto Sync** | Auto-download or sync with open data (NAMRIA, NOAH, or public satellite archives) |

## 🧩 Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React + Leaflet.js (for map visualizations) |
| **Backend** | Node.js + Express (to serve data, run comparison logic) |
| **Database** | MongoDB (store coastline data, region info, shrinkage logs) |
| **GeoTools** | GeoJSON, Shapefile parser, @turf/turf (for geospatial difference) |
| **Scheduler** | node-cron + axios (to auto-download data monthly/quarterly) |
| **Deployment** | Render (backend), Vercel (frontend), MongoDB Atlas |

## 📂 Project Structure

```
/
├── client/                 # React frontend app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Main application pages
│   │   ├── utils/          # Utility functions and API calls
│   │   └── index.css       # Global styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.cjs
│   ├── .eslintrc.cjs
│   └── index.html
├── server/                 # Node.js backend API
│   ├── models/             # MongoDB data models
│   │   ├── Coastline.js    # Coastline data schema
│   │   └── Analysis.js     # Analysis results schema
│   ├── routes/             # API route handlers
│   │   ├── coastlines.js   # Coastline CRUD operations
│   │   ├── analysis.js     # Geospatial analysis endpoints
│   │   └── upload.js       # File upload handling
│   ├── scripts/            # Utility scripts
│   │   └── seedDatabase.js # Database seeding script
│   ├── server.js           # Main server file
│   ├── package.json
│   └── .env                # Environment variables
├── data/
│   └── geo/                # Sample GeoJSON files
├── .git/                   # Git repository
├── .vscode/                # VS Code settings
├── package-lock.json       # Root package lock file
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- MongoDB (local installation or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/philippine-coastline-analyzer.git
   cd philippine-coastline-analyzer
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

4. **Set up environment variables**
   ```bash
   cd server
   # Create .env file with your MongoDB connection string
   # Example:
   # MONGODB_URI=mongodb://localhost:27017/coastline_analyzer
   # NODE_ENV=development
   # PORT=5000
   ```

5. **Seed the database (optional)**
   ```bash
   cd server
   npm run seed
   ```

6. **Start the development servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd server
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd client
   npm run dev
   ```

7. **Open your browser**
   - Frontend: http://localhost:5173 (Vite default port)
   - Backend API: http://localhost:5000

## 📡 Free Data Sources

| Source | What to Get | Format | Notes |
|--------|-------------|--------|-------|
| **NAMRIA** | Historical coastline shapefiles | .shp, .geojson | Register or email request |
| **Project NOAH Archive** | Flood maps, satellite overlays | image, raster | May require raster parsing |
| **OpenStreetMap** | Current coastline references | GeoJSON | Use as baseline |
| **PhilGEOS** | Elevation and topography | DEM | Optional for deeper analysis |

## 🛠️ Development

### Available Scripts

**Backend (`/server`):**
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

**Frontend (`/client`):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/coastlines` | Get all coastlines with filters |
| `POST` | `/api/coastlines` | Create new coastline |
| `GET` | `/api/coastlines/:id` | Get specific coastline |
| `POST` | `/api/analysis/compare` | Compare two coastlines |
| `GET` | `/api/analysis` | Get all analyses |
| `POST` | `/api/upload/geojson` | Upload GeoJSON file |

### Adding New Features

1. **Backend**: Add routes in `/server/routes/`
2. **Frontend**: Add components in `/client/src/components/`
3. **Database**: Update models in `/server/models/`
4. **API**: Update API calls in `/client/src/utils/api.js`

## 🗺️ Usage Examples

### 1. Upload Coastline Data

1. Go to the **Upload** page
2. Select GeoJSON files containing coastline polygons
3. Fill in location metadata (region, province, municipality, year)
4. Click "Upload" to store in database

### 2. View Coastlines on Map

1. Navigate to the **Map** page
2. Use filters to find specific coastlines
3. Toggle layer visibility and adjust opacity
4. Click on coastlines to view metadata

### 3. Analyze Changes

1. Go to the **Analysis** page
2. Click "New Analysis"
3. Select baseline and comparison coastlines
4. View results showing land loss/gain over time

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `/server` directory:

```env
MONGODB_URI=mongodb://localhost:27017/coastline_analyzer
NODE_ENV=development
PORT=5000
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_HOURS=24
```

### MongoDB Setup

**Local MongoDB:**
```bash
# Start MongoDB service
mongod --dbpath /your/data/path
```

**MongoDB Atlas (Cloud):**
1. Create account at https://atlas.mongodb.com
2. Create cluster and get connection string
3. Update `MONGODB_URI` in `.env`

## 🚀 Deployment

### Backend (Render)

1. Push code to GitHub
2. Connect repository to Render
3. Set environment variables
4. Deploy automatically

### Frontend (Vercel)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set build settings:
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
4. Deploy automatically

### Database (MongoDB Atlas)

1. Create MongoDB Atlas account
2. Create cluster
3. Set up database user and network access
4. Update connection string in production environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex geospatial calculations
- Test with real GeoJSON data when possible
- Update documentation for new features

## 📊 Sample Data

The project includes sample GeoJSON files in `/data/geo/`:
- `sample_manila_bay_2010.geojson` - Manila Bay coastline from 2010
- `sample_manila_bay_2023.geojson` - Manila Bay coastline from 2023

Use these for testing the comparison and analysis features.

## 🔍 Troubleshooting

### Common Issues

**MongoDB Connection Error:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Ensure network access for Atlas

**GeoJSON Upload Fails:**
- Validate GeoJSON format at http://geojsonlint.com
- Ensure file size is under 50MB
- Check that geometry type is Polygon or MultiPolygon

**Map Not Loading:**
- Check console for JavaScript errors
- Verify Leaflet CSS is loaded
- Ensure GeoJSON data has valid coordinates

### Getting Help

- Check the [Issues](https://github.com/yourusername/philippine-coastline-analyzer/issues) page
- Read the [API Documentation](docs/API.md)
- Contact: coastline-analyzer@example.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NAMRIA** - National Mapping and Resource Information Authority
- **Project NOAH** - Nationwide Operational Assessment of Hazards
- **OpenStreetMap** - Collaborative mapping community
- **Turf.js** - Geospatial analysis library
- **Leaflet** - Open-source mapping library

---

**Built with ❤️ for the Filipino coastal communities**

🌊 Help us track and protect our beautiful coastlines! 🇵🇭
