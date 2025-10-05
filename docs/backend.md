# Backend Developer Guide

This document is targeted at backend developers or anyone who will extend or operate the service adapters and data-fetch tooling in this repo.

## Purpose

The front-end is a Vite + React app that currently calls a set of small JS adapter modules in `src/services/` to build requests and normalize responses from external data providers (Meteomatics, NASA POWER, etc.). While the current app uses those adapters client-side for demonstration, moving network calls to a backend server is recommended for production to keep credentials secret and to perform caching, rate-limiting, or heavier preprocessing.

This guide covers:

- Service responsibilities and locations
- Expected data shapes and normalization guarantees (point & gridded)
- Environment variables and secrets
- Recommended server-side responsibilities
- Endpoint contracts and batching/job patterns
- Caching, rate-limiting, retries and backoff
- Error handling and observability
- Testing and local development tips

## Where to find the adapters

- `src/services/meteomatics.js` — builds queries and normalizes Meteomatics responses
- `src/services/meteomatics_params.js` — parameter mapping used by the UI
- `src/services/nasa.js` — helper wrapper for NASA APIs (if present)
- `src/services/nasa_power.js` — adapter for NASA POWER datasets
- `src/services/geocode.js` — Nominatim (OpenStreetMap) geocoding helpers

These modules are intentionally small and focused — they build URLs and normalize responses. If you move them server-side, keep that separation of concerns.

When moving adapters server-side, consider adding a thin service layer around them that is responsible for:

- Input validation and sanitization (reject malformed dates, invalid parameter codes, out-of-range coordinates).
- Mapping incoming frontend aliases to canonical parameter codes (for example, `temp` -> `t_2m:C`).
- Composing cache keys and reading/writing cache stores (Redis, memcached).
- Translating upstream provider errors into a stable client-facing error contract.
- Implementing retries and exponential backoff for transient upstream failures.

## Environment variables

Use a `.env` file for local development and `process.env` on the server. Example variables used in this project:

- VITE_METEO_USER / VITE_METEO_PASSWORD — Meteomatics credentials (client-side demos only)
- VITE_NASA_API_KEY — NASA API key (if required by the module)

When moving to server-side, rename variables to non-`VITE_` names (these are client-exposed by Vite) and store them in secure vaults or platform-specific secret stores. Example server-side names:

- METEOMATICS_USER
- METEOMATICS_PASSWORD
- NASA_API_KEY

Other variables you may need depending on deployment and patterns:

