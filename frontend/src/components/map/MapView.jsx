import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Compass, Navigation, Layers, ExternalLink, RefreshCw } from 'lucide-react';
import LeafletTripMap from '../maps/LeafletTripMap';
import NearbyPlacesList from '../maps/NearbyPlacesList';
import { normalizeMapPlace } from '../../utils/geoUtils';

const MapView = ({
  destinationName = '',
  originName = '',
  hotel = null,
  hotels = [],
  places = [],
  itinerary = [],
  destinationCenter = null,
  selectedPlace = null,
  onSelectHotel,
  onSelectPlace,
  height = 'min(70vh, 650px)'
}) => {
  const [selectedMapItem, setSelectedMapItem] = useState(selectedPlace);
  const mapSectionRef = useRef(null);

  useEffect(() => {
    if (selectedPlace) {
      setSelectedMapItem(selectedPlace);
    }
  }, [selectedPlace]);

  // Group places into attractions, restaurants, and itinerary stops
  const { attractions, restaurants, itineraryStops } = useMemo(() => {
    const attr = [];
    const rest = [];
    const stops = [];

    (places || []).forEach(p => {
      const normalized = normalizeMapPlace(p);
      if (normalized?.category === 'restaurant' || normalized?.category === 'cafe') {
        rest.push(p);
      } else {
        attr.push(p);
      }
    });

    // Extract stops from daily itinerary
    (itinerary || []).forEach(day => {
      const dayNum = day.day || 1;
      (day.activities || day.places || []).forEach((act, actIdx) => {
        if (act.latitude && act.longitude) {
          stops.push({
            ...act,
            day: dayNum,
            stopIndex: actIdx + 1,
            isItineraryStop: true
          });
        }
      });
    });

    return { attractions: attr, restaurants: rest, itineraryStops: stops };
  }, [places, itinerary]);

  // Handle place selection from map or list
  const handleSelectPlace = (place) => {
    setSelectedMapItem(place);
    if (place?.category === 'hotel' && onSelectHotel) {
      onSelectHotel(place.originalData || place);
    } else if (onSelectPlace) {
      onSelectPlace(place.originalData || place);
    }
  };

  // Primary reference hotel for nearby calculations
  const referenceHotel = useMemo(() => {
    const primary = hotel || hotels[0];
    return primary ? normalizeMapPlace(primary, 'hotel') : null;
  }, [hotel, hotels]);

  return (
    <div ref={mapSectionRef} className="space-y-4">
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
              Interactive Geospatial Map
            </span>
          </div>
          <h3 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white tracking-tight">
            EXPLORE YOUR TRIP
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time OpenStreetMap visualization with verified locations, OSRM driving routes, and nearby discovery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            OPENSTREETMAP & OSRM
          </span>
        </div>
      </div>

      {/* Main Leaflet OpenStreetMap */}
      <LeafletTripMap
        destinationName={destinationName}
        originName={originName}
        center={destinationCenter}
        hotels={hotel ? [hotel, ...hotels.filter(h => h.id !== hotel.id)] : hotels}
        attractions={attractions}
        restaurants={restaurants}
        itineraryStops={itineraryStops}
        selectedPlace={selectedMapItem}
        onSelectPlace={handleSelectPlace}
        height={height}
      />

      {/* Nearby Places Section around primary hotel */}
      {referenceHotel && (
        <NearbyPlacesList
          referencePlace={selectedMapItem || referenceHotel}
          places={[...attractions, ...restaurants].map(p => normalizeMapPlace(p))}
          onSelectPlace={handleSelectPlace}
          onGetDirections={(p) => handleSelectPlace(p)}
        />
      )}
    </div>
  );
};

export default MapView;
