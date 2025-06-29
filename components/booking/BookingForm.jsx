import React, { useState, useEffect, useRef, useCallback} from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users,
  Phone,
  Mail,
  MessageCircle,
  Car,
  Star,
  Map,
  Search,
  X,
  Loader2,
  ArrowRightLeft,
  Plus,
  Minus,
  Route,
  Settings
} from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import LocationPicker from './LocationPicker';

const BookingForm = ({ onSubmit, loading = false, preSelectedVehicle }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    pickupLocation: null,
    dropoffLocation: null,
    vehicleType: preSelectedVehicle || '',
    tripType: '',
    date: '',
    time: '',
    // Round trip specific fields
    returnDate: '',
    returnTime: '',
    passengers: '1',
    extraServices: '',
    phoneNumber: '',
    email: '',
    specialRequests: ''
  });

  const [isRoundTrip, setIsRoundTrip] = useState(false);

  // Enhanced useEffect to handle preSelectedVehicle changes
  useEffect(() => {
    if (preSelectedVehicle && preSelectedVehicle !== formData.vehicleType) {
      setFormData(prev => ({
        ...prev,
        vehicleType: preSelectedVehicle
      }));
    }
  }, [preSelectedVehicle, formData.vehicleType]);

  // Update round trip state when trip type changes
  useEffect(() => {
    const newIsRoundTrip = formData.tripType === 'round-trip';
    if (newIsRoundTrip !== isRoundTrip) {
      setIsRoundTrip(newIsRoundTrip);
      
      // Clear return trip data if switching away from round trip
      if (!newIsRoundTrip) {
        setFormData(prev => ({
          ...prev,
          returnDate: '',
          returnTime: ''
        }));
      }
    }
  }, [formData.tripType, isRoundTrip]);

  const [errors, setErrors] = useState({});
  const [locationPicker, setLocationPicker] = useState({
    isOpen: false,
    type: null
  });

  // Enhanced search states with better focus handling
  const [searchStates, setSearchStates] = useState({
    pickup: {
      isSearching: false,
      results: [],
      showResults: false,
      hasSearched: false,
      apiKeyError: false
    },
    dropoff: {
      isSearching: false,
      results: [],
      showResults: false,
      hasSearched: false,
      apiKeyError: false
    }
  });

  const searchTimeoutRef = useRef({});
  const searchInputRefs = useRef({});

  const vehicleOptions = [
    { value: 'luxury_sedan', label: 'Luxury Sedans' },
    { value: 'premium_luxury_sedan', label: 'Premium Luxury Sedans' },
    { value: 'suv', label: 'SUV' },
    { value: '7_seater', label: '7 seater' },
    { value: 'people_mover_11_seater', label: 'People mover 11 seater' },
  ];

  const tripOptions = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'airport', label: 'Airport Transfer' },
    { value: 'event', label: 'Event Transportation' }
  ];

  const serviceOptions = [
    { value: 'child-seat', label: 'Child Seat' }
  ];

  const passengerOptions = Array.from({ length: 8 }, (_, i) => ({
    value: String(i + 1),
    label: `${i + 1} Passenger${i > 0 ? 's' : ''}`
  }));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Swap pickup and dropoff locations
  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: prev.dropoffAddress,
      dropoffAddress: prev.pickupAddress,
      pickupLocation: prev.dropoffLocation,
      dropoffLocation: prev.pickupLocation
    }));

    // Clear any errors for these fields
    setErrors(prev => ({
      ...prev,
      pickupAddress: '',
      dropoffAddress: ''
    }));

    // Clear search states
    setSearchStates(prev => ({
      pickup: {
        isSearching: false,
        results: [],
        showResults: false,
        hasSearched: false,
        apiKeyError: prev.pickup.apiKeyError
      },
      dropoff: {
        isSearching: false,
        results: [],
        showResults: false,
        hasSearched: false,
        apiKeyError: prev.dropoff.apiKeyError
      }
    }));
  };

  // Enhanced location search using Google Places API
  const searchPlaces = async (query, type) => {
    // Allow search from first character
    if (!query || query.length < 1) {
      return [];
    }

    try {
      // Check if Google Maps API is available
      if (window.google && window.google.maps && window.google.maps.places) {
        return await performGooglePlacesSearch(query);
      } else {
        // Set API key error if Google Maps is not available
        setSearchStates(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            apiKeyError: true
          }
        }));
        return await performMockSearch(query);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      // Set API key error on failure
      setSearchStates(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          apiKeyError: true
        }
      }));
      return await performMockSearch(query);
    }
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

  // Enhanced mock search implementation
  const performMockSearch = async (query) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Enhanced mock suggestions with realistic data
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

  // Fixed location search with immediate response and better debouncing
  const handleLocationSearch = async (type, value) => {
    const addressField = type === "pickup" ? 'pickupAddress' : 'dropoffAddress';
    const locationField = type === "pickup" ? 'pickupLocation' : 'dropoffLocation';
    
    // Update address immediately for smooth typing
    setFormData(prev => ({
      ...prev,
      [addressField]: value,
      // Clear location if search term is empty
      [locationField]: prev[locationField]
    }));

    // Clear error immediately
    if (errors[addressField]) {
      setErrors(prev => ({
        ...prev,
        [addressField]: ''
      }));
    }

    // Clear previous timeout
    if (searchTimeoutRef.current[type]) {
      clearTimeout(searchTimeoutRef.current[type]);
    }

    // Handle empty queries
    if (value.length === 0) {
      setSearchStates(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          results: [],
          showResults: false,
          isSearching: false,
          hasSearched: false
        }
      }));
      return;
    }

    // Start searching immediately for single character
    setSearchStates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        isSearching: true,
        showResults: true,
        hasSearched: true
      }
    }));

    // Reduced debounce time for better responsiveness
  
      try {
        const results = await searchPlaces(value, type);
        setSearchStates(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            results,
            isSearching: false,
            showResults: true,
            hasSearched: false
          }
        }));
      } catch (error) {
        console.error('Search error:', error);
        setSearchStates(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            isSearching: false,
            showResults: false,
            results: [],
            hasSearched: true,
            apiKeyError: true
          }
        }));
      }
  };

  // Handle search result selection
  const handleSearchResultSelect = (type, place) => {
    const addressField = type === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    const locationField = type === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
    
    // Create location object with coordinates
    const locationObject = {
      displayAddress: place.name,
      fullAddress: place.formatted_address,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      },
      placeId: place.place_id,
      name: place.name,
      isCoordinateOnly: false,
      source: 'search',
      timestamp: Date.now()
    };

    // Update form data
    setFormData(prev => ({
      ...prev,
      [addressField]: place.name,
      [locationField]: locationObject
    }));

    // Hide search results
    setSearchStates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        showResults: false,
        results: []
      }
    }));

    // Clear error
    if (errors[addressField]) {
      setErrors(prev => ({
        ...prev,
        [addressField]: ''
      }));
    }

    // Focus next input for better UX
    setTimeout(() => {
      if (type === 'pickup' && searchInputRefs.current.dropoff) {
        searchInputRefs.current.dropoff.focus();
      }
    }, 100);
  };

  // Fixed input blur - longer timeout to prevent premature hiding
  const handleInputBlur = (type) => {
    setTimeout(() => {
      setSearchStates(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          showResults: false
        }
      }));
    }, 300); // Increased timeout for better UX
  };

  // Fixed input focus - always show results if available
  const handleInputFocus = (type) => {
    const searchState = searchStates[type];
    if (searchState.hasSearched && searchState.results.length > 0) {
      setSearchStates(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          showResults: true
        }
      }));
    }
  };

  // Clear search
  const clearSearch = (type) => {
    const addressField = type === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    const locationField = type === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
    
    setFormData(prev => ({
      ...prev,
      [addressField]: '',
      [locationField]: null
    }));

    setSearchStates(prev => ({
      ...prev,
      [type]: {
        isSearching: false,
        results: [],
        showResults: false,
        hasSearched: false,
        apiKeyError: false
      }
    }));

    // Clear any pending timeouts
    if (searchTimeoutRef.current[type]) {
      clearTimeout(searchTimeoutRef.current[type]);
    }

    if (searchInputRefs.current[type]) {
      searchInputRefs.current[type].focus();
    }
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

  // Enhanced location handling with better error handling and validation
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

  // Improved display address logic
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

  // Helper function to detect coordinate strings
  const isCoordinateString = (str) => {
    if (!str || typeof str !== 'string') return false;
    return str.includes('°') || 
           str.includes('Location:') || 
           /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(str);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required field validation
    if (!formData.pickupAddress.trim()) {
      newErrors.pickupAddress = 'Pickup address is required';
    }
    if (!formData.dropoffAddress.trim()) {
      newErrors.dropoffAddress = 'Drop-off address is required';
    }
    if (!formData.vehicleType) {
      newErrors.vehicleType = 'Please select a vehicle type';
    }
    if (!formData.tripType) {
      newErrors.tripType = 'Please select a trip type';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Validate date is not in the past
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'Date cannot be in the past';
      }
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    // Round trip validation
    if (isRoundTrip) {
      if (!formData.returnDate) {
        newErrors.returnDate = 'Return date is required';
      } else {
        const outboundDate = new Date(formData.date);
        const returnDate = new Date(formData.returnDate);
        if (returnDate < outboundDate) {
          newErrors.returnDate = 'Return date cannot be before outbound date';
        }
      }
      if (!formData.returnTime) {
        newErrors.returnTime = 'Return time is required';
      }
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Location validation
    if (formData.pickupLocation && !formData.pickupLocation.coordinates) {
      newErrors.pickupAddress = 'Invalid pickup location';
    }
    if (formData.dropoffLocation && !formData.dropoffLocation.coordinates) {
      newErrors.dropoffAddress = 'Invalid drop-off location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Prepare enhanced form data
      const enhancedFormData = {
        ...formData,
        isRoundTrip,
        // Add metadata for backend processing
        locationMetadata: {
          pickup: {
            hasExactAddress: formData.pickupLocation && !formData.pickupLocation.isCoordinateOnly,
            hasCoordinates: formData.pickupLocation && formData.pickupLocation.coordinates,
            hasPlaceId: formData.pickupLocation && formData.pickupLocation.placeId,
            coordinatesValid: formData.pickupLocation && 
              formData.pickupLocation.coordinates &&
              typeof formData.pickupLocation.coordinates.lat === 'number' &&
              typeof formData.pickupLocation.coordinates.lng === 'number',
            source: formData.pickupLocation?.source || 'unknown'
          },
          dropoff: {
            hasExactAddress: formData.dropoffLocation && !formData.dropoffLocation.isCoordinateOnly,
            hasCoordinates: formData.dropoffLocation && formData.dropoffLocation.coordinates,
            hasPlaceId: formData.dropoffLocation && formData.dropoffLocation.placeId,
            coordinatesValid: formData.dropoffLocation && 
              formData.dropoffLocation.coordinates &&
              typeof formData.dropoffLocation.coordinates.lat === 'number' &&
              typeof formData.dropoffLocation.coordinates.lng === 'number',
            source: formData.dropoffLocation?.source || 'unknown'
          }
        },
        // Add timestamp
        submittedAt: new Date().toISOString()
      };
      
      onSubmit(enhancedFormData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const RoundTripIndicator = () => {
  if (!isRoundTrip) return null;
  
  return (
    <div className="md:col-span-2 lg:col-span-3 mb-4">
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-400" />
          <span className="text-blue-300 font-medium">Round Trip Selected</span>
        </div>
        <p className="text-blue-200 text-sm mt-1">
          Please specify your return journey details below.
        </p>
      </div>
    </div>
  );
};

  // Enhanced LocationInput component with better focus handling
 const LocationInput = ({ 
    label, 
    value, 
    placeholder, 
    error, 
    required, 
    onPickerOpen,
    type
  }) => {
    const searchState = searchStates[type];
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
              ref={(el) => (searchInputRefs.current[type] = el)}
              type="text"
              value={value}
              onChange={(e) => handleLocationSearch(type, e.target.value)}
              onFocus={() => handleInputFocus(type)}
              // onBlur={() => handleInputBlur(type)}
              placeholder={searchState.apiKeyError ? "Search unavailable - use map" : placeholder}
              className={`w-full pl-10 pr-20 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors ${
                error ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            
            {/* Action Buttons */}
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
              {/* Loading Spinner */}
              {searchState.isSearching && (
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              
              {/* Clear Button */}
              {value && !searchState.isSearching && (
                <button
                  type="button"
                  onClick={() => clearSearch(type)}
                  className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              
              {/* Map Picker Button */}
              <button
                type="button"
                onClick={onPickerOpen}
                className="p-1 text-gray-400 hover:text-gold-500 rounded transition-colors"
                title="Choose on map"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchState.showResults && searchState.results.length > 0 && !searchState.apiKeyError && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchState.results.map((place, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSearchResultSelect(type, place)}
                  className="w-full text-left p-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                >
                  <div className="text-white font-medium text-sm">{place.name}</div>
                  <div className="text-gray-400 text-xs mt-1 line-clamp-2">{place.formatted_address}</div>
                </button>
              ))}
            </div>
          )}

          {/* API Key Error Message */}
          {searchState.apiKeyError && (
            <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3">
              <div className="text-yellow-400 text-sm">
                ⚠️ Location search is currently unavailable. Please use the map picker button.
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 sm:p-8 border-b border-gray-700">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gold-500/20 rounded-lg">
              <Car className="h-6 w-6 text-gold-500" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Book Your Ride</h2>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">
            Complete the form below to request your luxury transportation
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Trip Type & Round Trip Indicator */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Trip Type"
                options={tripOptions}
                value={formData.tripType}
                onChange={(e) => handleInputChange('tripType', e.target.value)}
                placeholder="Select Trip Type"
                error={errors.tripType}
                required
              />
              <Select
                label="Vehicle Type"
                options={vehicleOptions}
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                placeholder="Select Vehicle"
                icon={Car}
                error={errors.vehicleType}
                required
              />
            </div>
            
            <RoundTripIndicator />
          </div>

          {/* Location Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Route className="h-5 w-5 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Journey Details</h3>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LocationInput
                  label="Pickup Address"
                  placeholder="Search pickup location..."
                  value={formData.pickupAddress}
                  error={errors.pickupAddress}
                  required
                  onPickerOpen={() => openLocationPicker('pickup')}
                  type="pickup" 
                />

                <LocationInput
                  label="Drop-off Address"
                  placeholder="Search drop-off location..."
                  value={formData.dropoffAddress}
                  error={errors.dropoffAddress}
                  required
                  onPickerOpen={() => openLocationPicker('dropoff')}
                  type="dropoff"
                />
              </div>

              {/* Swap Locations Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 group"
                  title="Swap pickup and drop-off locations"
                >
                  <ArrowRightLeft className="h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                  <span className="text-sm font-medium">Swap Locations</span>
                </button>
              </div>
            </div>
          </div>

          {/* Date & Time Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Schedule</h3>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Outbound Journey */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">
                    {isRoundTrip ? 'Outbound Journey' : 'Journey Date & Time'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      icon={Calendar}
                      error={errors.date}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                    <Input
                      label="Time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      icon={Clock}
                      error={errors.time}
                      required
                    />
                  </div>
                </div>

                {/* Return Journey */}
                {isRoundTrip && (
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-300 border-b border-gray-700 pb-2">
                      Return Journey
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Return Date"
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        icon={Calendar}
                        error={errors.returnDate}
                        min={formData.date || new Date().toISOString().split('T')[0]}
                        required
                      />
                      <Input
                        label="Return Time"
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) => handleInputChange('returnTime', e.target.value)}
                        icon={Clock}
                        error={errors.returnTime}
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Phone className="h-5 w-5 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Contact Information</h3>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  icon={Phone}
                  error={errors.phoneNumber}
                  required
                />
                
                <div className="lg:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    icon={Mail}
                    error={errors.email}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Options Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Settings className="h-5 w-5 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-white">Additional Options</h3>
            </div>
            
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 sm:p-6 space-y-6">
              
              {/* Passengers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Select
                  label="Number of Passengers"
                  options={passengerOptions}
                  value={formData.passengers}
                  onChange={(e) => handleInputChange('passengers', e.target.value)}
                  icon={Users}
                />
              </div>

              {/* Extra Services */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Extra Services
                  <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {serviceOptions.map((service) => (
                    <label 
                      key={service.value} 
                      className="group relative flex items-center p-4 rounded-xl border border-gray-700 bg-gray-800/50 hover:bg-gray-700/50 hover:border-gold-500/50 transition-all duration-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.extraServices.includes(service.value)}
                        onChange={(e) => {
                          const currentServices = formData.extraServices.split(',').filter(s => s.trim());
                          let newServices;
                          if (e.target.checked) {
                            newServices = [...currentServices, service.value];
                          } else {
                            newServices = currentServices.filter(s => s !== service.value);
                          }
                          handleInputChange('extraServices', newServices.join(','));
                        }}
                        className="sr-only"
                      />
                      
                      {/* Custom Checkbox */}
                      <div className={`flex-shrink-0 w-5 h-5 border-2 rounded-md transition-all duration-200 mr-3 ${
                        formData.extraServices.includes(service.value)
                          ? 'border-gold-500 bg-gold-500'
                          : 'border-gray-600 group-hover:border-gold-500/70'
                      }`}>
                        {formData.extraServices.includes(service.value) && (
                          <svg className="w-3 h-3 text-black m-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Service Label */}
                      <span className={`text-sm font-medium transition-colors duration-200 ${
                        formData.extraServices.includes(service.value)
                          ? 'text-gold-300'
                          : 'text-gray-300 group-hover:text-white'
                      }`}>
                        {service.label}
                      </span>
                      
                      {/* Selected Indicator */}
                      {formData.extraServices.includes(service.value) && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-gold-500 rounded-full"></div>
                      )}
                    </label>
                  ))}
                </div>
                
                {/* Selected Services Summary */}
                {formData.extraServices && formData.extraServices.length > 0 && (
                  <div className="mt-4 p-4 bg-gold-500/10 border border-gold-500/30 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <Star className="h-5 w-5 text-gold-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gold-300">Selected Services:</p>
                        <p className="text-sm text-gold-200 mt-1">
                          {formData.extraServices
                            .split(',')
                            .filter(s => s.trim())
                            .map(serviceValue => 
                              serviceOptions.find(opt => opt.value === serviceValue)?.label
                            )
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Special Requests
                  <span className="text-gray-500 font-normal ml-2">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-start pt-4 pointer-events-none">
                    <MessageCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    placeholder="Any special requirements, dietary needs, accessibility requests, or other preferences..."
                    value={formData.specialRequests}
                    onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                    rows={4}
                    className="w-full pl-12 pr-4 py-4 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleSubmit}
                size="xl"
                disabled={loading}
                className="w-full sm:w-auto min-w-[320px] bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Your Request...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Car className="h-5 w-5" />
                    <span>Calculate Price & Continue</span>
                  </div>
                )}
              </Button>
              
              <p className="text-xs text-gray-500 text-center sm:text-left max-w-xs">
                You'll receive a detailed quote before confirming your booking
              </p>
            </div>
          </div>
        </div>
      </div>

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

export default BookingForm;