- CACHE_URL (e.g. redis://...)
- CACHE_TTL_DEFAULT (seconds)
- RATE_LIMIT_REQUESTS (per minute)
- RATE_LIMIT_WINDOW (seconds)
- MAX_RETRY_ATTEMPTS
- RETRY_BACKOFF_BASE_MS
- JOB_QUEUE_URL (for background batch processing)

## Recommended backend responsibilities

- Proxy API requests from the frontend to the upstream providers so keys aren't exposed.
- Implement caching (in-memory or Redis) keyed by the request signature (parameters + datetime + bbox/latlon) to avoid rate limits and reduce latency.
- Add rate-limiting per-client to protect quota and prevent abuse.
- Validate and sanitize user input (date ranges, parameter codes, coordinates).
- Normalize data once and return a stable JSON contract for the client.
- Provide batch endpoints for long-running fetches (return a job id and let the client poll or use websockets).

## Data shape expectations

The front-end expects normalized JSON payloads for charting and summaries. When building server responses, follow a simple contract that is easy to test and stable across API changes.

Example normalized time-series response for a single parameter and location:

{
  "meta": {
    "parameter": "t_2m:C",
    "friendly": "Air temperature (2m)",
    "units": "C",
    "source": "meteomatics",
    "lat": 47.378,
    "lon": 8.541,
    "model": "gfs",
    "datetime_range": {
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-10-02T00:00:00Z",
      "interval_minutes": 60
    }
  },
  "data": [
    { "ts": "2025-10-01T00:00:00Z", "value": 9.2 },
    { "ts": "2025-10-01T01:00:00Z", "value": 8.9 }
  ]
}

If multiple parameters or locations are requested, return an array of such series or a keyed object like `{ "t_2m:C": { ...series }, "precip_1h:mm": { ... } }`.

Include explicit error fields (HTTP-level status + body) when normalization fails, for example:

HTTP 400
{
  "error": "invalid_parameters",
  "message": "Parameter 'abc' is not supported"
}

## Example server endpoints

- GET /api/v1/meteomatics?lat=...&lon=...&start=...&end=...&params=t_2m:C,precip_1h:mm
- POST /api/v1/meteomatics/batch (body contains array of requests)
- GET /api/v1/nasa_power?lat=...&lon=...&start=...&end=...&params=...

Design endpoints to accept either lat/lon or bounding boxes. Support common query param aliases used by the UI: `start`, `end`, `interval`, `params`, `model`.

Also support convenience shapes the frontend may use:

- `locations` — an array of lat/lon pairs for multi-point queries (POST body)
- `bbox` — a bbox in the form `minLon,minLat,maxLon,maxLat` for gridded requests
- `grid` — explicit grid request with `nlat`, `nlon` or `lats[]` / `lons[]`
- `agg` — aggregation hint (e.g., `avg`, `sum`, `max`, `min`) for parameters that support aggregation

## Caching, rate limits, retries and backoff

- Cache responses for short TTLs (e.g., 5–30 minutes depending on use case). For historical (unchanging) queries, cache for much longer (days to months).
- Use a cache key composed of: provider, canonical parameter list (sorted), coordinates/bbox/grid spec, start/end/interval, model, and any flags (e.g., `agg=avg`). Example key:

  meteomatics::t_2m:C,precip_1h:mm::lat=47.38,lon=8.54::2025-10-01T00:00Z_2025-10-02T00:00Z::interval=60::model=gfs

- For gridded requests include grid dimensions or tile / CRS identifiers in the key.
- Implement rate-limiting per-client (IP or API token) and per-proxy (global) using token-bucket or leaky-bucket algorithms.
- When upstream providers respond with 429 or provide Retry-After headers, propagate a sensible Retry-After to clients and/or enqueue the request for background retry.
- Implement exponential backoff for retries with jitter. Example policy:

  - MAX_RETRY_ATTEMPTS = 4
  - backoff_ms = RETRY_BACKOFF_BASE_MS * 2**attempt + random(0, 1000)
  - Only retry on 429, 502, 503, 504 or network timeouts; do not retry on 4xx errors that indicate client problems (400, 401, 403).

## Testing

- Unit test URL builders and normalization functions (happy path + missing fields + unexpected nested arrays).
- Add integration tests using recorded responses (VCR-style) or a mock HTTP server.
- Add tests covering:

  - Multi-parameter responses (ensure keys and lengths match)
  - Multi-location and batch endpoints
  - Gridded data responses (consistent CRS and resolution)
  - Error mapping from upstream to client-facing errors

- Smoke test the `tools/run_meteo.js` script after any change in `src/services/meteomatics.js`.

## Local dev tips

- Keep the adapters modular. When moving server-side, import the existing `src/services/*` files into the server project and adapt env var names.
- Use `node tools/run_meteo.js` for quick experiments. The tool is intentionally simple to run ad-hoc queries.

## Security

- Never commit `.env` with secrets.
- Never expose real keys to the client in production.
- If you must test client-side with keys, scope them and remove them immediately after testing.

## Endpoint contracts and normalization examples

Below are compact, stable contracts the frontend can rely on. Use the same top-level `meta` + `data` shape for consistency.

1) Point time-series (single parameter, single location)

{
  "meta": { "parameter": "t_2m:C", "friendly": "Air temperature (2m)", "units": "C", "source": "meteomatics", "lat": 47.378, "lon": 8.541, "model": "gfs", "datetime_range": { "start": "2025-10-01T00:00:00Z", "end": "2025-10-02T00:00:00Z", "interval_minutes": 60 } },
  "data": [ { "ts": "2025-10-01T00:00:00Z", "value": 9.2 }, { "ts": "2025-10-01T01:00:00Z", "value": 8.9 } ]
}

2) Multi-parameter, single-location

{
  "meta": { "lat": 47.378, "lon": 8.541, "model": "gfs", "datetime_range": { "start": "2025-10-01T00:00:00Z", "end": "2025-10-02T00:00:00Z", "interval_minutes": 60 } },
  "series": {
    "t_2m:C": { "friendly": "Air temperature (2m)", "units": "C", "data": [ { "ts": "...", "value": 9.2 } ] },
    "precip_1h:mm": { "friendly": "Precipitation (1h)", "units": "mm", "data": [ { "ts": "...", "value": 0.0 } ] }
  }
}

3) Multi-location, multi-parameter (array of series)

[
  { "meta": { "lat": 47.3, "lon": 8.5, "parameter": "t_2m:C" }, "data": [...] },
  { "meta": { "lat": 46.9, "lon": 7.4, "parameter": "t_2m:C" }, "data": [...] }
]

4) Gridded data (tiles or small grids)

{
  "meta": { "source": "nasa_power", "parameter": "t_2m:C", "units": "C", "crs": "EPSG:4326", "bbox": [minLon, minLat, maxLon, maxLat], "nx": 120, "ny": 80, "model": null, "datetime": "2025-10-01T00:00:00Z" },
  "grid": {
    "lons": [ ...nx values... ],
    "lats": [ ...ny values... ],
    "values": [ [ ...row0... ], [ ...row1... ] ]
  }
}

5) Error response (stable contract)

HTTP 4xx/5xx
{
  "error": "invalid_parameters",
  "message": "Parameter 'abc' is not supported",
  "details": { "param": "abc" }
}

## Observability and error handling

