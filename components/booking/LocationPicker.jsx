// components/booking/LocationPicker.js - Fixed Google Maps styling issue
import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';

const LocationPicker = ({ type, onLocationSelect, onClose, currentLocation = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const mapRef = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Initialize map
  useEffect(() => {
    // Check if API key is available
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setMapError('Google Maps API key is not configured');
      setApiKeyError(true);
      return;
    }

    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeMap();
    }

    // Cleanup on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle search term changes with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length > 2 && !apiKeyError) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(searchTerm);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, apiKeyError]);

  const loadGoogleMapsScript = () => {
    // Check if script is already being loaded
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      // Script already exists, wait for it to load
      const checkGoogleMaps = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleMaps);
          initializeMap();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    // Updated to include marker library for AdvancedMarkerElement
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,marker&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Add global callback for script loading
    window.initMap = () => {
      initializeMap();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps script:', error);
      setMapError('Failed to load Google Maps. Please check your internet connection.');
      setApiKeyError(true);
    };
    
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) {
      return;
    }

    try {
      // Default to city center (customize based on your service area)
      const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City

      // Option 1: Use mapId without custom styles (styles managed in Cloud Console)
      map.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: 'DEMO_MAP_ID', // Keep mapId but remove styles array
      });

      // Option 2: Alternative - Remove mapId and use custom styles
      /*
      map.current = new window.google.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        // No mapId when using custom styles
        styles: [
          {
            "elementType": "geometry",
            "stylers": [{ "color": "#1a1a1a" }]
          },
          {
            "elementType": "labels.icon",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#8a8a8a" }]
          },
          {
            "elementType": "labels.text.stroke",
            "stylers": [{ "color": "#1a1a1a" }]
          },
          {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [{ "color": "#757575" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#2c2c2c" }]
          },
          {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#9ca5b3" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{ "color": "#000000" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#3d3d3d" }]
          }
        ]
      });
      */

      // Add click listener to map
      map.current.addListener('click', (event) => {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        // Update marker immediately
        updateMapMarker(location);
        
        // Process and auto-confirm location
        processMapClick(location);
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.current.setCenter(userLocation);
            map.current.setZoom(14);
          },
          (error) => {
            // Silently fail and use default location
          },
          { timeout: 5000 }
        );
      }

      setMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

  const searchLocations = async (query) => {
    if (!window.google || !map.current || apiKeyError) return;

    setLoading(true);
    
    try {
      // Only use the new Places API with text search
      const { Place } = await google.maps.importLibrary("places");
      
      const request = {
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
        locationBias: map.current.getCenter(),
      };

      // Use searchByText from the new Places library
      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        // Convert to format compatible with existing code
        const formattedResults = places.slice(0, 5).map(place => ({
          name: place.displayName,
          formatted_address: place.formattedAddress,
          geometry: {
            location: place.location
          },
          place_id: place.id
        }));
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Places API search error:', error);
      setLoading(false);
      setSearchResults([]);
      
      // If Places API fails, show error and disable search
      if (error.message.includes('REQUEST_DENIED') || error.message.includes('API_KEY_INVALID')) {
        setApiKeyError(true);
        setMapError('Places API access denied. Please check your API key configuration and ensure Places API is enabled.');
      } else {
        // For other errors, just log and continue with map-only functionality
        console.warn('Places API unavailable, search functionality disabled. Users can still click on map.');
      }
    }
  };

  // Process map click and auto-confirm location
  const processMapClick = async (location) => {
    // Update marker immediately
    updateMapMarker(location);
    
    // Try to get address via reverse geocoding
    if (window.google && !apiKeyError) {
      try {
        const geocoder = new window.google.maps.Geocoder();
        
        geocoder.geocode({ location }, (results, status) => {
          let locationData;
          
          if (status === 'OK' && results && results.length > 0) {
            const result = results[0];
            const displayAddress = getDisplayAddressFromGeocode(result);
            
            locationData = {
              displayAddress: displayAddress,
              fullAddress: result.formatted_address,
              coordinates: location,
              placeId: result.place_id,
              addressComponents: result.address_components,
              isCoordinateOnly: false
            };
          } else {
            // Fallback to coordinates
            locationData = {
              displayAddress: `Selected Location`,
              fullAddress: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
              coordinates: location,
              placeId: null,
              isCoordinateOnly: true
            };
          }
          
          // Auto-confirm location immediately
          onLocationSelect(locationData);
        });
      } catch (error) {
        // Fallback to coordinates only
        const locationData = {
          displayAddress: `Selected Location`,
          fullAddress: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
          coordinates: location,
          placeId: null,
          isCoordinateOnly: true
        };
        
        onLocationSelect(locationData);
      }
    } else {
      // API not available, use coordinates
      const locationData = {
        displayAddress: `Selected Location`,
        fullAddress: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
        coordinates: location,
        placeId: null,
        isCoordinateOnly: true
      };
      
      onLocationSelect(locationData);
    }
  };

  // Extract meaningful address from geocoding result
  const getDisplayAddressFromGeocode = (result) => {
    if (!result.address_components) {
      const parts = result.formatted_address.split(', ');
      return parts.slice(0, 2).join(', ') || result.formatted_address;
    }

    const components = result.address_components;
    let streetNumber = '';
    let route = '';
    let neighborhood = '';
    let locality = '';
    let sublocality = '';
    
    components.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) {
        streetNumber = component.long_name;
      } else if (types.includes('route')) {
        route = component.long_name;
      } else if (types.includes('neighborhood')) {
        neighborhood = component.long_name;
      } else if (types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
        sublocality = component.long_name;
      }
    });
    
    // Build display address
    if (streetNumber && route) {
      let display = `${streetNumber} ${route}`;
      if (sublocality) display += `, ${sublocality}`;
      else if (neighborhood) display += `, ${neighborhood}`;
      else if (locality) display += `, ${locality}`;
      return display;
    } else if (route) {
      let display = route;
      if (sublocality) display += `, ${sublocality}`;
      else if (neighborhood) display += `, ${neighborhood}`;
      else if (locality) display += `, ${locality}`;
      return display;
    } else if (neighborhood) {
      return locality ? `${neighborhood}, ${locality}` : neighborhood;
    } else if (sublocality) {
      return locality ? `${sublocality}, ${locality}` : sublocality;
    } else if (locality) {
      return locality;
    }
    
    // Fallback to first parts of formatted address
    const parts = result.formatted_address.split(', ');
    return parts.slice(0, 2).join(', ') || result.formatted_address;
  };

  const selectSearchResult = (place) => {
    try {
      let location;
      
      // Handle both old and new API response formats
      if (place.geometry && place.geometry.location) {
        // Old API format
        location = {
          lat: typeof place.geometry.location.lat === 'function' 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat,
          lng: typeof place.geometry.location.lng === 'function' 
            ? place.geometry.location.lng() 
            : place.geometry.location.lng
        };
      } else if (place.location) {
        // New API format
        location = {
          lat: place.location.lat,
          lng: place.location.lng
        };
      } else {
        throw new Error('Invalid place object');
      }

      const locationData = {
        displayAddress: place.name || place.formatted_address,
        fullAddress: place.formatted_address,
        coordinates: location,
        placeId: place.place_id,
        name: place.name,
        isCoordinateOnly: false
      };

      // Update map view
      if (map.current) {
        map.current.setCenter(location);
        map.current.setZoom(15);
        updateMapMarker(location);
      }
      
      // Auto-confirm location
      onLocationSelect(locationData);
    } catch (error) {
      console.error('Error selecting search result:', error);
    }
  };

  const updateMapMarker = async (location) => {
    if (!map.current || !window.google) return;

    try {
      // Remove existing marker
      if (marker.current) {
        if (marker.current.setMap) {
          marker.current.setMap(null);
        } else if (marker.current.map) {
          marker.current.map = null;
        }
      }

      // Try to use AdvancedMarkerElement if available
      let advancedMarkerAvailable = false;
      
      try {
        // Check if the marker library is loaded and AdvancedMarkerElement is available
        if (window.google.maps.marker) {
          const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
          if (AdvancedMarkerElement) {
            advancedMarkerAvailable = true;
            
            // Create custom marker element
            const markerDiv = document.createElement('div');
            markerDiv.style.width = '20px';
            markerDiv.style.height = '20px';
            markerDiv.style.borderRadius = '50%';
            markerDiv.style.backgroundColor = type === 'pickup' ? '#10B981' : '#F59E0B';
            markerDiv.style.border = '3px solid #FFFFFF';
            markerDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

            // Create new AdvancedMarkerElement
            marker.current = new AdvancedMarkerElement({
              position: location,
              map: map.current,
              content: markerDiv,
              title: type === 'pickup' ? 'Pickup Location' : 'Drop-off Location'
            });
          }
        }
      } catch (advancedMarkerError) {
        console.log('AdvancedMarkerElement not available, using fallback marker');
        advancedMarkerAvailable = false;
      }

      // Fallback to standard Marker if AdvancedMarkerElement is not available
      if (!advancedMarkerAvailable) {
        marker.current = new window.google.maps.Marker({
          position: location,
          map: map.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: type === 'pickup' ? '#10B981' : '#F59E0B',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          },
          title: type === 'pickup' ? 'Pickup Location' : 'Drop-off Location'
        });
      }
    } catch (error) {
      console.error('Error updating marker:', error);
      
      // Ultimate fallback to basic marker with minimal styling
      try {
        marker.current = new window.google.maps.Marker({
          position: location,
          map: map.current,
          title: type === 'pickup' ? 'Pickup Location' : 'Drop-off Location'
        });
      } catch (fallbackError) {
        console.error('Even basic marker failed:', fallbackError);
      }
    }
  };

  const getModalTitle = () => {
    return type === 'pickup' ? 'Select Pickup Location' : 'Select Drop-off Location';
  };

  const getLocationIcon = () => {
    return type === 'pickup' ? '📍' : '🎯';
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-7xl max-h-[95vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl">{getLocationIcon()}</span>
              <h2 className="text-lg sm:text-xl font-serif text-white">{getModalTitle()}</h2>
            </div>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Search Panel */}
          <div className={`lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-700 flex flex-col ${
            isSearchExpanded ? 'flex-1' : ''
          }`}>
            {/* Mobile Search Toggle */}
            <div className="lg:hidden p-4 border-b border-gray-700">
              <Button
                onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                className="w-full flex items-center justify-between text-white bg-gray-800 px-4 py-3 rounded-lg"
              >
                <span>Search & Select Location</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${isSearchExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </div>

            {/* Search Content */}
            <div className={`flex-1 overflow-y-auto ${isSearchExpanded || (typeof window !== 'undefined' && window.innerWidth >= 1024) ? 'block' : 'hidden lg:block'}`}>
              <div className="p-4 sm:p-6 space-y-4">
                {/* API Key Error Warning */}
                {apiKeyError && (
                  <div className="p-3 bg-gold-900/30 border border-gold-700/50 rounded-lg">
                    <div className="text-gold-300 text-sm font-medium mb-1">
                      ⚠️ Limited Search
                    </div>
                    <div className="text-gold-200 text-xs">
                      Address search is unavailable. Click on the map to select your location.
                    </div>
                  </div>
                )}

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={apiKeyError ? "Search unavailable - use map" : "Search for places..."}
                    disabled={apiKeyError}
                    className={`w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${
                      apiKeyError ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {loading && (
                    <div className="absolute right-3 top-3">
                      <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && !apiKeyError && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                      Search Results
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {searchResults.map((place, index) => (
                        <Button
                          key={index}
                          onClick={() => selectSearchResult(place)}
                          className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
                        >
                          <div className="text-white font-medium text-sm">{place.name}</div>
                          <div className="text-gray-400 text-xs mt-1 line-clamp-2">{place.formatted_address}</div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">
                    How to Select
                  </h3>
                  <ul className="text-blue-200 text-sm space-y-1">
                    {!apiKeyError && <li>• Search for a place above, or</li>}
                    <li>• Click anywhere on the map</li>
                    <li>• Location will be selected automatically</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Map Panel */}
          <div className="lg:w-2/3 relative flex-1 min-h-0">
            <div ref={mapRef} className="w-full h-full min-h-[300px] lg:min-h-[400px] bg-gray-800" />
            
            {/* Loading State */}
            {!mapLoaded && !mapError && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <div className="text-gray-400">Loading map...</div>
                </div>
              </div>
            )}

            {/* Error State */}
            {mapError && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center p-4">
                <div className="text-center max-w-sm">
                  <div className="text-red-400 text-lg mb-2">⚠️</div>
                  <div className="text-white font-medium mb-2">Map Unavailable</div>
                  <div className="text-gray-400 text-sm mb-4">
                    {apiKeyError ? 'Maps service is currently unavailable.' : mapError}
                  </div>
                  <button
                    onClick={() => {
                      setMapError(null);
                      setMapLoaded(false);
                      setApiKeyError(false);
                      loadGoogleMapsScript();
                    }}
                    className="px-4 py-2 bg-gold-500 text-black rounded-lg hover:bg-gold-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Map Instructions Overlay */}
            {mapLoaded && !mapError && (
              <div className="absolute top-4 left-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-600 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gold-500 rounded-full animate-pulse"></div>
                  <p className="text-white text-sm font-medium">
                    Click anywhere on the map to select your {type === 'pickup' ? 'pickup' : 'drop-off'} location
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-700 flex-shrink-0">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[120px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;