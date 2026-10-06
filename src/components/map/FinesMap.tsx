import React, { useEffect, useState, useRef, createElement } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Fine, CameraHotspot } from '../../types';
import { formatCurrency } from '../../utils/formatters';
// Dynamically inject leaflet CSS to avoid needing to modify index.html
const injectLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }
};
interface FinesMapProps {
  viewMode: 'fines' | 'hotspots';
  fines: Fine[];
  hotspots: CameraHotspot[];
}
export function FinesMap({ viewMode, fines, hotspots }: FinesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const { state } = useAppStore();
  const [L, setL] = useState<any>(null);
  useEffect(() => {
    injectLeafletCSS();
    // Dynamically import leaflet to avoid SSR issues if this were Next.js,
    // and to keep the bundle clean until needed.
    import('leaflet').then((leaflet) => {
      setL(leaflet.default || leaflet);
    });
  }, []);
  useEffect(() => {
    if (!L || !mapRef.current) return;
    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([-28.5, 24.5], 5); // Center of SA
      const tileUrl = state.isDarkMode ?
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' :
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(tileUrl, {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
      markersLayerRef.current = L.featureGroup().addTo(mapInstanceRef.current);
    } else {
      // Update tile layer on theme change
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.TileLayer) {
          const newUrl = state.isDarkMode ?
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' :
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
          layer.setUrl(newUrl);
        }
      });
    }
    // Clear existing markers
    markersLayerRef.current.clearLayers();
    if (viewMode === 'fines') {
      fines.forEach((fine) => {
        if (fine.lat && fine.lng) {
          const color =
          fine.status === 'paid' ?
          '#10b981' :
          fine.status === 'disputed' ?
          '#3b82f6' :
          '#f59e0b';
          const markerHtml = `
            <div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          `;
          const icon = L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          const popupContent = `
            <div class="p-2 min-w-[200px]">
              <div class="font-bold text-sm mb-1">${fine.offenceType}</div>
              <div class="text-xs text-gray-600 mb-2">${fine.location}</div>
              <div class="flex justify-between items-center">
                <span class="font-bold">${formatCurrency(fine.amount)}</span>
                <span class="text-xs px-2 py-1 rounded-full bg-gray-100 uppercase">${fine.status}</span>
              </div>
            </div>
          `;
          L.marker([fine.lat, fine.lng], {
            icon
          }).
          bindPopup(popupContent).
          addTo(markersLayerRef.current);
        }
      });
    } else {
      hotspots.forEach((hotspot) => {
        const radius = Math.max(500, hotspot.totalFines * 2); // Scale radius by fines
        L.circle([hotspot.lat, hotspot.lng], {
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.4,
          radius: radius
        }).
        bindPopup(
          `
          <div class="p-2">
            <div class="font-bold text-sm mb-1">${hotspot.name}</div>
            <div class="text-xs text-gray-600 mb-2">Total Fines: ${hotspot.totalFines}</div>
            <div class="text-xs text-red-600 font-bold">Dispute Success Rate: ${hotspot.disputeRate}%</div>
          </div>
        `
        ).
        addTo(markersLayerRef.current);
      });
    }
    // Fit bounds if there are markers
    if (markersLayerRef.current.getLayers().length > 0) {
      mapInstanceRef.current.fitBounds(markersLayerRef.current.getBounds(), {
        padding: [50, 50]
      });
    }
  }, [L, viewMode, fines, hotspots, state.isDarkMode]);
  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 z-0 relative">
      <div ref={mapRef} className="absolute inset-0 z-0" />
    </div>);

}