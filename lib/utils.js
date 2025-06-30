// lib/utils.js - Enhanced pricing structure with round trip, event, and proper hourly calculations

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const getCarDisplayName = (carType) => {
  const carNames = {
    'luxury_sedan': 'Luxury Sedans',
    'premium_luxury_sedan': 'Premium Luxury Sedans',
    'suv': 'SUV',
    '7_seater': '7 Seater',
    'people_mover_11_seater': '11 Seater'
  };
  return carNames[carType] || carType;
};

// Enhanced pricing structure with proper service type handling
const PRICING_CONFIG = {
  // Base rates for different vehicle types and services
  baseRates: {
    luxury_sedan: {
      base: 85,           // One-way trip base rate
      hourly: 155,        // Per hour rate
      events: 180         // Event base rate (premium pricing)
    },
    premium_luxury_sedan: {
      base: 110,
      hourly: 165,
      events: 210
    },
    suv: {
      base: 110,
      hourly: 165,
      events: 210
    },
    '7_seater': {
      base: 130,
      hourly: 180,
      events: 230
    },
    'people_mover_11_seater': {
      base: 180,
      hourly: 205,
      events: 280
    }
  },
  
  // Per km and per minute charges after base kilometers
  perKmRate: 2.5,
  perMinuteRate: 0.5,
  
  // Base kilometers included in base price
  baseKilometers: 10,
  
  // Hourly booking configuration
  hourly: {
    minimumHours: 2,        // Minimum 2 hours booking
    baseKilometers: 80,     // 80 km per hour included
    excessKmRate: 3.5       // $3.5 per km if exceeding 80km per hour
  },
  
  // Event booking configuration
  events: {
    baseKilometers: 15,     // More km included for events
    perKmRate: 3.0,         // Higher per km rate for events
    perMinuteRate: 0.75,    // Higher per minute rate for events
    minimumDuration: 120    // Minimum 2 hours for events (in minutes)
  },
  
  // Round trip multiplier
  roundTripMultiplier: 2.0,
  
  // Tax
  gstRate: 0.10 // 10% GST
};

