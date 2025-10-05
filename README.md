# NASA Weather Data Visualization Dashboard

This repository is a comprehensive weather and earth observation data dashboard (React + Vite) that integrates multiple NASA Earth science APIs with Meteomatics weather data. Users can select locations, choose single dates or date ranges, and select from a wide variety of NASA satellite and climate parameters to create rich visualizations and analyses.

## 🛰️ NASA APIs Integrated

The dashboard now supports **5 major NASA data sources**:

- **NASA POWER** - Meteorological and solar energy data (1981-present)
- **MODIS** - Satellite imagery and vegetation indices (2000-present)  
- **Giovanni** - Atmospheric and climate data analysis (1979-present)
- **GOES** - Real-time geostationary weather satellite data (2017-present)
- **Earthdata** - Multi-mission Earth science datasets (1979-present)

## 🌍 Key Features

- **Interactive Location Selection**: Click-to-select on map, place search, voice input, manual coordinates
- **Flexible Date Selection**: Single date or date range analysis
- **Comprehensive Parameter Selection**: 25+ NASA parameters across atmospheric, surface, and satellite measurements
- **Multi-Source Visualization**: Compare and analyze data from multiple NASA sources simultaneously
- **Export Capabilities**: Download data and charts for further analysis

<!-- Developer docs links -->

Developer documentation:

- `docs/backend.md` — backend developer notes and API/service details
- `docs/ui-designer.md` — UI/UX and component guidance for designers


## Highlights / Features

- Map selector (Leaflet) with draggable pin and click-to-select
- Search box with autocomplete (Nominatim) for location lookup
- Control panel to choose a single event date or a date range and which variables to visualize
- Charts (time-series) and summary statistics (probabilities, bell-curve approximation)
- Export panel (CSV/JSON) — gated behind a mock login (register/login stored in localStorage)
- Top navigation with Login/Register button that opens an account modal

## Getting started

1. Install dependencies

```powershell
npm install
```

2. Start the dev server

```powershell
npm run dev
```

