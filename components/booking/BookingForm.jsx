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
  Minus
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
      console.log('Setting preSelectedVehicle:', preSelectedVehicle);
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
    { value: 'suv', label: 'SUV' },
    { value: 'premium_luxury_sedan', label: 'Premium Luxury Sedans' },
    { value: 'people_mover_11_seater', label: 'People mover 11 seater' },
    { value: '7_seater', label: '7 seater' }
  ];

  const tripOptions = [
    { value: 'one-way', label: 'One Way' },
    { value: 'round-trip', label: 'Round Trip' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'airport', label: 'Airport Transfer' },
    { value: 'event', label: 'Event Transportation' }
  ];

  const serviceOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'refreshments', label: 'Refreshments' },
    { value: 'newspapers', label: 'Newspapers' },
    { value: 'child-seat', label: 'Child Seat' },
    { value: 'champagne', label: 'Champagne Service' }
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
    const addressField = type === 'pickup' ? 'pickupAddress' : 'dropoffAddress';
    const locationField = type === 'pickup' ? 'pickupLocation' : 'dropoffLocation';
    
    // Update address immediately for smooth typing
    setFormData(prev => ({
      ...prev,
      [addressField]: value,
      // Clear location if search term is empty
      [locationField]: value.length === 0 ? null : prev[locationField]
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
    searchTimeoutRef.current[type] = setTimeout(async () => {
      try {
        const results = await searchPlaces(value, type);
        setSearchStates(prev => ({
          ...prev,
          [type]: {
            ...prev[type],
            results,
            isSearching: false,
            showResults: true,
            hasSearched: true
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
    }, 150); // Reduced from 400 to 150ms for better responsiveness
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
  locationData,
  type,
  onLocationSearch, // Function to handle the actual search API call
  onLocationSelect, // Function to handle location selection
  onClearLocation  // Function to clear the location
}) => {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await onLocationSearch(query);
      setSearchResults(results || []);
      setShowResults(true);
      setApiKeyError(false);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setApiKeyError(true);
    } finally {
      setIsSearching(false);
    }
  }, [onLocationSearch]);

  // Handle input change with immediate UI update and debounced search
  const handleInputChange = useCallback((e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If input is empty, clear results immediately
    if (!newValue.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }
    
    // Debounce search for 300ms
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(newValue);
    }, 300);
  }, [performSearch]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    if (searchResults.length > 0) {
      setShowResults(true);
    }
  }, [searchResults.length]);

  // Handle input blur with delay to allow for result clicks
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  }, []);

  // Handle result selection
  const handleResultSelect = useCallback((place) => {
    setSearchTerm(place.name || place.formatted_address);
    setSearchResults([]);
    setShowResults(false);
    onLocationSelect(type, place);
  }, [type, onLocationSelect]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    onClearLocation(type);
    inputRef.current?.focus();
  }, [type, onClearLocation]);

  // Handle escape key to close results
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowResults(false);
      inputRef.current?.blur();
    }
  }, []);

  // Update search term when value prop changes
  useEffect(() => {
    if (value !== searchTerm) {
      setSearchTerm(value || '');
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-medium text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      {/* API Key Error Warning */}
      {apiKeyError && (
        <div className="p-2 bg-gold-900/30 border border-gold-700/50 rounded-lg mb-2">
          <div className="text-gold-300 text-xs font-medium mb-1">
            ⚠️ Limited Search
          </div>
          <div className="text-gold-200 text-xs">
            Address search is unavailable. Click the map icon to select your location.
          </div>
        </div>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={apiKeyError ? "Search unavailable - use map" : placeholder}
          disabled={apiKeyError}
          className={`w-full pl-10 pr-24 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors ${
            error ? 'border-red-500' : 'border-gray-700'
          } ${apiKeyError ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1">
          {isSearching && (
            <div className="pr-1">
              <Loader2 className="h-4 w-4 animate-spin text-gold-500" />
            </div>
          )}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:text-red-400 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-red-400" />
            </button>
          )}
          <button
            type="button"
            onClick={onPickerOpen}
            className="pr-3 flex items-center hover:text-gold-500 transition-colors"
            title="Open map picker"
          >
            <Map className="h-5 w-5 text-gray-400 hover:text-gold-500" />
          </button>
        </div>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && !apiKeyError && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-64 overflow-y-auto"
        >
          <div className="p-3 border-b border-gray-700">
            <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              Search Results
            </div>
          </div>
          <div className="space-y-0">
            {searchResults.map((place, index) => (
              <button
                key={`${place.place_id || index}`}
                type="button"
                className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors focus:bg-gray-700 focus:outline-none"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleResultSelect(place)}
              >
                <div className="text-white font-medium text-sm">
                  {place.name}
                </div>
                <div className="text-gray-400 text-xs mt-1 line-clamp-2">
                  {place.formatted_address}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results message */}
      {showResults && searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && !apiKeyError && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl p-4">
          <div className="text-center text-gray-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No locations found</div>
            <div className="text-xs mt-1">Try a different search term or use the map picker</div>
          </div>
        </div>
      )}
      
      {/* Location info display */}
      {locationData && locationData.coordinates && (
        <div className="flex items-center justify-between text-xs bg-gray-800/50 rounded p-2 border border-gray-700">
          <div className="flex items-center space-x-2 text-gray-500">
            <span>{locationData.isCoordinateOnly ? '📍' : '🏢'}</span>
            <span>
              {locationData.isCoordinateOnly 
                ? 'Exact coordinates' 
                : locationData.name || 'Address selected'
              }
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-gray-400">
              {Number(locationData.coordinates.lat).toFixed(3)}, {Number(locationData.coordinates.lng).toFixed(3)}
            </span>
          </div>
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      
      {!searchTerm && !apiKeyError && (
        <p className="text-xs text-gray-500 flex items-center">
          <Search className="h-3 w-3 mr-1" />
          Type to search or click map icon to select
        </p>
      )}
    </div>
  );
};

  return (
    <div className="space-y-8">
      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Location Inputs */}
        <LocationInput
  label="Pickup Address"
  placeholder="Search destination..."
          value={formData.pickupAddress}
          error={errors.pickupAddress}
          required
          onPickerOpen={() => openLocationPicker('pickup')}
  type="pickup" 
  locationData={formData.pickupAddress}
  onLocationSearch={async (query) => {
    setSelectedLocation(query);
    // Your search API call here
    const response = await searchPlacesAPI(query);
    return response.results;
  }}
  onLocationSelect={(type, place) => {
    // Handle location selection
    setSelectedLocation(type, place);
  }}
  onClearLocation={(type) => {
    setSelectedLocation(type);
  }}
/>

        <LocationInput
          label="Drop-off Address"
          placeholder="Search destination..."
          value={formData.dropoffAddress}
          error={errors.dropoffAddress}
          required
          onPickerOpen={() => openLocationPicker('dropoff')}
          locationData={formData.dropoffLocation}
          type="dropoff"
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

        {/* Trip Details */}
        <Select
          label="Trip Type"
          options={tripOptions}
          value={formData.tripType}
          onChange={(e) => handleInputChange('tripType', e.target.value)}
          placeholder="Select Trip Type"
          error={errors.tripType}
          required
        />

        <RoundTripIndicator />

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

        {isRoundTrip && (
  <>
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
  </>
)}

        {/* Additional Options */}
        <Select
          label="Passengers"
          options={passengerOptions}
          value={formData.passengers}
          onChange={(e) => handleInputChange('passengers', e.target.value)}
          icon={Users}
        />

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

        {/* Contact Info */}
        <div className="md:col-span-2 lg:col-span-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            icon={Mail}
            error={errors.email}
            required
          />
        </div>

        {/* Extra Services */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Extra Services
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {serviceOptions.map((service) => (
                <label key={service.value} className="flex items-center space-x-2 cursor-pointer">
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
                    className="rounded border-gray-600 text-gold-500 focus:ring-gold-500 focus:ring-offset-gray-900"
                  />
                  <span className="text-sm text-gray-300">{service.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div className="md:col-span-2 lg:col-span-3">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Special Requests
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
                <MessageCircle className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                placeholder="Any special requirements or requests..."
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          size="xl"
          disabled={loading}
          className="w-full sm:w-auto min-w-[280px] bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-semibold py-4 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            'Calculate Price & Continue'
          )}
        </Button>
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