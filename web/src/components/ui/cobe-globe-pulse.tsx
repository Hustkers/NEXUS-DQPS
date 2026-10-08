'use client';

import React, { useEffect, useRef, useState, useId, useCallback } from 'react';
import {
  GLOBE_REGIONS,
  REGION_HEATMAP_DATA,
  ALL_RECENT_PURCHASES,
  RECENT_PURCHASES,
  PulseMarker,
  RecentPurchase,
} from '@/data/globe-regions';
import { RegionDetailPanel } from '@/components/ui/region-detail-panel';
import { cn } from '@/lib/utils';

export type { PulseMarker, RecentPurchase } from '@/data/globe-regions';

export interface GlobePulseProps {
  markers?: PulseMarker[];
  className?: string;
  speed?: number;
  size?: number; // Size in px
  baseColor?: [number, number, number];
  glowColor?: [number, number, number];
  onSelectMarker?: (marker: PulseMarker | null) => void;
  onSelectRegion?: (marker: PulseMarker | null) => void;
  selectedMarkerId?: string | null;
  selectedRegionId?: string | null;
  renderDetailPanel?: boolean;
  showRecentPurchases?: boolean;
  maxOrders?: number; // Maximum frontline orders to display before vertical truncation (default: 4)
}

interface AmChartsGlobals {
  am5: any;
  am5map: any;
  am5geodata_worldLow: any;
  am5themes_Animated: any;
}

/**
 * Mapping of ISO-2 Country Codes to Regional Heatmap Definitions.
 * Allows shading the ENTIRE country polygon in the thermal heatmap color.
 */
const COUNTRY_REGION_MAP: Record<
  string,
  {
    regionId: string;
    regionName: string;
    colorHex: string;
    statusLabel: string;
    roas: string;
  }
