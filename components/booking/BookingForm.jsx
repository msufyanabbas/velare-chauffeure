import React, { useState, useEffect } from 'react';
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
  Map
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
    passengers: '1',
    extraServices: '',
    phoneNumber: '',
    email: '',
    specialRequests: ''
  });

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

  const [errors, setErrors] = useState({});
  const [locationPicker, setLocationPicker] = useState({
    isOpen: false,
    type: null
  });

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
        // Add metadata for backend processing
        locationMetadata: {
          pickup: {
            hasExactAddress: formData.pickupLocation && !formData.pickupLocation.isCoordinateOnly,
            hasCoordinates: formData.pickupLocation && formData.pickupLocation.coordinates,
            hasPlaceId: formData.pickupLocation && formData.pickupLocation.placeId,
            coordinatesValid: formData.pickupLocation && 
              formData.pickupLocation.coordinates &&
              typeof formData.pickupLocation.coordinates.lat === 'number' &&
              typeof formData.pickupLocation.coordinates.lng === 'number'
          },
          dropoff: {
            hasExactAddress: formData.dropoffLocation && !formData.dropoffLocation.isCoordinateOnly,
            hasCoordinates: formData.dropoffLocation && formData.dropoffLocation.coordinates,
            hasPlaceId: formData.dropoffLocation && formData.dropoffLocation.placeId,
            coordinatesValid: formData.dropoffLocation && 
              formData.dropoffLocation.coordinates &&
              typeof formData.dropoffLocation.coordinates.lat === 'number' &&
              typeof formData.dropoffLocation.coordinates.lng === 'number'
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

  // Enhanced LocationInput component
  const LocationInput = ({ 
    label, 
    value, 
    placeholder, 
    error, 
    required, 
    onPickerOpen,
    locationData
  }) => {
    const getLocationIcon = () => {
      if (!locationData) return '📍';
      
      if (locationData.name && !locationData.isCoordinateOnly) {
        return '🏢'; // Business/landmark
      } else if (locationData.isCoordinateOnly) {
        return '📍'; // Exact coordinates
      } else {
        return '🏠'; // Regular address
      }
    };

    const getLocationInfo = () => {
      if (!locationData) return null;
      
      if (locationData.isCoordinateOnly) {
        return 'Exact coordinates';
      } else if (locationData.name) {
        return `${locationData.name}`;
      } else {
        return 'Address selected';
      }
    };

    const getCoordinateDisplay = () => {
      if (!locationData || !locationData.coordinates) return null;
      
      const lat = Number(locationData.coordinates.lat).toFixed(3);
      const lng = Number(locationData.coordinates.lng).toFixed(3);
      return `${lat}, ${lng}`;
    };

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={value}
            readOnly
            placeholder={placeholder}
            className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-colors ${
              error ? 'border-red-500' : 'border-gray-700'
            }`}
            onClick={onPickerOpen}
          />
          <Button
            type="button"
            onClick={onPickerOpen}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gold-500 transition-colors"
            title="Open location picker"
          >
            <Map className="h-5 w-5 text-gray-400 hover:text-gold-500" />
          </Button>
        </div>
        
        {/* Location info display */}
        {value && locationData && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-gray-500">
              <span>{getLocationIcon()}</span>
              <span>{getLocationInfo()}</span>
            </div>
            {locationData.coordinates && (
              <span className="text-gray-600">
                {getCoordinateDisplay()}
              </span>
            )}
          </div>
        )}
        
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        
        {!value && (
          <p className="text-xs text-gray-500 flex items-center">
            <Map className="h-3 w-3 mr-1" />
            Click to select location on map
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
          placeholder="Select pickup location"
          value={formData.pickupAddress}
          error={errors.pickupAddress}
          required
          onPickerOpen={() => openLocationPicker('pickup')}
          locationData={formData.pickupLocation}
        />

        <LocationInput
          label="Drop-off Address"
          placeholder="Select destination"
          value={formData.dropoffAddress}
          error={errors.dropoffAddress}
          required
          onPickerOpen={() => openLocationPicker('dropoff')}
          locationData={formData.dropoffLocation}
        />

         <Select
            label="Vehicle Type"
            options={vehicleOptions}
            value={formData.vehicleType}
            onChange={(e) => handleInputChange('vehicleType', e.target.value)}
            placeholder="Select Vehicle"
            icon={Car}
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

        {/* Special Requests */}
        <div className="md:col-span-2 lg:col-span-3">
          <Input
            label="Special Requests"
            placeholder="Any special requirements or requests"
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            icon={MessageCircle}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={handleSubmit}
          size="xl"
          disabled={loading}
          className="w-full sm:w-auto min-w-[280px]"
        >
          {loading ? 'Processing...' : 'Calculate Price & Continue'}
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