# Global Displacement Atlas

An interactive 3D visualization mapping forced displacement and refugee flows across the world.

## Inspiration!

This project was inspired by the New York Times' incredible article "[To Understand Global Migration, You Have to See It First](https://www.nytimes.com/interactive/2025/04/17/opinion/global-migration-facebook-data.html)" which demonstrated the power of visualizing human movement at a global scale. While that piece focused on all forms of migration using data from Meta (2022), this atlas specifically illuminates forced displacement—refugees and asylum seekers—using official data from the United Nations High Commissioner for Refugees (UNHCR) and the United Nations Relief and Works Agency (UNRWA).

The goal of this is to make the concept of migration, which we know largely anecdotally, visible on a global scale, so people can understand how migration ebbs and flows and what its current state is.  

## The Data Story

### UNHCR Population Data

The backbone of this visualization is the [UNHCR Population Statistics Database](https://www.unhcr.org/refugee-statistics/), which tracks:

- **Refugees**: People forced to flee their country due to persecution, war, or violence
- **Asylum Seekers**: People who have applied for international protection but haven't yet received refugee status
- **Origins and Destinations**: Where people flee from (country of origin) and where they seek safety (country of asylum)

The UNHCR API provides data from 1951 to present, covering virtually every country and territory. This project currently visualizes data from 2000-2024, showing how displacement patterns have evolved over two decades of conflict, climate change, and political upheaval.

### Palestine: UNRWA Data

Palestine refugees represent one of the world's oldest and largest refugee populations, but they're tracked separately by UNRWA rather than UNHCR. To ensure accuracy, this atlas integrates both sources:

- **UNHCR data**: Global displacement flows including some Palestine-related movements
- **UNRWA data**: Registered Palestine refugees across five host countries/territories
  - Jordan: ~2.3 million registered refugees
  - Lebanon: ~483,000 registered refugees
  - Syria: ~568,000 registered refugees
  - West Bank & Gaza: ~1.6 million registered refugees
  - Egypt: ~12,000 registered refugees

When you click on Palestine or any UNRWA host country, the visualization automatically merges both datasets, providing the most complete picture possible. 

## Technical Architecture

### Technology Stack

The atlas is built as a single-page React application using modern web technologies for data visualization.

**Core Technologies**
- **React 18** (`^18.2.0`) with TypeScript (`^5.2.0`)
- **Vite** (`^5.0.0`) 
- **Tailwind CSS** (`^3.4.0`) 

**3D Visualization**
- **react-globe.gl** (`^2.27.2`) - Three.js-based interactive globe component
- **Three.js** (`^0.168.0`) - WebGL-accelerated 3D graphics rendering
- **topojson-client** (`^3.1.0`) & **world-atlas** (`^2.0.2`) - Geographic data processing

### Data Processing Pipeline

1. **Fetching**: Services call UNHCR and UNRWA APIs with appropriate filters (country, year, ISO codes)
2. **Transformation**: Raw API responses are parsed into standardized `MigrationFlow` objects
3. **Aggregation**: DataAggregator merges UNHCR and UNRWA data, preventing double-counting
4. **Coordinate Mapping**: Flow origins and destinations are matched to geographic coordinates
5. **Arc Generation**: FlowProcessor converts flows into 3D arcs with:
   - Start/end coordinates
   - Arc thickness based on displacement volume (logarithmic scale)
   - Color intensity representing severity
   - Animated dash patterns showing direction

### Coordinate System

Geographic accuracy required a comprehensive dataset of 256 country coordinates, including:

- **UN Member States**: 193 recognized countries
- **Disputed Territories**: Palestine (PSE), Kosovo (XKX), Taiwan (TWN)
- **Special Codes**: Stateless (STA), Unknown (UKN), Various (VAR)

Coordinates use capital cities as representative points, with manual overrides for:
- Countries with multiple capitals (Bolivia, South Africa)
- Territories without capitals (Palestine uses Ramallah)
- Historical codes (Tibet for legacy datasets)

## Visualization Features

### Two Modes of Exploration

**Flow View (Default)**
- Shows top 100 global displacement routes
- Year selector to explore data from 2000-2024
- Hover to see specific route details
- Auto-rotating globe 

**Explore Mode**
- Click any country to see detailed statistics
- Toggle between immigration and emigration data
- View top 10 origin/destination countries

### Performance Optimizations

**Data Volume Management**
- Global view limits to top 100 flows (out of 300 cached)
- Country view shows all relevant flows (typically 10-50)
- Pagination in API calls (1000 items per request)
- Aggressive caching prevents redundant API calls

**Rendering Efficiency**
- React.memo for expensive components
- useMemo for coordinate maps and arc calculations
- useCallback for event handlers to prevent re-renders
- WebGL acceleration via Three.js for 60fps globe rotation

**Data Infrastructure**

Services Layer
- `unhcr.service.ts` - API client for UNHCR data with built-in caching
- `unrwa.service.ts` - API client for UNRWA-specific Palestine data

Processing Utilities
- `flow-processor.ts` - Transforms raw API data into visualization arcs
- `data-aggregator.ts` - Merges UNHCR and UNRWA datasets without duplication
- `globe-helpers.ts` - Geographic calculations, styling, and helper functions

React Hooks
- `useUNHCRData.ts` - Custom hooks for fetching and merging displacement data
- `usePolygons.ts` - Loads and processes country boundary polygons for interactive features

## Data Accuracy & Limitations

### What This Shows

- **Official registered data**: UNHCR and UNRWA track people who have formally sought protection
- **Annual snapshots**: Data represents the state at year-end for each year
- **Both directions**: Unlike many government statistics, we show both incoming and outgoing flows
- **Global coverage**: Nearly every country participates in UNHCR reporting

### What's Missing

- **Internally Displaced Persons (IDPs)**: People displaced within their own country (not shown as flows)
- **Undocumented movements**: People who flee without formal registration
- **Seasonal migration**: Short-term movements and circular migration patterns
- **Real-time data**: Most recent year may be preliminary, subject to updates

### Open Source Libraries

- **react-globe.gl** by Vasco Asturiano - Three.js globe visualization
- **Three.js** - 3D graphics library
- **React** 
- **Vite** 
- **Tailwind CSS** 

### Geographic Data

- **REST Countries API** - Country coordinates and metadata
- **Natural Earth** - Country boundary polygons (via world-atlas)
