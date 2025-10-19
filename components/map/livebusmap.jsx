import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Bus, Navigation } from "lucide-react";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom bus icon
const createBusIcon = (color) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        background: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 3px solid white;
        animation: pulse 2s ease-in-out infinite;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
          <rect x="3" y="6" width="18" height="12" rx="2"></rect>
          <path d="M3 12h18"></path>
          <path d="M7 18v2"></path>
          <path d="M17 18v2"></path>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// Component to handle map centering
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

export default function LiveBusMap({ routes, selectedRoute, onBusClick }) {
  const [liveBuses, setLiveBuses] = useState([]);
  const [mapCenter, setMapCenter] = useState([18.1124, 83.4309]); // Vizianagaram
  const [mapZoom, setMapZoom] = useState(12);

  // Simulate live bus positions
  useEffect(() => {
    const simulateBusMovement = () => {
      const buses = [];
      
      routes.forEach(route => {
        if (route.route_path && route.route_path.length > 0) {
          const activeBuses = route.active_buses || 2;
          
          for (let i = 0; i < activeBuses; i++) {
            const progress = (i / activeBuses) + (Date.now() % 10000) / 50000;
            const index = Math.floor(progress * route.route_path.length) % route.route_path.length;
            const position = route.route_path[index];
            
            buses.push({
              id: `${route.route_number}-${i}`,
              routeNumber: route.route_number,
              routeName: route.route_name,
              position: [position.lat, position.lng],
              color: route.color || '#0ea5e9',
              nextStop: route.stops?.[Math.min(index + 1, route.stops.length - 1)]?.name || 'Next stop',
              eta: `${Math.floor(Math.random() * 10) + 2} mins`,
              passengers: Math.floor(Math.random() * 40) + 10,
            });
          }
        }
      });
      
      setLiveBuses(buses);
    };

    simulateBusMovement();
    const interval = setInterval(simulateBusMovement, 2000);
    
    return () => clearInterval(interval);
  }, [routes]);

  // Center map on selected route
  useEffect(() => {
    if (selectedRoute && selectedRoute.route_path && selectedRoute.route_path.length > 0) {
      const midPoint = selectedRoute.route_path[Math.floor(selectedRoute.route_path.length / 2)];
      setMapCenter([midPoint.lat, midPoint.lng]);
      setMapZoom(13);
    }
  }, [selectedRoute]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route lines */}
        {routes.map(route => {
          if (!selectedRoute || selectedRoute.id === route.id) {
            return (
              <Polyline
                key={route.id}
                positions={route.route_path?.map(p => [p.lat, p.lng]) || []}
                color={route.color || '#0ea5e9'}
                weight={4}
                opacity={0.7}
              />
            );
          }
          return null;
        })}

        {/* Live buses */}
        {liveBuses.map(bus => {
          if (!selectedRoute || selectedRoute.route_number === bus.routeNumber) {
            return (
              <Marker
                key={bus.id}
                position={bus.position}
                icon={createBusIcon(bus.color)}
                eventHandlers={{
                  click: () => onBusClick && onBusClick(bus)
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-bold text-sm">{bus.routeNumber}</h3>
                    <p className="text-xs text-gray-600">{bus.routeName}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs"><strong>Next:</strong> {bus.nextStop}</p>
                      <p className="text-xs"><strong>ETA:</strong> {bus.eta}</p>
                      <p className="text-xs"><strong>Passengers:</strong> {bus.passengers}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          }
          return null;
        })}
      </MapContainer>
    </div>
  );
}