> = {
  // United States (US East & West) -> Shaded in Peak Thermal Red (#FF2E38) by default
  US: {
    regionId: 'us-east',
    regionName: 'US East & West Hub',
    colorHex: '#FF2E38',
    statusLabel: 'High Sales Velocity',
    roas: '4.40x',
  },
  // Western Europe Hub -> Shaded in Warm Gold (#FFAE14)
  GB: { regionId: 'emea-west', regionName: 'Western Europe (UK)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  FR: { regionId: 'emea-west', regionName: 'Western Europe (France)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  DE: { regionId: 'emea-west', regionName: 'Western Europe (Germany)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  NL: { regionId: 'emea-west', regionName: 'Western Europe (Netherlands)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  BE: { regionId: 'emea-west', regionName: 'Western Europe (Belgium)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  IE: { regionId: 'emea-west', regionName: 'Western Europe (Ireland)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  ES: { regionId: 'emea-west', regionName: 'Western Europe (Spain)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  IT: { regionId: 'emea-west', regionName: 'Western Europe (Italy)', colorHex: '#FFAE14', statusLabel: 'Solid Momentum', roas: '3.90x' },
  // Asia Pacific Hub -> Shaded in Thermal Yellow (#F5DC2E)
  JP: { regionId: 'apac', regionName: 'Asia Pacific (Japan)', colorHex: '#F5DC2E', statusLabel: 'Moderate Velocity', roas: '3.50x' },
  KR: { regionId: 'apac', regionName: 'Asia Pacific (South Korea)', colorHex: '#F5DC2E', statusLabel: 'Moderate Velocity', roas: '3.50x' },
  AU: { regionId: 'apac', regionName: 'Asia Pacific (Australia)', colorHex: '#F5DC2E', statusLabel: 'Moderate Velocity', roas: '3.50x' },
  NZ: { regionId: 'apac', regionName: 'Asia Pacific (New Zealand)', colorHex: '#F5DC2E', statusLabel: 'Moderate Velocity', roas: '3.50x' },
  // South Asia Hub -> Shaded in Amber Yellow (#EAB308)
  IN: { regionId: 'south-asia', regionName: 'South Asia (India)', colorHex: '#EAB308', statusLabel: 'Emerging Direct', roas: '3.60x' },
  // Southeast Asia Hub -> Shaded in Cool Cyan (#38BDF8)
  SG: { regionId: 'sea', regionName: 'Southeast Asia (Singapore)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  ID: { regionId: 'sea', regionName: 'Southeast Asia (Indonesia)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  TH: { regionId: 'sea', regionName: 'Southeast Asia (Thailand)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  MY: { regionId: 'sea', regionName: 'Southeast Asia (Malaysia)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  PH: { regionId: 'sea', regionName: 'Southeast Asia (Philippines)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  VN: { regionId: 'sea', regionName: 'Southeast Asia (Vietnam)', colorHex: '#38BDF8', statusLabel: 'Balanced Delivery', roas: '3.30x' },
  // Nordics Hub -> Shaded in Subdued Indigo-Slate (#818CF8)
  SE: { regionId: 'nordic', regionName: 'Nordics (Sweden)', colorHex: '#818CF8', statusLabel: 'Cold / Stable', roas: '4.20x' },
  NO: { regionId: 'nordic', regionName: 'Nordics (Norway)', colorHex: '#818CF8', statusLabel: 'Cold / Stable', roas: '4.20x' },
  DK: { regionId: 'nordic', regionName: 'Nordics (Denmark)', colorHex: '#818CF8', statusLabel: 'Cold / Stable', roas: '4.20x' },
  FI: { regionId: 'nordic', regionName: 'Nordics (Finland)', colorHex: '#818CF8', statusLabel: 'Cold / Stable', roas: '4.20x' },
  // Latin America Hub -> Shaded in Muted Slate (#71717A)
  BR: { regionId: 'latam', regionName: 'Latin America (Brazil)', colorHex: '#71717A', statusLabel: 'Stockout Shock (Shielded)', roas: '1.80x' },
  AR: { regionId: 'latam', regionName: 'Latin America (Argentina)', colorHex: '#71717A', statusLabel: 'Stockout Shock (Shielded)', roas: '1.80x' },
  CL: { regionId: 'latam', regionName: 'Latin America (Chile)', colorHex: '#71717A', statusLabel: 'Stockout Shock (Shielded)', roas: '1.80x' },
  MX: { regionId: 'latam', regionName: 'Latin America (Mexico)', colorHex: '#71717A', statusLabel: 'Stockout Shock (Shielded)', roas: '1.80x' },
  CO: { regionId: 'latam', regionName: 'Latin America (Colombia)', colorHex: '#71717A', statusLabel: 'Stockout Shock (Shielded)', roas: '1.80x' },
};

// Track script loading state across mounts to prevent duplicate injections
let scriptsPromise: Promise<AmChartsGlobals> | null = null;

function loadAmChartsScripts(): Promise<AmChartsGlobals> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window not available (SSR)'));
  }

  const w = window as unknown as Record<string, unknown>;
  if (w.am5 && w.am5map && w.am5geodata_worldLow && w.am5themes_Animated) {
    return Promise.resolve({
      am5: w.am5,
      am5map: w.am5map,
      am5geodata_worldLow: w.am5geodata_worldLow,
      am5themes_Animated: w.am5themes_Animated,
    });
  }

  if (!scriptsPromise) {
    scriptsPromise = new Promise((resolve, reject) => {
      const scripts = [
        '/amcharts/index.js',
        '/amcharts/map.js',
        '/amcharts/worldLow.js',
        '/amcharts/Animated.js',
      ];

      function loadNext(index: number) {
        if (index >= scripts.length) {
          const win = window as unknown as Record<string, unknown>;
          if (win.am5 && win.am5map && win.am5geodata_worldLow && win.am5themes_Animated) {
            resolve({
              am5: win.am5,
              am5map: win.am5map,
              am5geodata_worldLow: win.am5geodata_worldLow,
              am5themes_Animated: win.am5themes_Animated,
            });
          } else {
            reject(new Error('AmCharts 5 objects not registered on window after script load'));
          }
          return;
        }

        const src = scripts[index];
        const existingScript = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
        if (existingScript) {
          if (existingScript.getAttribute('data-loaded') === 'true') {
            loadNext(index + 1);
          } else {
            existingScript.addEventListener('load', () => loadNext(index + 1));
            existingScript.addEventListener('error', (err) => reject(err));
          }
        } else {
          const script = document.createElement('script');
          script.src = src;
          script.async = false;
          script.onload = () => {
            script.setAttribute('data-loaded', 'true');
            loadNext(index + 1);
          };
          script.onerror = (err) => reject(err);
          document.head.appendChild(script);
        }
      }

      loadNext(0);
    });
  }

  return scriptsPromise;
}

export interface FrontFacingPurchasesResult {
  orders: RecentPurchase[];
  totalFacing: number;
}

/**
 * Calculates purchases on the front-facing hemisphere of the 3D orthographic globe.
 * Uses exact spherical cosine distance from camera center (camLon = -rotX, camLat = -rotY).
 * Returns both the truncated frontline orders (capped at maxCount) and total facing orders.
 */
export function getFrontFacingPurchases(
  rotX: number,
  rotY: number,
  selectedRegionId: string | null = null,
  maxCount = 4
): FrontFacingPurchasesResult {
  const camLon = -rotX;
  const camLat = -rotY;
  const rLat2 = (camLat * Math.PI) / 180;

  const scored = ALL_RECENT_PURCHASES.map((p) => {
    const rLat1 = (p.latitude * Math.PI) / 180;
    const rDlon = ((p.longitude - camLon) * Math.PI) / 180;
    const cosDist =
      Math.sin(rLat1) * Math.sin(rLat2) +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.cos(rDlon);

    // Give priority boost if this order belongs to the user-selected region
    const bonus = selectedRegionId && p.regionId === selectedRegionId ? 0.35 : 0;
    return {
      purchase: p,
      cosDist,
      score: cosDist + bonus,
    };
  });

  // Filter for front-facing items clearly facing the camera
  const frontFacing = scored.filter((s) => s.cosDist > 0.08);
  const totalFacing = frontFacing.length;

  if (frontFacing.length >= maxCount) {
    frontFacing.sort((a, b) => b.score - a.score);
    return {
      orders: frontFacing.slice(0, maxCount).map((s) => s.purchase),
      totalFacing,
    };
  }

  // Fallback if globe faces wide expanse of ocean: pick highest scored visible purchases
  scored.sort((a, b) => b.score - a.score);
  return {
    orders: scored.slice(0, maxCount).map((s) => s.purchase),
    totalFacing: Math.max(totalFacing, maxCount),
  };
}

export function GlobePulse({
  className = '',
  size = 580,
  selectedMarkerId,
  selectedRegionId,
  onSelectMarker,
  onSelectRegion,
  renderDetailPanel = false,
  showRecentPurchases = true,
  maxOrders,
}: GlobePulseProps) {
  const isCompact = size <= 420;

  // Truncation limit: caps orders (default: 4, or 3 for compact size <= 480) to eliminate vertical overflow
  const orderLimit = maxOrders ?? (size <= 480 ? 3 : 4);

  const reactId = useId();
  const containerId = 'am5_globe_' + reactId.replace(/[^a-zA-Z0-9]/g, '_');
  const rootRef = useRef<any>(null);
  const chartRef = useRef<any>(null);
  const polygonSeriesRef = useRef<any>(null);
  const pointSeriesRef = useRef<any>(null);
  const autoRotateAnimationRef = useRef<any>(null);

  // Resize amCharts canvas if container size prop updates
  useEffect(() => {
    if (rootRef.current && typeof rootRef.current.resize === 'function') {
      rootRef.current.resize();
    }
  }, [size]);

  // Layout refs for dynamic line tracking between purchases and globe dots
  const stageRef = useRef<HTMLDivElement>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const lineRefs = useRef<Record<string, SVGPathElement | null>>({});
  const dotAnchorRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const dotRingRefs = useRef<Record<string, SVGCircleElement | null>>({});
  const cardAnchorRefs = useRef<Record<string, SVGCircleElement | null>>({});

  const [hoveredPurchaseId, setHoveredPurchaseId] = useState<string | null>(null);
  const hoveredPurchaseIdRef = useRef<string | null>(null);
  useEffect(() => {
    hoveredPurchaseIdRef.current = hoveredPurchaseId;
  }, [hoveredPurchaseId]);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);
  const effectiveSelectedId =
    selectedRegionId !== undefined
      ? selectedRegionId
      : selectedMarkerId !== undefined
      ? selectedMarkerId
      : internalSelectedId;

  // Track effectiveSelectedId in a stable ref so amCharts callbacks and effects never recreate chart
  const effectiveSelectedIdRef = useRef<string | null>(effectiveSelectedId);
  useEffect(() => {
    effectiveSelectedIdRef.current = effectiveSelectedId;
  }, [effectiveSelectedId]);

  // Dynamic front-facing purchases state: changes as the globe turns and truncates to orderLimit
  const [frontOrdersData, setFrontOrdersData] = useState<FrontFacingPurchasesResult>(() =>
    getFrontFacingPurchases(-20, -15, effectiveSelectedId, orderLimit)
  );

  const visiblePurchases = frontOrdersData.orders;
  const totalOrdersInView = frontOrdersData.totalFacing;
  const truncatedCount = Math.max(0, totalOrdersInView - visiblePurchases.length);

  const visiblePurchasesRef = useRef<RecentPurchase[]>(visiblePurchases);
  const visiblePurchasesKeyRef = useRef<string>(visiblePurchases.map((p) => p.id).join(','));

  useEffect(() => {
    visiblePurchasesRef.current = visiblePurchases;
    visiblePurchasesKeyRef.current = visiblePurchases.map((p) => p.id).join(',');
  }, [visiblePurchases]);

  // Evaluates which orders are currently in front of the 3D globe and updates state
  const checkFrontFacingPurchases = useCallback(() => {
    if (!chartRef.current || typeof chartRef.current.get !== 'function') return;
    const rotX = chartRef.current.get('rotationX', 0);
    const rotY = chartRef.current.get('rotationY', 0);
    const nextResult = getFrontFacingPurchases(rotX, rotY, effectiveSelectedIdRef.current, orderLimit);
    const nextKey = nextResult.orders.map((p) => p.id).join(',');

    // Only update React state when the set of visible orders actually changes
    if (nextKey !== visiblePurchasesKeyRef.current) {
      visiblePurchasesKeyRef.current = nextKey;
      visiblePurchasesRef.current = nextResult.orders;
      setFrontOrdersData(nextResult);
    }
  }, [orderLimit]);

  const checkFrontFacingPurchasesRef = useRef(checkFrontFacingPurchases);
  useEffect(() => {
    checkFrontFacingPurchasesRef.current = checkFrontFacingPurchases;
  }, [checkFrontFacingPurchases]);

  // Update immediately whenever region selection changes
  useEffect(() => {
    checkFrontFacingPurchases();
  }, [effectiveSelectedId, checkFrontFacingPurchases]);

  // Periodic check as the globe auto-rotates or is panned (350ms throttle)
  useEffect(() => {
    if (!showRecentPurchases) return;
    const interval = setInterval(() => {
      checkFrontFacingPurchasesRef.current();
    }, 350);
    return () => clearInterval(interval);
  }, [showRecentPurchases]);

  // Stable callback refs to prevent stale closure and effect re-triggering
  const onSelectRegionRef = useRef(onSelectRegion);
  const onSelectMarkerRef = useRef(onSelectMarker);
  useEffect(() => {
    onSelectRegionRef.current = onSelectRegion;
    onSelectMarkerRef.current = onSelectMarker;
  }, [onSelectRegion, onSelectMarker]);

  // Direct, robust styling function: applies heatmap colors to all country polygons
  const applyCountryShading = useCallback((selectedId: string | null) => {
    if (!polygonSeriesRef.current) return;
    const w = window as unknown as Record<string, any>;
    const am5 = w.am5;
    if (!am5) return;

    const activeRegion = selectedId ? REGION_HEATMAP_DATA[selectedId] : null;

    const styleSinglePolygon = (polygon: any) => {
      if (!polygon) return;
      const countryCode = (
        (polygon.dataItem?.dataContext as any)?.id ||
        polygon.dataItem?.get?.('id') ||
        polygon.get?.('id')
      ) as string | undefined;

      if (!countryCode) return;

      const defaultInfo = COUNTRY_REGION_MAP[countryCode];
      const isCountryInActiveRegion = Boolean(
        activeRegion && activeRegion.countryCodes?.includes(countryCode)
      );

      if (activeRegion) {
        if (isCountryInActiveRegion) {
          // ACTIVE SELECTED REGION
          // If US is active: use #FF6B29 for US-West, #FF2E38 for US-East
          let activeColor = activeRegion.colorHex || '#FF2E38';
          if (countryCode === 'US') {
            activeColor = selectedId === 'us-west' ? '#FF6B29' : '#FF2E38';
          }

          polygon.setAll({
            fill: am5.color(activeColor),
            fillOpacity: 0.90,
            stroke: am5.color(0xffffff),
            strokeWidth: 2.2,
            tooltipText:
              countryCode === 'US'
                ? selectedId === 'us-west'
                  ? 'United States\nUS West (Ontario Hub) • High Sales Velocity • 4.40x ROAS • $51.9k Rev'
                  : 'United States\nUS East (Allentown Hub) • High Sales Velocity • 4.40x ROAS • $62.7k Rev'
                : `{name}\n${activeRegion.name} • ${activeRegion.roas} ROAS`,
          });
        } else if (defaultInfo) {
          // OTHER TRACKED COUNTRIES REMAIN VISIBLY SHADED IN THEIR HEATMAP HUE
          polygon.setAll({
            fill: am5.color(defaultInfo.colorHex),
            fillOpacity: 0.38,
            stroke: am5.color(defaultInfo.colorHex),
            strokeWidth: 0.6,
            tooltipText: `{name}\n${defaultInfo.regionName} • ${defaultInfo.roas} ROAS`,
          });
        } else {
          // Untracked background landmass
          polygon.setAll({
            fill: am5.color(0x121212),
            fillOpacity: 0.95,
            stroke: am5.color(0x222222),
            strokeWidth: 0.5,
            tooltipText: '{name}',
          });
        }
      } else {
        // GLOBAL BASELINE (NO REGION SELECTED):
        // The whole US region and all tracked countries are shaded in their proper thermal heatmap colors!
        if (defaultInfo) {
          polygon.setAll({
            fill: am5.color(defaultInfo.colorHex),
            fillOpacity: 0.70,
            stroke: am5.color(defaultInfo.colorHex),
            strokeWidth: 0.9,
            tooltipText:
              countryCode === 'US'
                ? 'United States\nUS East & West Hub • High Sales Velocity • 4.40x ROAS • $114.6k Total US Rev'
                : `{name}\n${defaultInfo.regionName} • ${defaultInfo.roas} ROAS`,
          });
        } else {
          // Untracked background landmass
          polygon.setAll({
            fill: am5.color(0x141414),
            fillOpacity: 0.95,
            stroke: am5.color(0x242424),
            strokeWidth: 0.5,
            tooltipText: '{name}',
          });
        }
      }
    };

    const ps = polygonSeriesRef.current;
    if (ps.mapPolygons && typeof ps.mapPolygons.each === 'function') {
      ps.mapPolygons.each((polygon: any) => {
        styleSinglePolygon(polygon);
      });
    }

    if (ps.dataItems && typeof ps.dataItems.each === 'function') {
      ps.dataItems.each((dataItem: any) => {
        const polygon = dataItem.get?.('mapPolygon');
        if (polygon) {
          styleSinglePolygon(polygon);
        }
      });
    }
  }, []);

  // Clicking on a datapoint or country polygon ALWAYS shows the data
  const handleSelectDatapoint = useCallback(
    (reg: PulseMarker) => {
      setInternalSelectedId(reg.id);
      effectiveSelectedIdRef.current = reg.id;
      onSelectRegionRef.current?.(reg);
      onSelectMarkerRef.current?.(reg);
      applyCountryShading(reg.id);
    },
    [applyCountryShading]
  );

  const handleSelectDatapointRef = useRef(handleSelectDatapoint);
  useEffect(() => {
    handleSelectDatapointRef.current = handleSelectDatapoint;
  }, [handleSelectDatapoint]);

  const applyCountryShadingRef = useRef(applyCountryShading);
  useEffect(() => {
    applyCountryShadingRef.current = applyCountryShading;
  }, [applyCountryShading]);

  const handleClearSelection = useCallback(() => {
    setInternalSelectedId(null);
    effectiveSelectedIdRef.current = null;
    onSelectRegionRef.current?.(null);
    onSelectMarkerRef.current?.(null);
    applyCountryShading(null);
  }, [applyCountryShading]);

  // Camera rotation to selected region using exact centroid
  useEffect(() => {
    if (!chartRef.current) return;

    if (!effectiveSelectedId) {
      // Resume gentle auto-rotation when no region is focused
      if (autoRotateAnimationRef.current && autoRotateAnimationRef.current.isPaused?.()) {
        autoRotateAnimationRef.current.resume();
      }
      return;
    }

    const region = REGION_HEATMAP_DATA[effectiveSelectedId];
    if (region && region.center) {
      // Pause auto-rotation when focusing a specific country/region
      if (autoRotateAnimationRef.current && !autoRotateAnimationRef.current.isPaused?.()) {
        autoRotateAnimationRef.current.pause();
      }

      const w = window as unknown as Record<string, any>;
      const am5 = w.am5;
      const easing = am5 ? am5.ease.inOut(am5.ease.cubic) : undefined;

      // Animate rotation to region centroid (exact amCharts formula)
      chartRef.current.animate({
        key: 'rotationX',
        to: -region.center[0],
        duration: 1200,
        easing,
      });
      chartRef.current.animate({
        key: 'rotationY',
        to: -region.center[1],
        duration: 1200,
        easing,
      });
    }
  }, [effectiveSelectedId]);

  // Update dots and country highlight states when selection changes
  useEffect(() => {
    if (!pointSeriesRef.current || !polygonSeriesRef.current) return;

    // Refresh dots appearance using safe dataItems iteration
    if (pointSeriesRef.current.dataItems) {
      pointSeriesRef.current.dataItems.each((dataItem: any) => {
        const bullets = dataItem.bullets;
        if (Array.isArray(bullets) && bullets.length > 0) {
          const bullet = bullets[0];
          if (bullet && typeof bullet.get === 'function') {
            const circle = bullet.get('sprite');
            if (circle && typeof circle.set === 'function') {
              const isSelected = effectiveSelectedId === dataItem.dataContext?.regionId;
              circle.set('radius', isSelected ? 6.5 : 4.0);
              circle.set('strokeOpacity', isSelected ? 1.0 : 0.4);
              circle.set('strokeWidth', isSelected ? 2.0 : 1.0);
              circle.set('fillOpacity', isSelected ? 1.0 : 0.88);
            }
          }
        }
      });
    }

    // Refresh full country polygon shading to match heatmap colors
    applyCountryShading(effectiveSelectedId);
  }, [effectiveSelectedId, applyCountryShading]);

  // Initialize amCharts Orthographic 3D Globe
  useEffect(() => {
    let isDisposed = false;

    loadAmChartsScripts()
      .then(({ am5, am5map, am5geodata_worldLow, am5themes_Animated }) => {
        if (isDisposed) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        // Clean previous root if exists
        if (rootRef.current) {
          rootRef.current.dispose();
          rootRef.current = null;
        }

        const root = am5.Root.new(containerId);
        rootRef.current = root;

        root.setThemes([am5themes_Animated.new(root)]);

        // 3D Orthographic Map Chart matching amcharts.com/demos/rotate-globe-to-a-selected-country
        const chart = root.container.children.push(
          am5map.MapChart.new(root, {
            panX: 'rotateX',
            panY: 'rotateY',
            projection: am5map.geoOrthographic(),
            rotationX: -20,
            rotationY: -15,
            paddingBottom: 10,
            paddingTop: 10,
            paddingLeft: 10,
            paddingRight: 10,
            background: am5.Rectangle.new(root, {
              fill: am5.color(0x000000),
              fillOpacity: 0,
            }),
          })
        );
        chartRef.current = chart;

        // Background Sphere (Ocean surface)
        const backgroundSeries = chart.series.push(am5map.MapPolygonSeries.new(root, {}));
        backgroundSeries.mapPolygons.template.setAll({
          fill: am5.color(0x080808),
          fillOpacity: 0.95,
          stroke: am5.color(0x181818),
          strokeWidth: 1,
        });
        backgroundSeries.data.push({
          geometry: am5map.getGeoRectangle(90, 180, -90, -180),
        });

        // Graticule Lines (Orthographic meridians and parallels)
        const graticuleSeries = chart.series.push(
          am5map.GraticuleSeries.new(root, {
            step: 15,
          })
        );
        graticuleSeries.mapLines.template.setAll({
          stroke: am5.color(0xffffff),
          strokeOpacity: 0.05,
        });

        // Main Country Polygons from official am5geodata_worldLow
        const polygonSeries = chart.series.push(
          am5map.MapPolygonSeries.new(root, {
            geoJSON: am5geodata_worldLow,
          })
        );
        polygonSeriesRef.current = polygonSeries;

        // Configure clean default template attributes (No conflicting adapters)
        polygonSeries.mapPolygons.template.setAll({
          fill: am5.color(0x141414),
          stroke: am5.color(0x222222),
          strokeWidth: 0.5,
          interactive: true,
          cursorOverStyle: 'pointer',
          tooltipText: '{name}',
        });

        polygonSeries.mapPolygons.template.states.create('hover', {
          fillOpacity: 1.0,
          stroke: am5.color(0xffffff),
          strokeWidth: 1.8,
        });

        // Clicking ANY country polygon triggers regional selection & shows telemetry data
        polygonSeries.mapPolygons.template.events.on('click', (ev: any) => {
          const target = ev.target;
          const countryCode = (
            (target.dataItem?.dataContext as any)?.id ||
            target.dataItem?.get?.('id') ||
            target.get?.('id')
          ) as string | undefined;

          if (!countryCode) return;

          if (countryCode === 'US') {
            // If currently us-east, toggle to us-west or vice versa; default to us-east
            const currentSelected = effectiveSelectedIdRef.current;
            const targetRegion =
              currentSelected === 'us-east'
                ? REGION_HEATMAP_DATA['us-west']
                : REGION_HEATMAP_DATA['us-east'];
            handleSelectDatapointRef.current(targetRegion);
          } else {
            const matchedRegion = GLOBE_REGIONS.find((r) =>
              r.countryCodes?.includes(countryCode)
            );
            if (matchedRegion) {
              handleSelectDatapointRef.current(matchedRegion);
            }
          }
        });

        // Immediately apply proper heatmap color shading across all countries (US, EU, APAC, etc.)
        const triggerShading = () => {
          applyCountryShadingRef.current(effectiveSelectedIdRef.current);
        };

        triggerShading();
        polygonSeries.events.on('datavalidated', triggerShading);
        chart.events.on('ready', triggerShading);
        requestAnimationFrame(triggerShading);

        // Regional Heatmap Dots Series: discrete telemetry coordinate markers
        const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));
        pointSeriesRef.current = pointSeries;

        pointSeries.bullets.push((_root: any, _series: any, dataItem: any) => {
          const dotData = dataItem.dataContext;
          const reg = REGION_HEATMAP_DATA[dotData.regionId];
          const colorVal = reg?.colorHex ? am5.color(reg.colorHex) : am5.color(0xffffff);

          const circle = am5.Circle.new(root, {
            radius: 4.0,
            fill: colorVal,
            fillOpacity: 0.9,
            stroke: am5.color(0xffffff),
            strokeWidth: 1.0,
            strokeOpacity: 0.4,
            interactive: true,
            cursorOverStyle: 'pointer',
            tooltipText: '{name}\n{statusLabel} • {roas} ROAS',
          });

          circle.states.create('hover', {
            radius: 6.5,
            fillOpacity: 1.0,
            strokeOpacity: 0.9,
            strokeWidth: 2.0,
          });

          // Clicking a datapoint on the model shows the data!
          circle.events.on('click', () => {
            if (reg) {
              handleSelectDatapointRef.current(reg);
            }
          });

          return am5.Bullet.new(root, { sprite: circle });
        });

        // Flatten all regional dots into the pointSeries with rich telemetry metadata
        const allDots: any[] = [];
        for (const reg of GLOBE_REGIONS) {
          if (reg.dots) {
            for (const d of reg.dots) {
              allDots.push({
                geometry: {
                  type: 'Point',
                  coordinates: [d.longitude, d.latitude],
                },
                name: d.name,
                regionId: d.regionId,
                regionName: reg.name,
                statusLabel: reg.statusLabel,
                roas: reg.roas,
                colorHex: reg.colorHex,
              });
            }
          }
        }
        pointSeries.data.setAll(allDots);

        // Smooth Auto-Rotation
        const animateRotation = () => {
          autoRotateAnimationRef.current = chart.animate({
            key: 'rotationX',
            from: chart.get('rotationX', 0),
            to: chart.get('rotationX', 0) + 360,
            duration: 38000,
            loops: Infinity,
            easing: am5.ease.linear,
          });
        };
        animateRotation();

        // Pause auto-rotation on user drag interaction
        chart.events.on('panstarted', () => {
          if (autoRotateAnimationRef.current) {
            autoRotateAnimationRef.current.pause();
          }
        });

        // Immediately update frontline orders when user finishes rotating the globe
        chart.events.on('panended', () => {
          checkFrontFacingPurchasesRef.current();
        });

        chart.appear(1000, 100);
      })
      .catch((err) => {
        console.error('Failed to load amCharts 5:', err);
      });

    return () => {
      isDisposed = true;
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [containerId]);

  // Dynamic line tracking: connects recent purchase cards to exact dots on the 3D globe
  useEffect(() => {
    if (!showRecentPurchases) return;
    let animationFrameId: number;

    // Cache layout bounding rects to prevent forced browser layout reflow (layout thrashing) on every 16ms frame
    let cachedStageRect: { left: number; top: number } | null = null;
    let cachedGlobeRect: { left: number; top: number } | null = null;
    let cachedCardRects: Record<string, { x: number; y: number }> = {};
    let lastRectMeasureTime = 0;

    const measureLayout = () => {
      if (!stageRef.current || !globeContainerRef.current) return;
      const sRect = stageRef.current.getBoundingClientRect();
      const gRect = globeContainerRef.current.getBoundingClientRect();
      cachedStageRect = { left: sRect.left, top: sRect.top };
      cachedGlobeRect = { left: gRect.left, top: gRect.top };
      cachedCardRects = {};
      const currentPurchases = visiblePurchasesRef.current;
      for (const purchase of currentPurchases) {
        const cardEl = cardRefs.current[purchase.id];
        if (cardEl) {
          const cRect = cardEl.getBoundingClientRect();
          cachedCardRects[purchase.id] = {
            x: cRect.left - sRect.left,
            y: cRect.top + cRect.height / 2 - sRect.top,
          };
        }
      }
      lastRectMeasureTime = performance.now();
    };

    const updateLines = () => {
      if (
        stageRef.current &&
        globeContainerRef.current &&
        chartRef.current &&
        typeof chartRef.current.get === 'function' &&
        typeof chartRef.current.convert === 'function'
      ) {
        const now = performance.now();
        // Remeasure layout rects only once every 300ms or when uninitialized
        if (!cachedStageRect || now - lastRectMeasureTime > 300) {
          measureLayout();
        }

        const chart = chartRef.current;
        const stageRect = cachedStageRect;
        const globeRect = cachedGlobeRect;

        if (stageRect && globeRect) {
          const rotX = chart.get('rotationX', 0);
          const rotY = chart.get('rotationY', 0);
          const camLon = -rotX;
          const camLat = -rotY;
          const rLat2 = (camLat * Math.PI) / 180;
          const currentPurchases = visiblePurchasesRef.current;
          const activeIds = new Set(currentPurchases.map((p) => p.id));

          // Immediately hide connecting lines and anchors for orders that have turned off-screen
          for (const id of Object.keys(lineRefs.current)) {
            if (!activeIds.has(id)) {
              lineRefs.current[id]?.setAttribute('opacity', '0');
              dotAnchorRefs.current[id]?.setAttribute('opacity', '0');
              dotRingRefs.current[id]?.setAttribute('opacity', '0');
              cardAnchorRefs.current[id]?.setAttribute('opacity', '0');
            }
          }

          for (const purchase of currentPurchases) {
            const cardPos = cachedCardRects[purchase.id];
            const pathEl = lineRefs.current[purchase.id];
            const dotAnchorEl = dotAnchorRefs.current[purchase.id];
            const dotRingEl = dotRingRefs.current[purchase.id];
            const cardAnchorEl = cardAnchorRefs.current[purchase.id];

            if (!cardPos || !pathEl || !dotAnchorEl || !dotRingEl || !cardAnchorEl) {
              continue;
            }

            const cardX = cardPos.x;
            const cardY = cardPos.y;

            // Check if coordinate is on the visible front hemisphere of the 3D globe
            const rLat1 = (purchase.latitude * Math.PI) / 180;
            const rDlon = ((purchase.longitude - camLon) * Math.PI) / 180;
            const cosDistance =
              Math.sin(rLat1) * Math.sin(rLat2) +
              Math.cos(rLat1) * Math.cos(rLat2) * Math.cos(rDlon);

            const isVisible = cosDistance > 0.08;

            if (isVisible) {
              const pt = chart.convert({
                longitude: purchase.longitude,
                latitude: purchase.latitude,
              });

              if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
                const dotX = globeRect.left - stageRect.left + pt.x;
                const dotY = globeRect.top - stageRect.top + pt.y;

                const deltaX = cardX - dotX;
                const ctrl1X = cardX - Math.min(80, deltaX * 0.45);
                const ctrl2X = dotX + Math.min(100, deltaX * 0.45);
                const d = `M ${cardX} ${cardY} C ${ctrl1X} ${cardY}, ${ctrl2X} ${dotY}, ${dotX} ${dotY}`;

                const isHovered = hoveredPurchaseIdRef.current === purchase.id;
                const isSelected = effectiveSelectedIdRef.current === purchase.regionId;

                pathEl.setAttribute('d', d);
                pathEl.setAttribute('opacity', isHovered ? '1.0' : isSelected ? '0.90' : '0.45');
                pathEl.setAttribute('stroke', isHovered || isSelected ? '#FFFFFF' : '#8A8A8A');
                pathEl.setAttribute('stroke-width', isHovered || isSelected ? '1.8' : '1.0');
                pathEl.setAttribute('stroke-dasharray', isHovered ? 'none' : isSelected ? '6 3' : '3 3');

                dotAnchorEl.setAttribute('cx', String(dotX));
                dotAnchorEl.setAttribute('cy', String(dotY));
                dotAnchorEl.setAttribute('opacity', isHovered ? '1.0' : '0.85');
                dotAnchorEl.setAttribute('r', isHovered ? '4.5' : '3.5');

                dotRingEl.setAttribute('cx', String(dotX));
                dotRingEl.setAttribute('cy', String(dotY));
                dotRingEl.setAttribute('opacity', isHovered || isSelected ? '0.9' : '0.35');
                dotRingEl.setAttribute('r', isHovered ? '9' : '6.5');

                cardAnchorEl.setAttribute('cx', String(cardX));
                cardAnchorEl.setAttribute('cy', String(cardY));
                cardAnchorEl.setAttribute('opacity', isHovered ? '1.0' : '0.65');
              }
            } else {
              pathEl.setAttribute('opacity', '0');
              dotAnchorEl.setAttribute('opacity', '0');
              dotRingEl.setAttribute('opacity', '0');
              cardAnchorEl.setAttribute('opacity', '0');
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateLines);
    };

    animationFrameId = requestAnimationFrame(updateLines);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [showRecentPurchases, size]);

  const selectedRegion = effectiveSelectedId ? REGION_HEATMAP_DATA[effectiveSelectedId] : null;

  return (
    <div
      ref={stageRef}
      className={cn(
        'relative flex flex-col xl:flex-row items-center justify-center select-none overflow-hidden max-w-full w-full',
        isCompact ? 'gap-3 xl:gap-4' : 'gap-6 xl:gap-8',
        className
      )}
    >
      {/* 3D Map canvas container */}
      <div
        ref={globeContainerRef}
        className='relative flex items-center justify-center shrink-0'
        style={{ width: size, height: size, maxWidth: '100%' }}
      >
        <div
          id={containerId}
          className='size-full cursor-grab active:cursor-grabbing rounded-full overflow-hidden'
          style={{ width: size, height: size }}
        />
      </div>

      {/* Dynamic SVG Connecting Lines Layer (draws line from each rectangle to exact dot on globe) */}
      {showRecentPurchases && (
        <svg
          className='absolute inset-0 pointer-events-none w-full h-full z-10 overflow-visible'
          aria-hidden='true'
        >
          {visiblePurchases.map((purchase) => (
            <g key={purchase.id}>
              <path
                ref={(el) => {
                  lineRefs.current[purchase.id] = el;
                }}
                fill='none'
                stroke='#8A8A8A'
                strokeWidth='1.0'
                strokeDasharray='3 3'
                opacity='0'
              />
              <circle
                ref={(el) => {
                  dotAnchorRefs.current[purchase.id] = el;
                }}
                r='3.5'
                fill='#FFFFFF'
                opacity='0'
              />
              <circle
                ref={(el) => {
                  dotRingRefs.current[purchase.id] = el;
                }}
                r='6.5'
                fill='none'
                stroke='#FFFFFF'
                strokeWidth='1'
                opacity='0'
              />
              <circle
                ref={(el) => {
                  cardAnchorRefs.current[purchase.id] = el;
                }}
                r='2.5'
                fill='#FFFFFF'
                opacity='0'
              />
            </g>
          ))}
        </svg>
      )}

      {/* Right Column: Small Rectangles based on Recent Product Purchases */}
      {showRecentPurchases && (
        <div
          className={cn(
            'flex flex-col shrink-0 z-20 overflow-hidden',
            isCompact ? 'w-full xl:w-[210px] 2xl:w-[220px] gap-1.5' : 'w-full xl:w-[260px] 2xl:w-[280px] gap-2'
          )}
          style={{ maxHeight: size ? `${size}px` : undefined }}
        >
          {/* Header Bar */}
          <div className='flex items-center justify-between pb-1.5 border-b border-[#1A1A1A] font-mono text-[10px] uppercase text-[#8A8A8A] tracking-wider shrink-0'>
            <div className='flex items-center gap-1.5'>
              <span className='size-1.5 rounded-full bg-white' />
              <span className='text-white font-bold tracking-tight'>Frontline Orders</span>
              {truncatedCount > 0 && (
                <span
                  title={`${truncatedCount} additional front-facing orders truncated to fit container vertically`}
                  className='text-[8px] font-mono px-1 py-0.2 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#8A8A8A]'
                >
                  +{truncatedCount} truncated
                </span>
              )}
            </div>
            <span className='text-[9px] text-[#8A8A8A] shrink-0 font-medium'>
              Top {visiblePurchases.length} Active
            </span>
          </div>

          {/* Cards List: Dynamically changes based on what's currently in front of the globe */}
          <div className='flex flex-col gap-1.5 font-mono overflow-y-auto no-scrollbar'>
            {visiblePurchases.map((purchase) => {
              const isHovered = hoveredPurchaseId === purchase.id;
              const isTargetRegion = effectiveSelectedId === purchase.regionId;

              return (
                <button
                  type='button'
                  key={purchase.id}
                  ref={(el) => {
                    cardRefs.current[purchase.id] = el;
                  }}
                  onMouseEnter={() => setHoveredPurchaseId(purchase.id)}
                  onMouseLeave={() => setHoveredPurchaseId(null)}
                  onClick={() => {
                    const targetReg = REGION_HEATMAP_DATA[purchase.regionId];
                    if (targetReg) {
                      handleSelectDatapoint(targetReg);
                    }
                    if (chartRef.current) {
                      const w = window as unknown as Record<string, unknown>;
                      const am5 = (w as { am5?: { ease?: { inOut?: (e: unknown) => unknown; cubic?: unknown } } }).am5;
                      const easing = am5?.ease?.inOut ? am5.ease.inOut(am5.ease.cubic) : undefined;
                      chartRef.current.animate({
                        key: 'rotationX',
                        to: -purchase.longitude,
                        duration: 1200,
                        easing,
                      });
                      chartRef.current.animate({
                        key: 'rotationY',
                        to: -purchase.latitude,
                        duration: 1200,
                        easing,
                      });
                    }
                  }}
                  className={cn(
                    'group relative rounded bg-[#000000] border text-left cursor-pointer transition-all duration-150 flex flex-col w-full shrink-0',
                    isCompact ? 'p-1.5 gap-0.5' : 'p-2 gap-0.5',
                    isHovered || isTargetRegion
                      ? 'border-white bg-[#1A1A1A] shadow-md shadow-white/5 ring-1 ring-white/20'
                      : 'border-[#1A1A1A] hover:border-[#8A8A8A]'
                  )}
                >
                  {/* City + Pulse Indicator + Timestamp */}
                  <div className='flex items-center justify-between text-[10px] w-full'>
                    <div className='flex items-center gap-1.5 truncate'>
                      <span className='size-1.5 rounded-full bg-white shrink-0' />
                      <span className='font-bold text-white truncate'>{purchase.city}</span>
                    </div>
                    <span className='text-[9px] text-[#8A8A8A] shrink-0 font-medium'>
                      {purchase.timeAgo}
                    </span>
                  </div>

                  {/* Product Name + Price */}
                  <div
                    className={cn(
                      'flex items-center justify-between gap-1 font-semibold text-white w-full',
                      isCompact ? 'text-[10px]' : 'text-[11px]'
                    )}
                  >
                    <span className='truncate'>{purchase.productName}</span>
                    <span className='text-[10px] text-white font-bold shrink-0'>
                      ${purchase.price.toFixed(2)}
                    </span>
                  </div>

                  {/* SKU + Channel Badge + Fulfillment Hub */}
                  <div
                    className={cn(
                      'flex items-center justify-between text-[#8A8A8A] pt-0.5 border-t border-[#1A1A1A] w-full',
                      isCompact ? 'text-[8.5px]' : 'text-[9px]'
                    )}
                  >
                    <span className='truncate'>SKU: {purchase.sku}</span>
                    <span
                      className={cn(
                        'rounded border border-[#1A1A1A] text-white bg-[#0A0A0A] shrink-0 font-semibold',
                        isCompact ? 'px-1 py-0.2 text-[8px]' : 'px-1.5 py-0.2 text-[9px]'
                      )}
                    >
                      {purchase.channelLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className='text-[8.5px] text-[#8A8A8A] tracking-wider text-center pt-1 border-t border-[#1A1A1A] shrink-0 flex items-center justify-between px-0.5'>
            <span>CLICK TO FOCUS GLOBE</span>
            <span className='text-[#666666]'>TRUNCATED (MAX {orderLimit})</span>
          </div>
        </div>
      )}

      {/* Optional In-Component Detail Panel */}
      {renderDetailPanel && selectedRegion && (
        <div className='absolute top-0 right-0 z-50 w-full max-w-sm shadow-none animate-in fade-in-0 slide-in-from-right-4'>
          <RegionDetailPanel
            marker={selectedRegion}
            isOpen={Boolean(selectedRegion)}
            onClose={handleClearSelection}
          />
        </div>
      )}
    </div>
  );
}