// Helper function to convert address to coordinates using new Places API
export const geocodeAddress = async (address) => {
  if (!window.google) {
    throw new Error('Google Maps API not loaded');
  }

  try {
    // Try using the new Places API first
    if (window.google.maps.places && window.google.maps.places.Place) {
      const { Place } = window.google.maps.places;
      const request = {
        textQuery: address,
        fields: ['displayName', 'location', 'formattedAddress'],
        locationBias: { lat: 24.7136, lng: 46.6753 }, // Riyadh, Saudi Arabia
      };

      try {
        const { places } = await Place.searchByText(request);
        if (places && places.length > 0) {
          const place = places[0];
          return {
            lat: place.location.lat(),
            lng: place.location.lng(),
            formatted_address: place.formattedAddress || place.displayName
          };
        }
      } catch (placesError) {
        console.warn('New Places API failed, falling back to Geocoder:', placesError);
      }
    }

    // Fallback to Geocoder if Places API fails or is not available
    if (window.google.maps.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise((resolve, reject) => {
        geocoder.geocode({ address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            resolve({
              lat: location.lat(),
              lng: location.lng(),
              formatted_address: results[0].formatted_address
            });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    }

    throw new Error('No geocoding service available');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Calculate distance using haversine formula as fallback
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Enhanced distance calculation
export const calculateDistanceAndDuration = async (pickup, dropoff) => {
  if (!window.google) {
    console.warn('Google Maps API not available, using mock calculation');
    return {
      distance: Math.random() * 50 + 10,
      duration: Math.random() * 60 + 15,
      status: 'mock',
      distanceText: `${(Math.random() * 50 + 10).toFixed(1)} km`,
      durationText: `${Math.round(Math.random() * 60 + 15)} min`
    };
  }

  try {
    // Method 1: Try Distance Matrix API
    try {
      const result = await calculateWithDistanceMatrix(pickup, dropoff);
      if (result) {
        return { ...result, status: 'distance_matrix' };
      }
    } catch (matrixError) {
      console.warn('Distance Matrix API failed:', matrixError);
    }

    // Method 2: Geocode addresses and use haversine distance
    try {
      const result = await calculateWithGeocoding(pickup, dropoff);
      if (result) {
        return { ...result, status: 'geocoded_estimate' };
      }
    } catch (geocodeError) {
      console.warn('Geocoding fallback failed:', geocodeError);
    }

    throw new Error('All calculation methods failed');

  } catch (error) {
    console.error('Error calculating distance and duration:', error);
    
    // Final fallback to reasonable estimates
    const estimatedDistance = 25 + (Math.random() * 30); // 25-55 km
    const estimatedDuration = estimatedDistance * 2 + (Math.random() * 20); // Rough estimate
    
    return {
      distance: Math.round(estimatedDistance * 100) / 100,
      duration: Math.round(estimatedDuration),
      distanceText: `${estimatedDistance.toFixed(1)} km (estimated)`,
      durationText: `${Math.round(estimatedDuration)} min (estimated)`,
      status: 'fallback_estimate',
      error: error.message
    };
  }
};

// Method: Calculate using Distance Matrix API
const calculateWithDistanceMatrix = async (pickup, dropoff) => {
  if (!window.google.maps.DistanceMatrixService) {
    throw new Error('Distance Matrix Service not available');
  }

  const service = new window.google.maps.DistanceMatrixService();
  
  // Handle different input formats
  const processLocation = (location) => {
    if (typeof location === 'string') {
      return location;
    } else if (location.coordinates) {
      return new window.google.maps.LatLng(location.coordinates.lat, location.coordinates.lng);
    } else if (location.lat && location.lng) {
      return new window.google.maps.LatLng(location.lat, location.lng);
    } else {
      return location.address || location;
    }
  };

  const origin = processLocation(pickup);
  const destination = processLocation(dropoff);

  return new Promise((resolve, reject) => {
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false,
    }, (response, status) => {
      if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
        const element = response.rows[0].elements[0];
        const distanceInKm = element.distance.value / 1000;
        const durationInMinutes = element.duration.value / 60;
        
        resolve({
          distance: Math.round(distanceInKm * 100) / 100,
          duration: Math.round(durationInMinutes),
          distanceText: `${distanceInKm.toFixed(1)} km`,
          durationText: element.duration.text
        });
      } else {
        reject(new Error(`Distance Matrix API error: ${status} - ${response.rows[0]?.elements[0]?.status || 'Unknown error'}`));
      }
    });
  });
};

// Method: Calculate using geocoding and haversine distance (primary fallback)
const calculateWithGeocoding = async (pickup, dropoff) => {
  try {
    const pickupCoords = await geocodeAddress(typeof pickup === 'string' ? pickup : pickup.address || pickup);
    const dropoffCoords = await geocodeAddress(typeof dropoff === 'string' ? dropoff : dropoff.address || dropoff);
    
    const distance = calculateHaversineDistance(
      pickupCoords.lat, pickupCoords.lng,
      dropoffCoords.lat, dropoffCoords.lng
    );
    
    // Estimate duration based on distance (assume average speed of 40 km/h in city)
    const duration = (distance / 40) * 60; // Convert to minutes
    
    return {
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      distanceText: `${distance.toFixed(1)} km`,
      durationText: `${Math.round(duration)} min`
    };
  } catch (error) {
    throw new Error(`Geocoding calculation failed: ${error.message}`);
  }
};

// Legacy function for backward compatibility
export const calculateDistance = async (pickup, dropoff) => {
  const result = await calculateDistanceAndDuration(pickup, dropoff);
  return {
    distance: result.distance,
    duration: result.duration,
    distanceText: result.distanceText,
    durationText: result.durationText,
    status: result.status
  };
};

// Enhanced price calculation function with proper service type handling
export const calculatePrice = async (bookingData) => {
  try {
    // Get vehicle type, service type, and trip type
    const vehicleType = bookingData.vehicleType || 'luxury_sedan';
    const serviceType = bookingData.serviceType || 'base'; // base, hourly, events
    const isRoundTrip = bookingData.isRoundTrip || false;
    const hours = bookingData.hours || PRICING_CONFIG.hourly.minimumHours;
    
    // Get base rate for vehicle type and service
    const vehicleRates = PRICING_CONFIG.baseRates[vehicleType];
    if (!vehicleRates) {
      throw new Error(`Invalid vehicle type: ${vehicleType}`);
    }
    
    let basePrice = vehicleRates[serviceType] || vehicleRates.base;
    
    // Get distance and duration
    const routeData = await calculateDistanceAndDuration(bookingData.pickupAddress, bookingData.dropoffAddress);
    let distance = routeData.distance; // in kilometers
    let duration = routeData.duration; // in minutes
    
    // For round trips, double the distance and duration (except for hourly)
    if (isRoundTrip && serviceType !== 'hourly') {
      distance *= PRICING_CONFIG.roundTripMultiplier;
      duration *= PRICING_CONFIG.roundTripMultiplier;
    }
    
    let totalPrice = 0;
    let kmCharges = 0;
    let timeCharges = 0;
    let breakdown = {
      basePrice: 0,
      kmCharges: 0,
      timeCharges: 0,
      gst: 0,
      roundTripMultiplier: isRoundTrip && serviceType !== 'hourly' ? PRICING_CONFIG.roundTripMultiplier : 1
    };
    
    // Calculate based on service type
    switch (serviceType) {
      case 'hourly':
        // Hourly booking calculation - charged per hour, minimum 2 hours
        const actualHours = Math.max(hours, PRICING_CONFIG.hourly.minimumHours);
        basePrice = vehicleRates.hourly * actualHours;
        
        // For round trip hourly, charge double the hourly rate
        if (isRoundTrip) {
          basePrice *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.roundTripMultiplier = PRICING_CONFIG.roundTripMultiplier;
        }
        
        totalPrice = basePrice;
        breakdown.basePrice = basePrice;
        
        // Check if distance exceeds allowed kilometers (80km per hour)
        const allowedKm = PRICING_CONFIG.hourly.baseKilometers * actualHours;
        if (distance > allowedKm) {
          const excessKm = distance - allowedKm;
          kmCharges = excessKm * PRICING_CONFIG.hourly.excessKmRate;
          breakdown.kmCharges = kmCharges;
          totalPrice += kmCharges;
        }
        break;
        
      case 'events':
        // Event booking calculation - premium rates with more inclusions
        totalPrice = basePrice;
        breakdown.basePrice = basePrice;
        
        // Check if distance exceeds base kilometers for events (15km)
        if (distance > PRICING_CONFIG.events.baseKilometers) {
          const excessKm = distance - PRICING_CONFIG.events.baseKilometers;
          kmCharges = excessKm * PRICING_CONFIG.events.perKmRate;
          breakdown.kmCharges = kmCharges;
          totalPrice += kmCharges;
        }
        
        // Add per minute charges for events (higher rate)
        const eventDuration = Math.max(duration, PRICING_CONFIG.events.minimumDuration);
        timeCharges = eventDuration * PRICING_CONFIG.events.perMinuteRate;
        breakdown.timeCharges = timeCharges;
        totalPrice += timeCharges;
        
        // Round trip for events
        if (isRoundTrip) {
          totalPrice *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.basePrice *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.kmCharges *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.timeCharges *= PRICING_CONFIG.roundTripMultiplier;
        }
        break;
        
      case 'base':
      default:
        // Base booking calculation
        totalPrice = basePrice;
        breakdown.basePrice = basePrice;
        
        // Check if distance exceeds base kilometers (10km)
        if (distance > PRICING_CONFIG.baseKilometers) {
          const excessKm = distance - PRICING_CONFIG.baseKilometers;
          kmCharges = excessKm * PRICING_CONFIG.perKmRate;
          breakdown.kmCharges = kmCharges;
          totalPrice += kmCharges;
        }
        
        // Add per minute charges for total duration
        timeCharges = duration * PRICING_CONFIG.perMinuteRate;
        breakdown.timeCharges = timeCharges;
        totalPrice += timeCharges;
        
        // Round trip for base service
        if (isRoundTrip) {
          totalPrice *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.basePrice *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.kmCharges *= PRICING_CONFIG.roundTripMultiplier;
          breakdown.timeCharges *= PRICING_CONFIG.roundTripMultiplier;
        }
        break;
    }
    
    // Calculate GST (10%)
    const gst = totalPrice * PRICING_CONFIG.gstRate;
    breakdown.gst = gst;
    totalPrice += gst;
    
    // Round all values to 2 decimal places
    Object.keys(breakdown).forEach(key => {
      if (typeof breakdown[key] === 'number') {
        breakdown[key] = Math.round(breakdown[key] * 100) / 100;
      }
    });
    
    // Prepare detailed breakdown information
    const getServiceInfo = () => {
      switch (serviceType) {
        case 'hourly':
          const actualHours = Math.max(hours, PRICING_CONFIG.hourly.minimumHours);
          return {
            serviceDescription: `${actualHours} hour${actualHours > 1 ? 's' : ''} booking${isRoundTrip ? ' (Round Trip)' : ''}`,
            baseKmIncluded: PRICING_CONFIG.hourly.baseKilometers * actualHours,
            rateInfo: `$${vehicleRates.hourly}/hour × ${actualHours} hour${actualHours > 1 ? 's' : ''}${isRoundTrip ? ' × 2 (Round Trip)' : ''}`
          };
        case 'events':
          return {
            serviceDescription: `Event booking${isRoundTrip ? ' (Round Trip)' : ''}`,
            baseKmIncluded: PRICING_CONFIG.events.baseKilometers,
            rateInfo: `Event rate: $${vehicleRates.events}${isRoundTrip ? ' × 2 (Round Trip)' : ''}`
          };
        default:
          return {
            serviceDescription: `Base service${isRoundTrip ? ' (Round Trip)' : ''}`,
            baseKmIncluded: PRICING_CONFIG.baseKilometers,
            rateInfo: `Base rate: $${vehicleRates.base}${isRoundTrip ? ' × 2 (Round Trip)' : ''}`
          };
      }
    };
    
    const serviceInfo = getServiceInfo();
    
    return {
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      distanceText: routeData.distanceText,
      durationText: routeData.durationText,
      vehicleType: vehicleType,
      serviceType: serviceType,
      isRoundTrip: isRoundTrip,
      hours: serviceType === 'hourly' ? Math.max(hours, PRICING_CONFIG.hourly.minimumHours) : null,
      basePrice: Math.round(breakdown.basePrice * 100) / 100,
      kmCharges: Math.round(breakdown.kmCharges * 100) / 100,
      timeCharges: Math.round(breakdown.timeCharges * 100) / 100,
      gst: Math.round(breakdown.gst * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      breakdown: breakdown,
      calculationMethod: routeData.status,
      priceBreakdown: {
        baseInfo: `${getCarDisplayName(vehicleType)} - ${serviceInfo.serviceDescription}`,
        distanceInfo: `${(distance / (isRoundTrip && serviceType !== 'hourly' ? 2 : 1)).toFixed(1)} km${isRoundTrip && serviceType !== 'hourly' ? ' × 2 (Round Trip)' : ''} (Base: ${serviceInfo.baseKmIncluded} km included)`,
        timeInfo: `${Math.round(duration / (isRoundTrip && serviceType !== 'hourly' ? 2 : 1))} minutes${isRoundTrip && serviceType !== 'hourly' ? ' × 2 (Round Trip)' : ''}`,
        rateInfo: serviceInfo.rateInfo
      }
    };
    
  } catch (error) {
    console.error('Error in price calculation:', error);
    
    // Enhanced fallback calculation
    const vehicleType = bookingData.vehicleType || 'luxury_sedan';
    const serviceType = bookingData.serviceType || 'base';
    const isRoundTrip = bookingData.isRoundTrip || false;
    const vehicleRates = PRICING_CONFIG.baseRates[vehicleType] || PRICING_CONFIG.baseRates.luxury_sedan;
    let basePrice = vehicleRates[serviceType] || vehicleRates.base;
    
    // Apply round trip multiplier for fallback
    if (isRoundTrip && serviceType !== 'hourly') {
      basePrice *= PRICING_CONFIG.roundTripMultiplier;
    } else if (isRoundTrip && serviceType === 'hourly') {
      basePrice *= PRICING_CONFIG.roundTripMultiplier;
    }
    
    const estimatedDistance = 20 + (Math.random() * 20); // 20-40 km
    const estimatedDuration = 30 + (Math.random() * 30); // 30-60 minutes
    const totalPrice = basePrice + (estimatedDistance * 2) + (basePrice * 0.1); // Including GST estimate
    
    return {
      distance: Math.round(estimatedDistance * 100) / 100,
      duration: Math.round(estimatedDuration),
      distanceText: `${estimatedDistance.toFixed(1)} km (estimated)`,
      durationText: `${Math.round(estimatedDuration)} min (estimated)`,
      vehicleType: vehicleType,
      serviceType: serviceType,
      isRoundTrip: isRoundTrip,
      basePrice: Math.round(basePrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      error: 'Distance calculation failed - using estimates',
      status: 'enhanced_estimate'
    };
  }
};

// Enhanced Google Maps API loading with better error handling and newer libraries
export const loadGoogleMapsAPI = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }

    // Check if script is already loading
    if (window.googleMapsLoading) {
      window.googleMapsLoading.then(resolve).catch(reject);
      return;
    }

    const script = document.createElement('script');
    // Updated libraries - removed deprecated ones, added newer APIs
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places,marker&loading=async&v=weekly`;
    script.async = true;
    script.defer = true;
    
    window.googleMapsLoading = new Promise((scriptResolve, scriptReject) => {
      script.onload = () => {
        if (window.google && window.google.maps) {
          console.log('Google Maps API loaded successfully');
          console.log('Available services:', {
            geocoder: !!window.google.maps.Geocoder,
            distanceMatrix: !!window.google.maps.DistanceMatrixService,
            places: !!window.google.maps.places,
            newPlaces: !!window.google.maps.places?.Place,
            advancedMarkers: !!window.google.maps.marker?.AdvancedMarkerElement
          });
          window.googleMapsLoading = null;
          scriptResolve(window.google.maps);
        } else {
          const error = new Error('Google Maps API failed to load properly');
          window.googleMapsLoading = null;
          scriptReject(error);
        }
      };
      
      script.onerror = () => {
        const error = new Error('Failed to load Google Maps API script - check API key and billing');
        console.error('Google Maps API loading failed. Common causes:');
        console.error('1. Invalid API key');
        console.error('2. API not enabled in Google Cloud Console');
        console.error('3. Billing not set up');
        console.error('4. Domain restrictions');
        window.googleMapsLoading = null;
        scriptReject(error);
      };
    });
    
    document.head.appendChild(script);
    
    window.googleMapsLoading.then(resolve).catch(reject);
  });
};