- Log upstream request ids, response status, and timing for every adapter call.
- Emit metrics: request rate, error rate, 95/99th latency, cache hit/miss rate.
- When normalizing, include a `warnings` array in the payload if some values were dropped or approximated.

## Next steps (optional improvements)

- Add a minimal Express/Next.js server with a `/api` proxy and caching using Redis.
- Add tests (Vitest/Jest) and CI to run them on PRs.
- Add runtime metrics and logging for slow queries and cache hit/miss rates.

If you'd like, I can scaffold a small Express proxy implementing the `GET /api/v1/meteomatics` endpoint and wire the frontend to use it in dev mode. Tell me which server framework you prefer (Express, Fastify, Next.js API routes) and I'll create the server skeleton and example env config.

## JSON Schema-like examples and validation notes

Below are compact schema-like examples you can use as the basis for runtime validation (AJV, Zod, Joi, or hand-rolled checks). They are intentionally small and focus on the fields the frontend relies on.

1) Single-parameter time-series (point)

JSON shape:

{
  "meta": {
    "parameter": "t_2m:C",
    "friendly": "Air temperature (2m)",
    "units": "C",
    "source": "meteomatics",
    "lat": 47.378,
    "lon": 8.541,
    "model": "gfs",
    "datetime_range": { "start": "2025-10-01T00:00:00Z", "end": "2025-10-02T00:00:00Z", "interval_minutes": 60 }
  },
  "data": [ { "ts": "2025-10-01T00:00:00Z", "value": 9.2 } ]
}

Validation notes (minimal):
- `meta.lat` and `meta.lon` should be finite numbers within valid ranges.
- `meta.datetime_range.start` and `.end` must be valid ISO8601 timestamps; enforce start < end.
- `data` must be a non-empty array; each item must have `ts` (ISO8601) and `value` (number or null for missing).

2) Multi-parameter time-series (single location)

JSON shape:

{
  "meta": { "lat": 47.378, "lon": 8.541, "model": "gfs", "datetime_range": { "start": "...", "end": "...", "interval_minutes": 60 } },
  "series": {
    "t_2m:C": { "friendly": "Air temperature (2m)", "units": "C", "data": [ { "ts": "...", "value": 9.2 } ] },
    "precip_1h:mm": { "friendly": "Precipitation (1h)", "units": "mm", "data": [ { "ts": "...", "value": 0.0 } ] }
  }
}

Validation notes:
- All series arrays should have the same timestamps (or at least be aligned after normalization). If timestamps differ, provide an aligned time-axis in `meta` and allow missing values (null).
- For aggregation parameters (`agg`), ensure units are consistent before aggregating (e.g., don't average mm with m).

3) Multi-location batch responses

JSON shape (array of series):

[
  { "meta": { "lat": 47.3, "lon": 8.5, "parameter": "t_2m:C" }, "data": [...] },
  { "meta": { "lat": 46.9, "lon": 7.4, "parameter": "t_2m:C" }, "data": [...] }
]

Validation notes:
- Each element should be a valid point time-series (see 1).
- For batch endpoints, include a `request_id` in the top-level response headers or meta to trace partial failures.

4) Gridded output

JSON shape:

{
  "meta": { "source": "nasa_power", "parameter": "t_2m:C", "units": "C", "crs": "EPSG:4326", "bbox": [minLon, minLat, maxLon, maxLat], "nx": 120, "ny": 80, "datetime": "2025-10-01T00:00:00Z" },
  "grid": {
    "lons": [ ...nx values... ],
    "lats": [ ...ny values... ],
    "values": [ [ ...row0... ], [ ...row1... ] ]
  }
}

Validation notes:
- `meta.bbox` should match the extents implied by `lons`/`lats`.
- `values` should be a 2D array of numbers (or null) with dimensions `[ny][nx]`.
- Provide `crs` to avoid ambiguity; default to `EPSG:4326` where possible.

5) Error response schema

HTTP 4xx/5xx body (recommended):

{
  "error": "invalid_parameters",
  "message": "Parameter 'abc' is not supported",
  "details": { "param": "abc" },
  "request_id": "..."
}

Validation notes:
- Always return a human-friendly `message` and a machine-parseable `error` code.
- Include `request_id` and any upstream `provider_id` to aid debugging.

Using the lightweight validator

The repository includes a small, dependency-free validator in `src/services/validation.js`. It performs basic shape checks and returns `{ valid: boolean, errors: [...] }` so adapters can attach validation diagnostics to `meta` for debugging and automated monitoring. For stricter validation in production consider using AJV or Zod and compile JSON Schema once at startup for performance.

Example: attach validation diagnostics in your adapter before returning to the client:

{
  // ...normalized payload
  meta: { ...meta, validation: { valid: true, errors: [] } }
}

If you'd like, I can now:
- Move the validator into a shared `lib/` folder and add a small test suite.
- Scaffold an Express proxy and wire the validator into server-side adapters so the frontend always receives validated payloads.
