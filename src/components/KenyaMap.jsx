import React from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const KenyaMap = ({ houses }) => {
  const kenyaBounds = [
    [5.0, 33.5], // Northeast coordinates
    [-5.0, 42.0], // Southwest coordinates
  ];

  // Mapping of location strings to coordinates
  const locationCoords = {
    'Nairobi': [-1.2921, 36.8219],
    'Mombasa': [-4.0435, 39.6682],
    'Kisumu': [-0.0917, 34.7680],
    'Thika': [-1.0478, 37.0726]
  };

  // Create markers for houses with known locations
  const houseMarkers = houses
    .filter(house => locationCoords[house.location])
    .map(house => ({
      ...house,
      position: locationCoords[house.location]
    }));

  return (
    <div className="map-container">
      <MapContainer bounds={ kenyaBounds } scrollWheelZoom={ false }>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        { houseMarkers.map(house => (
          <Marker key={ house.id } position={ house.position }>
            <Popup>
              <strong>{ house.name }</strong>
              <br />
              Location: { house.location }
              <br />
              Price: KES { house.price.toLocaleString() } / night
              <br />
              Bedrooms: { house.bedrooms }, Bathrooms: { house.bathrooms }
            </Popup>
          </Marker>
        )) }
      </MapContainer>
    </div>
  );
};

export default KenyaMap;