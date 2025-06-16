// lib/utils.js - Updated with new pricing structure based on requirements

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

// New pricing structure based on requirements
const PRICING_CONFIG = {
  // Base rates for different vehicle types and services
  baseRates: {
    luxury_sedan: {
      base: 85,
      hourly: 155,
      events: 180
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
  
  // Peak and weekend surcharge
  peakSurchargeRate: 0.15, // 15% extra
  peakDays: ['friday', 'saturday', 'sunday'],
  
  // Hourly booking configuration
  hourly: {
    minimumHours: 2,
    baseKilometers: 80, // 80 km per hour
    excessKmRate: 3.5 // $3.5 per km if more than 80km in 1 hour
  },
  
  // Tax and fees
  gstRate: 0.10, // 10% GST
  
  // Additional fees
  fees: {
    airport: 25,
    waiting: 15, // per 15 minutes
    stops: 10, // per additional stop
    carDecor: 50 // for events
  }
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

// Enhanced distance calculation with multiple fallback methods
export const calculateDistanceAndTolls = async (pickup, dropoff) => {
  if (!window.google) {
    console.warn('Google Maps API not available, using mock calculation');
    return {
      distance: Math.random() * 50 + 10,
      duration: Math.random() * 60 + 15,
      tolls: Math.random() * 15,
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
    console.error('Error calculating distance and tolls:', error);
    
    // Final fallback to reasonable estimates
    const estimatedDistance = 25 + (Math.random() * 30); // 25-55 km
    const estimatedDuration = estimatedDistance * 2 + (Math.random() * 20); // Rough estimate
    const estimatedTolls = estimatedDistance > 30 ? Math.random() * 20 : Math.random() * 10;
    
    return {
      distance: Math.round(estimatedDistance * 100) / 100,
      duration: Math.round(estimatedDuration),
      distanceText: `${estimatedDistance.toFixed(1)} km (estimated)`,
      durationText: `${Math.round(estimatedDuration)} min (estimated)`,
      tolls: Math.round(estimatedTolls * 100) / 100,
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
        
        // Estimate tolls based on distance and route characteristics
        const estimatedTolls = estimateTollsFromDistance(distanceInKm, origin, destination);
        
        resolve({
          distance: Math.round(distanceInKm * 100) / 100,
          duration: Math.round(durationInMinutes),
          distanceText: `${distanceInKm.toFixed(1)} km`,
          durationText: element.duration.text,
          tolls: Math.round(estimatedTolls * 100) / 100,
          tollDetails: []
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
    
    // Estimate tolls based on distance
    const tolls = estimateTollsFromDistance(distance, pickupCoords, dropoffCoords);
    
    return {
      distance: Math.round(distance * 100) / 100,
      duration: Math.round(duration),
      distanceText: `${distance.toFixed(1)} km`,
      durationText: `${Math.round(duration)} min`,
      tolls: Math.round(tolls * 100) / 100,
      tollDetails: []
    };
  } catch (error) {
    throw new Error(`Geocoding calculation failed: ${error.message}`);
  }
};

// Enhanced toll estimation based on distance and locations
const estimateTollsFromDistance = (distanceInKm, origin, destination) => {
  let estimatedTolls = 0;
  
  // Basic toll estimation for Saudi Arabia / Middle East
  // Major highways and bridges typically have tolls
  
  if (distanceInKm > 30) {
    // Long distance trips likely use highways with tolls
    estimatedTolls = distanceInKm * 0.25; // SAR per km estimate
  } else if (distanceInKm > 15) {
    // Medium distance trips
    estimatedTolls = distanceInKm * 0.15; // SAR per km estimate
  } else if (distanceInKm > 8) {
    // Short trips might have bridge/tunnel tolls
    estimatedTolls = Math.random() * 8; // Random small toll
  }
  
  // Add minimum toll for long trips
  if (distanceInKm > 50) {
    estimatedTolls = Math.max(estimatedTolls, 15.00);
  }
  
  // Cap maximum estimated tolls
  estimatedTolls = Math.min(estimatedTolls, distanceInKm * 0.80);
  
  return estimatedTolls;
};

// Legacy function for backward compatibility
export const calculateDistance = async (pickup, dropoff) => {
  const result = await calculateDistanceAndTolls(pickup, dropoff);
  return {
    distance: result.distance,
    duration: result.duration,
    distanceText: result.distanceText,
    durationText: result.durationText,
    status: result.status
  };
};

// Helper function to check if date is peak time (Friday, Saturday, Sunday)
const isPeakTime = (date) => {
  const dayOfWeek = date.getDay();
  // Sunday = 0, Friday = 5, Saturday = 6
  return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
};

// Helper function to check if trip involves airport
const checkAirportTrip = (pickup, dropoff) => {
  const airportKeywords = ['airport', 'terminal', 'departure', 'arrival', 'international', 'domestic'];
  const addresses = [pickup.toLowerCase(), dropoff.toLowerCase()];
  
  return addresses.some(address => 
    airportKeywords.some(keyword => address.includes(keyword))
  );
};

// Main price calculation function with new pricing structure
export const calculatePrice = async (bookingData) => {
  try {
    // Get vehicle type and service type
    const vehicleType = bookingData.vehicleType || 'luxury_sedan';
    const serviceType = bookingData.serviceType || 'base'; // base, hourly, events
    const bookingDate = new Date(bookingData.date);
    
    // Get base rate for vehicle type and service
    const vehicleRates = PRICING_CONFIG.baseRates[vehicleType];
    if (!vehicleRates) {
      throw new Error(`Invalid vehicle type: ${vehicleType}`);
    }
    
    let basePrice = vehicleRates[serviceType] || vehicleRates.base;
    
    // Get distance and duration
    const routeData = await calculateDistanceAndTolls(bookingData.pickupAddress, bookingData.dropoffAddress);
    const distance = routeData.distance; // in kilometers
    const duration = routeData.duration; // in minutes
    const tollCost = routeData.tolls || 0;
    
    let totalPrice = basePrice;
    let kmCharges = 0;
    let timeCharges = 0;
    let breakdown = {
      basePrice: basePrice,
      kmCharges: 0,
      timeCharges: 0,
      peakSurcharge: 0,
      gst: 0,
      tolls: tollCost,
      additionalFees: 0
    };
    
    if (serviceType === 'hourly') {
      // Hourly booking calculation
      const hours = bookingData.hours || PRICING_CONFIG.hourly.minimumHours;
      const minimumHours = Math.max(hours, PRICING_CONFIG.hourly.minimumHours);
      
      // Base price is for minimum hours
      basePrice = vehicleRates.hourly * minimumHours;
      totalPrice = basePrice;
      breakdown.basePrice = basePrice;
      
      // Check if distance exceeds base kilometers (80km per hour)
      const allowedKm = PRICING_CONFIG.hourly.baseKilometers * minimumHours;
      if (distance > allowedKm) {
        const excessKm = distance - allowedKm;
        kmCharges = excessKm * PRICING_CONFIG.hourly.excessKmRate;
        breakdown.kmCharges = kmCharges;
        totalPrice += kmCharges;
      }
      
    } else {
      // Base and Events booking calculation
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
    }
    
    // Check for peak time surcharge (15% extra on Friday, Saturday, Sunday)
    let peakSurcharge = 0;
    if (isPeakTime(bookingDate)) {
      peakSurcharge = (basePrice + kmCharges + timeCharges) * PRICING_CONFIG.peakSurchargeRate;
      breakdown.peakSurcharge = peakSurcharge;
      totalPrice += peakSurcharge;
    }
    
    // Add additional fees
    let additionalFees = 0;
    
    // Airport fee
    const isAirportTrip = checkAirportTrip(bookingData.pickupAddress, bookingData.dropoffAddress);
    if (isAirportTrip) {
      additionalFees += PRICING_CONFIG.fees.airport;
    }
    
    // Waiting time fee
    if (bookingData.waitingTime && bookingData.waitingTime > 0) {
      const waitingFee = Math.ceil(bookingData.waitingTime / 15) * PRICING_CONFIG.fees.waiting;
      additionalFees += waitingFee;
    }
    
    // Additional stops fee
    if (bookingData.additionalStops && bookingData.additionalStops > 0) {
      additionalFees += bookingData.additionalStops * PRICING_CONFIG.fees.stops;
    }
    
    // Car decoration for events
    if (serviceType === 'events' && bookingData.carDecoration) {
      additionalFees += PRICING_CONFIG.fees.carDecor;
    }
    
    breakdown.additionalFees = additionalFees;
    totalPrice += additionalFees;
    
    // Add tolls
    totalPrice += tollCost;
    
    // Calculate GST (10%)
    const gst = totalPrice * PRICING_CONFIG.gstRate;
    breakdown.gst = gst;
    totalPrice += gst;
    
    // Round all values to 2 decimal places
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round(breakdown[key] * 100) / 100;
    });
    
    return {
      distance: distance,
      duration: duration,
      distanceText: routeData.distanceText,
      durationText: routeData.durationText,
      vehicleType: vehicleType,
      serviceType: serviceType,
      basePrice: Math.round(basePrice * 100) / 100,
      kmCharges: Math.round(kmCharges * 100) / 100,
      timeCharges: Math.round(timeCharges * 100) / 100,
      peakSurcharge: Math.round(peakSurcharge * 100) / 100,
      gst: Math.round(gst * 100) / 100,
      tolls: Math.round(tollCost * 100) / 100,
      additionalFees: Math.round(additionalFees * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      breakdown: breakdown,
      isPeakTime: isPeakTime(bookingDate),
      isAirportTrip: isAirportTrip,
      calculationMethod: routeData.status,
      priceBreakdown: {
        baseInfo: `${getCarDisplayName(vehicleType)} - ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}`,
        distanceInfo: `${distance.toFixed(1)} km (Base: ${serviceType === 'hourly' ? PRICING_CONFIG.hourly.baseKilometers * (bookingData.hours || 2) : PRICING_CONFIG.baseKilometers} km included)`,
        timeInfo: `${Math.round(duration)} minutes`,
        peakTimeInfo: isPeakTime(bookingDate) ? 'Peak time surcharge applied (15% extra)' : 'Regular pricing',
        additionalInfo: {
          airport: isAirportTrip,
          waitingTime: bookingData.waitingTime || 0,
          additionalStops: bookingData.additionalStops || 0,
          carDecoration: serviceType === 'events' && bookingData.carDecoration
        }
      }
    };
    
  } catch (error) {
    console.error('Error in price calculation:', error);
    
    // Enhanced fallback calculation
    const vehicleType = bookingData.vehicleType || 'luxury_sedan';
    const serviceType = bookingData.serviceType || 'base';
    const vehicleRates = PRICING_CONFIG.baseRates[vehicleType] || PRICING_CONFIG.baseRates.luxury_sedan;
    const basePrice = vehicleRates[serviceType] || vehicleRates.base;
    const estimatedDistance = 20 + (Math.random() * 20); // 20-40 km
    const estimatedDuration = 30 + (Math.random() * 30); // 30-60 minutes
    const estimatedTolls = estimatedDistance > 25 ? 15 : 8;
    
    const totalPrice = basePrice + (estimatedDistance * 2) + (estimatedTolls * 1.1); // Including GST estimate
    
    return {
      distance: Math.round(estimatedDistance * 100) / 100,
      duration: Math.round(estimatedDuration),
      distanceText: `${estimatedDistance.toFixed(1)} km (estimated)`,
      durationText: `${Math.round(estimatedDuration)} min (estimated)`,
      vehicleType: vehicleType,
      serviceType: serviceType,
      basePrice: Math.round(basePrice * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      tolls: Math.round(estimatedTolls * 100) / 100,
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