Open the URL printed by Vite (usually http://localhost:5173).

## Account / Authentication (prototype)

The app includes a simple mock auth flow. Click "Login / Register" in the top nav to open the account modal. Registration stores a simple user object and preferences in `localStorage` for personalization. This is a prototype-only approach — for production use a secure backend or identity provider.

## Meteomatics API (optional real integration)

The app includes `src/services/meteomatics.js` which builds requests using the Meteomatics API format:

GET https://api.meteomatics.com/{datetime}/{parameters}/{lat},{lon}/json

If you want to test with real Meteomatics responses you can provide credentials to the client (for testing only) via Vite env vars:

1. Copy `.env.example` to `.env` in the project root (create `.env` if not present).
2. Add the following lines to `.env` (do NOT commit this file):

```
VITE_METEO_USER=your_meteomatics_username
VITE_METEO_PASSWORD=your_meteomatics_password
```

3. Restart the dev server.

The Control Panel UI also allows setting credentials for a single query run. Reminder: never put credentials into client-side code in production — use a backend proxy to keep keys secret.

## Geocoding / Autocomplete

The place input in the Control Panel uses Nominatim for geocoding and offers simple autocomplete suggestions as you type. Selecting a suggestion updates the map pin.

## Export and gated features

Export (CSV/JSON) and certain advanced features are gated behind the mock login to encourage users to register in the prototype. You can still view charts without logging in.

## Troubleshooting

- If Vite prints the local URL but the server stops unexpectedly, re-run `npm run dev` and watch the terminal for errors.
- If the app fails to fetch Meteomatics data, double-check credentials and the `datetime` / `parameters` formatting.

## Next steps / Improvements

- Add backend for authentication and a secure proxy for Meteomatics calls
- Debounce the Nominatim autocomplete for better performance
- Render one chart per selected parameter (currently the prototype focuses on temperature)
- Add map overlays / heatmaps for spatial visualizations

If you'd like, I can continue by polishing the autocomplete (add debounce), building charts for each selected parameter, or scaffolding a minimal backend for secure Meteomatics proxying.

## Use cases & parameter mapping

Below are practical domains where the Meteomatics + NASA POWER combination in this prototype can be applied, with suggested Meteomatics parameters that matter for each use case. Use this as a starting point to create tailored dashboards or alerts.

- Aquatic & water sports (swimming, surfing, sailing, diving)
	- Key concerns: wave/wind conditions, precipitation, temperature, visibility, solar radiation

Below are more detailed parameter lists for each use case. For each parameter you'll find: Friendly name — Meteomatics code — unit — why it matters.

- Aquatic & water sports (swimming, surfing, sailing, diving)
	- Wind speed — `wind_speed_10m:ms` — m/s — influences wave height, safety for small craft and surfers.
	- Wind gust — `wind_gust_10m:ms` — m/s — sudden gusts affect small boats and kitesurfing safety.
	- Wind direction — `wind_direction_10m:d` — ° — determines onshore/offshore conditions and wave approach.
	- Precipitation (1h) — `precip_1h:mm` — mm — rain events affect visibility and comfort; intense rain can reduce water quality.
	- Visibility — `visibility:m` — m — critical for navigation and safety in maritime activities.
	- Air temperature — `t_2m:C` — °C — water/air comfort and hypothermia risk; helps decide wetsuit needs.
	- Shortwave radiation — `shortwave_radiation_flux_density:W/m2` — W/m2 — solar exposure and UV-related risk for participants.

- Agriculture & farming
	- Air temperature — `t_2m:C` — °C — crop growth, degree-day accumulation, frost risk.
	- Dew point — `dew_point_2m:C` — °C — indicates humidity and condensation/frost potential.
	- Cumulative precipitation — `precip_total:mm` — mm — irrigation planning and waterlogging risk.
	- Precipitation (1h) — `precip_1h:mm` — mm — storm intensity and soil infiltration considerations.
	- Soil moisture (0–10cm) — `soil_moisture_0_10cm:m3/m3` — m3/m3 — direct measure of topsoil wetness for planting and tillage.
	- Evapotranspiration — `evapotranspiration:mm` — mm — irrigation needs and water balance.
	- Potential evapotranspiration — `potential_evapotranspiration:mm` — mm — crop water requirement estimates.
	- Frost/low-temp indicators (use temps + dew point) — `t_2m:C`, `dew_point_2m:C` — °C — protect sensitive crops.

- Public health & heat / cold exposure
	- Air temperature — `t_2m:C` — °C — heat stress / cold exposure risk.
	- Relative humidity — `relative_humidity_2m:p` — % — combined with temp to compute heat index.
	- Shortwave radiation — `shortwave_radiation_flux_density:W/m2` — W/m2 — UV exposure and solar load.
	- Precipitation — `precip_1h:mm` — mm — impacts disease vector habitats and sheltering needs.
	- Air density — `air_density:kg/m3` — kg/m3 — affects pollutant dispersion (for air quality contexts).

- Supply chain & logistics (road/sea transport)
	- Visibility — `visibility:m` — m — critical for road and port operations.
	- Precipitation (1h) — `precip_1h:mm` — mm — flooding and icing risk; affects driving conditions.
	- Mean sea level pressure — `mean_sea_level_pressure:Pa` — Pa — synoptic storm tracking for route planning.
	- Wind speed/gust — `wind_speed_10m:ms`, `wind_gust_10m:ms` — m/s — affects shipping and high-sided vehicles.
	- Temperature — `t_2m:C` — °C — perishable cargo management; freezing risk.

- Energy (solar & wind ops)
	- Shortwave radiation — `shortwave_radiation_flux_density:W/m2` — W/m2 — primary input for solar PV output.
	- Wind speed and gust — `wind_speed_10m:ms`, `wind_gust_10m:ms` — m/s — wind turbine generation and cut-in/cut-out conditions.
	- Wind direction — `wind_direction_10m:d` — ° — turbine yaw optimization and wake modeling.
	- Temperature — `t_2m:C` — °C — affects panel efficiency and thermal limits.
	- Air density — `air_density:kg/m3` — kg/m3 — small correction for wind turbine power estimates.

- Aviation & drones
	- Wind speed & components — `wind_speed_10m:ms`, `u_component_of_wind_10m:ms`, `v_component_of_wind_10m:ms` — m/s — operational limits and flight planning.
	- Wind direction — `wind_direction_10m:d` — ° — runway selection and takeoff/landing safety.
	- Visibility — `visibility:m` — m — instrument vs visual flight rules.
	- Cloud cover — `cloud_cover:p` / `total_cloud_cover:p` — % — ceiling and cloud base considerations.
	- Precipitation — `precip_1h:mm` — mm — icing and wet-runway hazards.

- Construction & outdoor events
	- Precipitation (1h) — `precip_1h:mm` — mm — site runoff, mud, and postponement decisions.
	- Wind speed & gust — `wind_speed_10m:ms`, `wind_gust_10m:ms` — m/s — crane operations, temporary structure safety.
	- Temperature — `t_2m:C` — °C — material curing and worker safety.
	- Convective precipitation — `convective_precipitation:mm` — mm — short, intense storms that cause flash hazards.
	- Ground heat flux / soil temp — `ground_heat_flux:W/m2`, `soil_temperature_0cm:C` — relevant for groundworks.

- Research & environmental monitoring
	- Tailor to the study, common choices:
		- Temperature & humidity — `t_2m:C`, `relative_humidity_2m:p` — climate and microclimate studies.
		- Radiation budgets — `shortwave_radiation_flux_density:W/m2`, `longwave_radiation_flux:W/m2`, `direct_radiation:W/m2`, `diffuse_radiation:W/m2`.
		- Soil & hydrology — `soil_moisture_0_10cm:m3/m3`, `precip_total:mm`, `snow_depth:mm`.
		- Air density / pressure — `air_density:kg/m3`, `mean_sea_level_pressure:Pa` — meteorological context and derived variables.

Notes
- The parameter codes shown correspond to commonly-used Meteomatics fields (see `src/services/meteomatics_params.js` for the canonical mapping used by this app).
- Some parameters are model-dependent and may be omitted for specific model/time combinations; the UI handles omitted parameters and offers to remove them from the selection automatically.
- If you want, I can add a one-click preset for each use case that selects exactly the listed parameters in the Control Panel (I already added a presets selector — I can link each preset description here to the dropdown).

How to jump from this README to a preset in the app

You can open the app and have a preset automatically selected by using a URL with the `preset` query parameter or hash. For example:

- Open the Agriculture preset:

	- As a query param: `/?preset=Agriculture`
	- As a hash: `/#preset=Agriculture`

Below are quick links that will open the app and pre-select the corresponding preset (use when the dev server is running):

- Agriculture: `/?preset=Agriculture` or `/#preset=Agriculture`
- Energy: `/?preset=Energy` or `/#preset=Energy`
- Aquatic Sports: `/?preset=Aquatic%20Sports` or `/#preset=Aquatic%20Sports`
- Aviation: `/?preset=Aviation` or `/#preset=Aviation`
- Supply Chain: `/?preset=Supply%20Chain` or `/#preset=Supply%20Chain`
- Health: `/?preset=Health` or `/#preset=Health`

When you open the app with one of these URLs the Control Panel will automatically apply that preset so you can run the query immediately.

- Agriculture & farming
	- Key concerns: temperature extremes, precipitation and cumulative rainfall, soil moisture, evapotranspiration, frost risk
	- Suggested parameters: `t_2m:C`, `precip_total:mm` (or `precip_1h:mm` for higher cadence), `soil_moisture_0_10cm:m3/m3`, `evapotranspiration:mm`, `dew_point_2m:C`

- Public health & air quality planning
	- Key concerns: heat stress, humidity, precipitation (vector-borne disease risk), solar radiation (UV exposure)
	- Suggested parameters: `t_2m:C`, `relative_humidity_2m:p`, `precip_1h:mm`, `shortwave_radiation_flux_density:W/m2`

- Supply chain & logistics (road/sea transport)
	- Key concerns: visibility, precipitation (icing, flooding), wind, temperature affecting perishable goods
	- Suggested parameters: `visibility:m`, `precip_1h:mm`, `t_2m:C`, `mean_sea_level_pressure:Pa` (for storm systems), `wind_speed_10m:ms`

- Energy (solar / wind)
	- Key concerns: solar radiation for PV, wind speed and gusts for turbines, temperature for efficiency
	- Suggested parameters: `shortwave_radiation_flux_density:W/m2`, `wind_speed_10m:ms`, `wind_gust_10m:ms`, `t_2m:C`

- Aviation & drones
	- Key concerns: wind speed/direction aloft (use model-specific higher-level params if available), visibility, cloud cover, precipitation
	- Suggested parameters: `wind_speed_10m:ms`, `wind_direction_10m:d`, `visibility:m`, `cloud_cover:p`, `precip_1h:mm`

- Construction & outdoor events
	- Key concerns: precipitation, wind, temperature, lightning risk (derived from convective parameters), ground conditions
	- Suggested parameters: `precip_1h:mm`, `wind_speed_10m:ms`, `t_2m:C`, `convective_precipitation:mm`

- Research & environmental monitoring
	- Key concerns: depending on the study — temperature, precipitation, radiation, soil moisture, long-term trends
	- Suggested parameters: mix of `t_2m:C`, `precip_total:mm`, `shortwave_radiation_flux_density:W/m2`, `soil_moisture_0_10cm:m3/m3`, `air_density:kg/m3`

Notes
- The list above is a curated starting point — Meteomatics supports many more specialized parameters. The app now includes a central parameter map (`src/services/meteomatics_params.js`) to help you add or customize parameter selections for any use case.
- When creating dashboards for operational use, consider model availability (some parameters may not be provided for all models/times), and use the omitted-parameter handling provided in the UI to adapt automatically.

