import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Calculator, Clock, DollarSign, Search, X } from 'lucide-react';
import { calculateDistanceAndDuration } from '../../lib/utils';
import LocationPicker from './LocationPicker';

const InstantQuote = ({ selectedCar }) => {
   const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    pickupLocation: null,
    dropoffLocation: null,
  });
   const [locationPicker, setLocationPicker] = useState({
    isOpen: false,
    type: null
  });
   const [errors, setErrors] = useState({});
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [quote, setQuote] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Search states for both inputs
  const [pickupSearchState, setPickupSearchState] = useState({
    isSearching: false,
    results: [],
    showResults: false,
    hasSearched: false,
    apiKeyError: false
  });

  const [dropoffSearchState, setDropoffSearchState] = useState({
    isSearching: false,
    results: [],
    showResults: false,
    hasSearched: false,
    apiKeyError: false
  });

  const searchTimeoutRef = useRef({});
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const pickupDropdownRef = useRef(null);
  const dropoffDropdownRef = useRef(null);

  // Base pricing structure
  const basePricing = {
    baseRate: 20,
    perKm: 4.0,
    taxRate: 0.15
  };

  // Google Places API search
  const performGooglePlacesSearch = async (query) => {
    try {
      const { Place } = await google.maps.importLibrary("places");
      
      const request = {
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
        maxResultCount: 5,
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        return places.map(place => ({
          name: place.displayName || 'Unnamed Location',
          formatted_address: place.formattedAddress || 'Address not available',
          place_id: place.id,
          geometry: {
            location: {
              lat: () => place.location.lat,
              lng: () => place.location.lng
            }
          }
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Google Places search error:', error);
      throw error;
    }
  };

  // Mock search implementation
  const performMockSearch = async (query) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockResults = [
      {
        name: `${query} Grand Hotel`,
        formatted_address: `${query} Grand Hotel, Downtown District, City 12345`,
        place_id: `mock_place_${query}_hotel_1`,
        geometry: {
          location: {
            lat: () => 40.7128 + Math.random() * 0.01,
            lng: () => -74.0060 + Math.random() * 0.01
          }
        }
      },
      {
        name: `${query} Street`,
        formatted_address: `${query} Street, City Center, Metropolitan Area 12345`,
        place_id: `mock_place_${query}_street_1`,
        geometry: {
          location: {
            lat: () => 40.7580 + Math.random() * 0.01,
            lng: () => -73.9855 + Math.random() * 0.01
          }
        }
      },
      {
        name: `${query} International Airport`,
        formatted_address: `${query} International Airport, Airport District 12346`,
        place_id: `mock_place_${query}_airport_1`,
        geometry: {
          location: {
            lat: () => 40.7489 + Math.random() * 0.01,
            lng: () => -73.9857 + Math.random() * 0.01
          }
        }
      }
    ];
    
    return mockResults;
  };

  // Enhanced location search using Google Places API
  const searchPlaces = async (query, type) => {
    if (!query || query.length < 1) {
      return [];
    }

    try {
      if (window.google && window.google.maps && window.google.maps.places) {
        return await performGooglePlacesSearch(query);
      } else {
        const stateSetter = type === 'pickup' ? setPickupSearchState : setDropoffSearchState;
        stateSetter(prev => ({
          ...prev,
          apiKeyError: true
        }));
        return await performMockSearch(query);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      const stateSetter = type === 'pickup' ? setPickupSearchState : setDropoffSearchState;
      stateSetter(prev => ({
        ...prev,
        apiKeyError: true
      }));
      return await performMockSearch(query);
    }
  };

  // Fixed debounced search function
  const debouncedSearch = useCallback((type, value) => {
    // Clear previous timeout
    if (searchTimeoutRef.current[type]) {
      clearTimeout(searchTimeoutRef.current[type]);
    }

    const stateSetter = type === 'pickup' ? setPickupSearchState : setDropoffSearchState;

    // Handle empty queries
    if (value.length === 0) {
      stateSetter(prev => ({
        ...prev,
        results: [],
        showResults: false,
        isSearching: false,
        hasSearched: false
      }));
      return;
    }

    // Start searching for single character
    stateSetter(prev => ({
      ...prev,
      isSearching: true,
      showResults: true,
      hasSearched: true
    }));

    // Debounced search
    searchTimeoutRef.current[type] = setTimeout(async () => {
      try {
        const results = await searchPlaces(value, type);
        stateSetter(prev => ({
          ...prev,
          results,
          isSearching: false,
          showResults: true,
          hasSearched: true
        }));
      } catch (error) {
        console.error('Search error:', error);
        stateSetter(prev => ({
          ...prev,
          isSearching: false,
          showResults: false,
          results: [],
          hasSearched: true,
          apiKeyError: true
        }));
      }
    }, 300);
  }, []);

  // Handle location search with proper debouncing
  const handleLocationSearch = useCallback((type, value) => {
    // Update input value immediately for smooth typing
    if (type === 'pickup') {
      setPickupLocation(value);
    } else {
      setDropoffLocation(value);
    }

    // Use debounced search
    debouncedSearch(type, value);
  }, [debouncedSearch]);

  // Handle input focus
  const handleInputFocus = useCallback((type) => {
    const searchState = type === 'pickup' ? pickupSearchState : dropoffSearchState;
    const stateSetter = type === 'pickup' ? setPickupSearchState : setDropoffSearchState;
    
    if (searchState.hasSearched && searchState.results.length > 0) {
      stateSetter(prev => ({
        ...prev,
        showResults: true
      }));
    }
  }, [pickupSearchState, dropoffSearchState]);

  // Handle input blur with delay to allow clicking on results
  const handleInputBlur = useCallback((type) => {
    const stateSetter = type === 'pickup' ? setPickupSearchState : setDropoffSearchState;
    setTimeout(() => {
      stateSetter(prev => ({
        ...prev,
        showResults: false
      }));
    }, 150);
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = useCallback((place, type) => {
    try {
      let location;
      if (place.geometry && place.geometry.location) {
        location = {
          lat: typeof place.geometry.location.lat === 'function' 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat,
          lng: typeof place.geometry.location.lng === 'function' 
            ? place.geometry.location.lng() 
            : place.geometry.location.lng
        };
      } else if (place.location) {
        location = {
          lat: place.location.lat,
          lng: place.location.lng
        };
      } else {
        throw new Error('Invalid place object');
      }

      const displayAddress = place.name || place.formatted_address;
      
      if (type === 'pickup') {
        setPickupLocation(displayAddress);
        setPickupSearchState(prev => ({
          ...prev,
          showResults: false
        }));
      } else {
        setDropoffLocation(displayAddress);
        setDropoffSearchState(prev => ({
          ...prev,
          showResults: false
        }));
      }
    } catch (error) {
      console.error('Error selecting search result:', error);
    }
  }, []);

  const isCoordinateString = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.includes('°') || 
           str.includes('Location:') || 
           /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(str);
  };

     const getDisplayAddress = (locationData) => {
    try {
      // Check for proper address first
      if (locationData.displayAddress && 
          !locationData.isCoordinateOnly && 
          locationData.displayAddress.length > 3 &&
          !isCoordinateString(locationData.displayAddress)) {
        return locationData.displayAddress;
      }

      // Check for business/place name
      if (locationData.name && 
          !locationData.isCoordinateOnly &&
          locationData.name.length > 3 &&
          !isCoordinateString(locationData.name)) {
        return locationData.name;
      }

      // Check formatted address
      if (locationData.fullAddress && 
          !locationData.isCoordinateOnly &&
          !isCoordinateString(locationData.fullAddress)) {
        // Extract meaningful part of address
        const parts = locationData.fullAddress.split(', ');
        if (parts.length >= 2) {
          return parts.slice(0, 2).join(', ');
        }
        return locationData.fullAddress;
      }

      // Fallback to coordinates with proper formatting
      if (locationData.coordinates) {
        const lat = Number(locationData.coordinates.lat).toFixed(4);
        const lng = Number(locationData.coordinates.lng).toFixed(4);
        return `📍 ${lat}°, ${lng}°`;
      }

      return 'Selected Location';
    } catch (error) {
      console.error('Error generating display address:', error);
      return 'Selected Location';
    }
  };

  // Clear search
  const clearSearch = useCallback((type) => {
    if (type === 'pickup') {
      setPickupLocation('');
      setPickupSearchState({
        isSearching: false,
        results: [],
        showResults: false,
        hasSearched: false,
        apiKeyError: false
      });
    } else {
      setDropoffLocation('');
      setDropoffSearchState({
        isSearching: false,
        results: [],
        showResults: false,
        hasSearched: false,
        apiKeyError: false
      });
    }

    if (searchTimeoutRef.current[type]) {
      clearTimeout(searchTimeoutRef.current[type]);
    }
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickupRef.current && !pickupRef.current.contains(event.target) &&
          pickupDropdownRef.current && !pickupDropdownRef.current.contains(event.target)) {
        setPickupSearchState(prev => ({ ...prev, showResults: false }));
      }
      if (dropoffRef.current && !dropoffRef.current.contains(event.target) &&
          dropoffDropdownRef.current && !dropoffDropdownRef.current.contains(event.target)) {
        setDropoffSearchState(prev => ({ ...prev, showResults: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(searchTimeoutRef.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const calculateDistance = async (pickupLocation, dropoffLocation) => {
  if (!pickupLocation || !dropoffLocation) {
    console.warn('Missing location data for distance calculation');
    return { distance: 0, duration: 0, status: 'missing_data' };
  }

  try {
    // Use the proper utility function from utils.js
    const result = await calculateDistanceAndDuration(pickupLocation.fullAddress, dropoffLocation.fullAddress);
    return {
      distance: result.distance,
      duration: result.duration,
      distanceText: result.distanceText,
      durationText: result.durationText,
      status: result.status
    };
  } catch (error) {
    console.error('Distance calculation failed:', error);
    return { 
      distance: 0, 
      duration: 0, 
      status: 'error',
      error: error.message 
    };
  }
};

const handleCalculateQuote = async () => {
  // Validate basic inputs
  if (!formData.pickupAddress.trim() || !formData.dropoffAddress.trim()) {
    alert('Please enter both pickup and dropoff locations');
    return;
  }

  // Validate that we have location objects with coordinates
  if (!formData.pickupLocation || !formData.dropoffLocation) {
    alert('Please select valid locations from the search results or map picker');
    return;
  }

  setIsCalculating(true);
  
  try {
    // Add loading delay for UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate actual distance using the utility function
    const routeData = await calculateDistance(formData.pickupLocation, formData.dropoffLocation);
    
    if (routeData.distance === 0) {
      throw new Error('Unable to calculate distance between locations');
    }

    // Use the existing basePricing structure for consistency
    const distance = routeData.distance;
    const duration = routeData.duration;
    
    const baseCost = basePricing.baseRate;
    const distanceCost = distance * basePricing.perKm;
    const subtotal = baseCost + distanceCost;
    const tax = subtotal * basePricing.taxRate;
    const total = subtotal + tax;

    setQuote({
      distance: distance.toFixed(1),
      duration: Math.ceil(duration),
      baseCost,
      distanceCost: distanceCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      estimatedTime: Math.ceil(duration),
      distanceText: routeData.distanceText || `${distance.toFixed(1)} km`,
      durationText: routeData.durationText || `${Math.ceil(duration)} min`,
      calculationMethod: routeData.status,
      // Add route data for debugging
      routeData: routeData
    });

  } catch (error) {
    console.error('Quote calculation error:', error);
    
    // Show user-friendly error message
    alert(`Unable to calculate quote: ${error.message}. Please check your locations and try again.`);
    
    // Optionally show fallback quote with warning
    const estimatedDistance = 25; // Default fallback distance
    const estimatedDuration = 35; // Default fallback duration
    
    const baseCost = basePricing.baseRate;
    const distanceCost = estimatedDistance * basePricing.perKm;
    const subtotal = baseCost + distanceCost;
    const tax = subtotal * basePricing.taxRate;
    const total = subtotal + tax;

    setQuote({
      distance: estimatedDistance.toFixed(1),
      duration: estimatedDuration,
      baseCost,
      distanceCost: distanceCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      estimatedTime: estimatedDuration,
      distanceText: `${estimatedDistance} km (estimated)`,
      durationText: `${estimatedDuration} min (estimated)`,
      calculationMethod: 'fallback_estimate',
      isEstimate: true,
      warning: 'This is an estimated quote. Actual distance calculation failed.'
    });
  } finally {
    setIsCalculating(false);
  }
};

   const handleTextLocationSelect = (locationData, type) => {
  if (!locationData || !type) {
      console.error('Invalid location data or type');
      return;
    }
    
    try {
      // Validate coordinates
      const hasValidCoordinates = locationData.coordinates && 
        typeof locationData.coordinates.lat === 'number' && 
        typeof locationData.coordinates.lng === 'number' &&
        !isNaN(locationData.coordinates.lat) && 
        !isNaN(locationData.coordinates.lng) &&
        Math.abs(locationData.coordinates.lat) <= 90 &&
        Math.abs(locationData.coordinates.lng) <= 180;

      if (!hasValidCoordinates) {
        console.error('Invalid coordinates received:', locationData.coordinates);
        return;
      }

      // Create clean display address
      const displayAddress = getDisplayAddress(locationData);
      
      // Create standardized location object
      const locationObject = {
        displayAddress,
        fullAddress: locationData.fullAddress || displayAddress,
        coordinates: {
          lat: Number(locationData.coordinates.lat),
          lng: Number(locationData.coordinates.lng)
        },
        placeId: locationData.placeId || null,
        name: locationData.name || null,
        isCoordinateOnly: Boolean(locationData.isCoordinateOnly),
        addressComponents: locationData.addressComponents || null,
        source: 'map_picker',
        timestamp: Date.now()
      };

      // Update form data based on type
      if (type === 'pickup') {
        setFormData(prev => ({
          ...prev,
          pickupAddress: displayAddress,
          pickupLocation: locationObject
        }));
        
        // Clear pickup error
        if (errors.pickupAddress) {
          setErrors(prev => ({
            ...prev,
            pickupAddress: ''
          }));
        }
      } else if (type === 'dropoff') {
        setFormData(prev => ({
          ...prev,
          dropoffAddress: displayAddress,
          dropoffLocation: locationObject
        }));
        
        // Clear dropoff error
        if (errors.dropoffAddress) {
          setErrors(prev => ({
            ...prev,
            dropoffAddress: ''
          }));
        }
      }

      closeLocationPicker();
    } catch (error) {
      console.error('Error processing location selection:', error);
    }
  }

  const handleNewQuote = () => {
    setQuote(null);
    setPickupLocation('');
    setDropoffLocation('');
    setPickupSearchState({
      isSearching: false,
      results: [],
      showResults: false,
      hasSearched: false,
      apiKeyError: false
    });
    setDropoffSearchState({
      isSearching: false,
      results: [],
      showResults: false,
      hasSearched: false,
      apiKeyError: false
    });
    setFormData({
      pickupAddress: '',
      dropoffAddress: '',
      pickupLocation: null,
      dropoffLocation: null
    });
  };

  // LocationInput component with Google Places integration
 const LocationInput = ({ 
  label, 
  value, 
  placeholder, 
  error, 
  required, 
  onPickerOpen,
  type,
  onChange, // Make sure you pass this prop
  onLocationSelect // Add this prop for when a location is selected
}) => {
  // Local state for search functionality
  const [localValue, setLocalValue] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  
  // Refs
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Sync local value with prop value
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value || '');
    }
  }, [value]);

  // Debounced search function
  const searchLocations = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      // Check if Google Maps is available
      if (!window.google || !window.google.maps) {
        throw new Error('Google Maps not loaded');
      }

      const { Place } = await google.maps.importLibrary("places");
      
      const request = {
        textQuery: query,
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
        maxResultCount: 5
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        const formattedResults = places.map(place => ({
          name: place.displayName,
          formatted_address: place.formattedAddress,
          geometry: {
            location: place.location
          },
          place_id: place.id
        }));
        
        setSearchResults(formattedResults);
        setShowResults(true);
        setApiKeyError(false);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setApiKeyError(true);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Call parent onChange immediately for form state
    if (onChange) {
      onChange(newValue);
    }
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for search
    if (newValue.length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchLocations(newValue);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [onChange, searchLocations]);

  // Handle input focus
  const handleInputFocus = useCallback(() => {
    if (searchResults.length > 0 && localValue.length > 2) {
      setShowResults(true);
    }
  }, [searchResults.length, localValue.length]);

  // Handle input blur with delay to allow clicking on results
  const handleInputBlur = useCallback((e) => {
    // Use setTimeout to allow dropdown clicks to register
    setTimeout(() => {
      // Check if the new focused element is within our dropdown
      if (dropdownRef.current && dropdownRef.current.contains(document.activeElement)) {
        return; // Don't hide if focus is within dropdown
      }
      setShowResults(false);
    }, 150);
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = (place) => {
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

       onLocationSelect(locationData);
    } catch (error) {
      console.error('Error selecting search result:', error);
    }
    // Keep focus on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

 

  // Clear search
  const clearSearch = useCallback(() => {
    setLocalValue('');
    setSearchResults([]);
    setShowResults(false);
    
    if (onChange) {
      onChange('');
    }
    
    // Keep focus on input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="relative">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={apiKeyError ? "Search unavailable - use map" : placeholder}
            autoComplete="off"
            className={`w-full pl-10 pr-20 py-3 bg-white border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-colors ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          
          {/* Action Buttons */}
          <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
            {/* Loading Spinner */}
            {isSearching && (
              <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            
            {/* Clear Button */}
            {localValue && !isSearching && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                tabIndex={-1} // Prevent focus stealing
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Map Picker Button */}
            <button
              type="button"
              onClick={onPickerOpen}
              className="p-1 text-gray-400 hover:text-gold-600 rounded transition-colors"
              title="Choose on map"
              tabIndex={-1} // Prevent focus stealing
            >
              <MapPin className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && !apiKeyError && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {searchResults.map((place, index) => (
              <button
                key={`${place.place_id}-${index}`}
                type="button"
                onClick={() => handleSearchResultSelect(place)}
                onMouseDown={(e) => e.preventDefault()} // Prevent input blur
                className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0"
              >
                <div className="text-gray-900 font-medium text-sm">{place.name}</div>
                <div className="text-gray-500 text-xs mt-1 line-clamp-2">{place.formatted_address}</div>
              </button>
            ))}
          </div>
        )}

        {/* API Key Error Message */}
        {showResults && apiKeyError && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
          >
            <div className="text-yellow-600 text-sm">
              ⚠️ Location search is currently unavailable. Please use the map picker button.
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
};

  


 const openLocationPicker = (type) => {
    setLocationPicker({
      isOpen: true,
      type: type
    });
  };

  const closeLocationPicker = () => {
    setLocationPicker({
      isOpen: false,
      type: null
    });
  };

  const handleLocationSelect = (locationData) => {
    const { type } = locationPicker;
    if (!locationData || !type) {
      console.error('Invalid location data or type');
      return;
    }
    
    try {
      // Validate coordinates
      const hasValidCoordinates = locationData.coordinates && 
        typeof locationData.coordinates.lat === 'number' && 
        typeof locationData.coordinates.lng === 'number' &&
        !isNaN(locationData.coordinates.lat) && 
        !isNaN(locationData.coordinates.lng) &&
        Math.abs(locationData.coordinates.lat) <= 90 &&
        Math.abs(locationData.coordinates.lng) <= 180;

      if (!hasValidCoordinates) {
        console.error('Invalid coordinates received:', locationData.coordinates);
        return;
      }

      // Create clean display address
      const displayAddress = getDisplayAddress(locationData);
      
      // Create standardized location object
      const locationObject = {
        displayAddress,
        fullAddress: locationData.fullAddress || displayAddress,
        coordinates: {
          lat: Number(locationData.coordinates.lat),
          lng: Number(locationData.coordinates.lng)
        },
        placeId: locationData.placeId || null,
        name: locationData.name || null,
        isCoordinateOnly: Boolean(locationData.isCoordinateOnly),
        addressComponents: locationData.addressComponents || null,
        source: 'map_picker',
        timestamp: Date.now()
      };

      // Update form data based on type
      if (type === 'pickup') {
        setFormData(prev => ({
          ...prev,
          pickupAddress: displayAddress,
          pickupLocation: locationObject
        }));
        
        // Clear pickup error
        if (errors.pickupAddress) {
          setErrors(prev => ({
            ...prev,
            pickupAddress: ''
          }));
        }
      } else if (type === 'dropoff') {
        setFormData(prev => ({
          ...prev,
          dropoffAddress: displayAddress,
          dropoffLocation: locationObject
        }));
        
        // Clear dropoff error
        if (errors.dropoffAddress) {
          setErrors(prev => ({
            ...prev,
            dropoffAddress: ''
          }));
        }
      }

      closeLocationPicker();
    } catch (error) {
      console.error('Error processing location selection:', error);
    }
  };

  return (
    <div  id='instantQuote' className="min-h-screen bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots-pattern opacity-30"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-gold-300 to-gold-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-gold-200 to-gold-500 rounded-full blur-3xl"></div>
      </div>
      
      <section className="relative py-12 sm:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/20 rounded-full mb-6">
                <Calculator className="w-8 h-8 text-gold-700" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif text-gray-900 mb-4 sm:mb-6 leading-tight tracking-tight">
                INSTANT <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-800">QUOTE</span>
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-gold-500 to-gold-700 mx-auto mb-6"></div>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed font-light">
                Get an instant price estimate for your luxury transportation. Simply enter your pickup and destination locations to experience the elegance of Velaré.
              </p>
            </div>

            {/* Quote Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gold-100 shadow-xl p-6 sm:p-8 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <LocationInput
                  label="Pickup Address"
                  placeholder="Search pickup location..."
                  value={formData.pickupAddress}
                  error={errors.pickupAddress}
                  onLocationSelect={(locationData) => handleTextLocationSelect(locationData, 'pickup')}
                  required
                  onPickerOpen={() => openLocationPicker('pickup')}
                  type="pickup"
                />

                <LocationInput
                  label="Drop-off Address"
                  placeholder="Search drop-off location..."
                  value={formData.dropoffAddress}
                  error={errors.dropoffAddress}
                  onLocationSelect={(locationData) => handleTextLocationSelect(locationData, 'dropoff')}
                  required
                  onPickerOpen={() => openLocationPicker('dropoff')}
                  type="dropoff"
                  />
              </div>

              {/* Calculate Button */}
              <div className="text-center">
                <button
                  onClick={handleCalculateQuote}
                  disabled={isCalculating}
                  className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 disabled:from-gray-400 disabled:to-gray-500 text-white disabled:text-gray-300 font-semibold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isCalculating ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating Quote...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Calculator className="w-5 h-5 mr-2" />
                      Get Instant Quote
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Quote Results */}
            {quote && (
              <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm rounded-3xl border border-gold-200 shadow-2xl p-6 sm:p-8 animate-slide-in">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-gold-100 to-gold-200 rounded-full mb-4 shadow-lg">
                    <DollarSign className="w-6 h-6 text-gold-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-4">
                    Your Quote is Ready
                  </h3>
                  <div className="bg-gray-50/50 rounded-xl p-4 max-w-md mx-auto border border-gold-100">
                    <p className="text-gray-600 text-sm">
                      <span className="text-green-600 font-medium">From:</span> {formData.pickupLocation?.fullAddress || formData.pickupAddress}
                    </p>
                    <div className="flex justify-center my-2">
                      <div className="w-8 h-px bg-gradient-to-r from-transparent via-gold-500 to-transparent"></div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      <span className="text-red-500 font-medium">To:</span> {formData.dropoffLocation?.fullAddress || formData.dropoffAddress}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Trip Details */}
                  <div className="bg-white/60 rounded-2xl p-6 border border-gold-100 shadow-lg">
                    <div className="flex items-center mb-4">
                      <Clock className="w-5 h-5 text-gold-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">Trip Details</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-semibold text-gray-900">{quote.distance} km</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Estimated Time:</span>
                        <span className="font-semibold text-gray-900">{quote.estimatedTime} minutes</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Service Type:</span>
                        <span className="font-semibold text-gold-600">Premium Luxury</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-white/60 rounded-2xl p-6 border border-gold-100 shadow-lg">
                    <div className="flex items-center mb-4">
                      <DollarSign className="w-5 h-5 text-gold-600 mr-2" />
                      <h4 className="text-lg font-semibold text-gray-900">Price Breakdown</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Base Rate:</span>
                        <span className="text-gray-900">${quote.baseCost}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Distance ({quote.distance} km):</span>
                        <span className="text-gray-900">${quote.distanceCost}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Tax (15%):</span>
                        <span className="text-gray-900">${quote.tax}</span>
                      </div>
                      <div className="border-t border-gold-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold text-gray-900">Total:</span>
                          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-600 to-gold-800">${quote.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={() => {
                      const bookNowElement = document.getElementById('bookNow');
                      if (bookNowElement) {
                        bookNowElement.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }
                    }}
                    className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Book This Trip - ${quote.total}
                  </button>
                  <button
                    onClick={handleNewQuote}
                    className="border-2 border-gray-300 hover:border-gold-400 text-gray-600 hover:text-gold-600 font-semibold px-8 py-3 rounded-full transition-all duration-300 bg-white hover:bg-gold-50"
                  >
                    New Quote
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-sm">
                    *Prices are estimates. Final cost may vary based on traffic, waiting time, and additional services.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Info */}
            <div className="text-center mt-8 sm:mt-12">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gold-100 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Need Assistance?</h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Questions about pricing or services? Contact our dedicated support team at{' '}
                  <a href="tel:1300 650 677" className="text-gold-600 hover:text-gold-700 transition-colors font-medium">
                    1300 650 677
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-in {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-slide-in {
          animation: slide-in 0.6s ease-out;
        }
        
        .bg-dots-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.05) 1px, transparent 0);
          background-size: 20px 20px;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
       {/* Location Picker Modal */}
      {locationPicker.isOpen && (
        <LocationPicker
          type={locationPicker.type}
          currentLocation={
            locationPicker.type === 'pickup' 
              ? formData.pickupLocation?.displayAddress || ''
              : formData.dropoffLocation?.displayAddress || ''
          }
          onLocationSelect={handleLocationSelect}
          onClose={closeLocationPicker}
        />
      )}
    </div>
  );
};

export default InstantQuote;