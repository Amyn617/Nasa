# UI Designer Guide

This document helps UI designers and front-end developers understand the component structure, styling conventions, and interaction patterns used in this prototype. It also provides accessibility guidance and example flows to make the app more robust and designer-friendly.

## Goals for the UI

- Clear and direct map-first interaction: let users pick a location quickly and then configure parameters.
- Lightweight, readable charts and summaries that present time-series and aggregated stats.
- Accessible controls and keyboard-first interactions where possible.
- Consistent design tokens (colors / spacing / typographic scale) so changes propagate cleanly.

## File locations and component map

- `src/components/ControlPanel.jsx` — main parameter selection panel: date/range, parameters, presets, location input.
- `src/components/MapSelector.jsx` — map with draggable pin and map-based interactions (Leaflet).
- `src/components/Charts.jsx` — visualization components for time-series and summary charts.
- `src/components/ExportPanel.jsx` — export controls and format selection (CSV/JSON)
- `src/components/ResultsSummary.jsx` — short statistics (mean, min, max, percentiles)
- `src/components/NotificationsPanel.jsx` — status and errors
- `src/components/Auth.jsx` / `ProfilePanel.jsx` — mock auth and profile controls
- `src/components/VoiceInput.jsx` — experimental voice input control

When designing UI changes, prefer editing or composing these components rather than adding global changes.

## Design tokens and CSS

- Global styles are under `src/styles.css`. Use CSS custom properties (variables) if adding tokens like `--color-primary`.
- Keep layout decisions local to components; avoid deeply global overrides.
- Prefer BEM-like classnames if you need more than simple component-level classes.

Suggested tokens to add to `src/styles.css`:

:root {
  --color-bg: #0f1724;
  --color-surface: #0b1220;
  --color-primary: #1e90ff;
  --color-accent: #00bfa5;
  --color-text: #e6eef6;
  --gap-xs: 4px;
  --gap-sm: 8px;
  --gap-md: 16px;
  --gap-lg: 24px;
  --radius-sm: 6px;
}

Add tokens for color, spacing, radii, and type scale so designers and devs can iterate quickly.

## Component patterns and props

- ControlPanel: Should accept controlled props (value, onChange) for date range, parameters, and preset. Keep side-effects (fetching) outside and provide a `onRun` callback.
- MapSelector: Exposes `onLocationChange({ lat, lon })` and `onZoomChange(zoom)` callbacks. Avoid storing global state inside the map component.
- Charts: Accepts series data in normalized format `[{ id, meta, data: [{ts, value}] }]` and a `units` prop for legend rendering.

## Accessibility (A11y)

- Ensure all interactive controls have keyboard focus states and visible outlines.
- Add aria-labels to map controls and parameter toggles (e.g., aria-pressed for toggles).
- Ensure color contrast meets AA standards for text and important icons.
- Provide alt text for exported images or charts (or downloadable CSV/JSON fallback).
- For charts, provide table or list alternatives to convey key numbers (mean/min/max) for screen readers.

## Interaction patterns and microcopy

- Presets: Use short, descriptive names and show a hover tooltip listing included parameters.
- Parameter selection: Show friendly names with units and an optional info icon to open a short help popover (source / reliability / cadence).
- Fetch progress: Show a clear progress state (spinner + textual progress) and surface errors in the NotificationsPanel with actionable messages.

## Sample flows

1. Quick view (single-date): User clicks map, sets date, selects 2–3 parameters, clicks Run. Show chart with series and a results summary card.
2. Compare range: User selects a date range and a parameter, selects 'aggregate' option. Provide mean/time-of-day overlays and allow download.
3. Save preset: Allow users to save the current selection to localStorage (mock auth) and re-open it later.

## Visual improvements and suggestions

- Add a small legend that lists series names and colors; allow toggling series visibility.
- Use a small tooltip on hover for chart points showing timestamp + value + units.
- For long lists of parameters, add searchable/taggable UI so designers can add presets quickly.

## Assets and icons

- Prefer simple SVG icons (inline) for easy theming.
- Use 24x24 or 16x16 base sizes for toolbar icons to keep density consistent.

## Collaboration tips

- When implementing a new design, create a short spec in a PR describing the rationale and link to screenshots.
- Seed the UI with a storybook or component gallery for quicker iteration (optional).

If you want, I can scaffold a small Storybook config and add stories for `ControlPanel`, `MapSelector`, and `Charts` to make design review faster. Ask and I'll add it.
