// pages/api/booking/calculate-price.js - Server-side price calculation API
import { Client } from '@googlemaps/google-maps-services-js';

// Initialize Google Maps client
const client = new Client({});

const calculateDistance = async (pickup, dropoff) => {
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn('Google Maps API key not configured');
    return {
      distance: Math.random() * 50 + 5,
      duration: Math.random() * 60 + 15,
      status: 'mock'
    };
  }

  try {
    const response = await client.distancematrix({
      params: {
        origins: [pickup],
        destinations: [dropoff],
        units: 'imperial',
        mode: 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    const element = response.data.rows[0].elements[0];
    
    if (element.status === 'OK') {
      const distanceInMiles = element.distance.value * 0.000621371;
      const durationInMinutes = element.duration.value / 60;
      
      return {
        distance: Math.round(distanceInMiles * 100) / 100,
        duration: Math.round(durationInMinutes),
        distanceText: element.distance.text,
        durationText: element.duration.text,
        status: 'OK'
      };
    } else {
      throw new Error(`Distance calculation failed: ${element.status}`);
    }
  } catch (error) {
    console.error('Google Maps API error:', error);
    return {
      distance: Math.random() * 50 + 5,
      duration: Math.random() * 60 + 15,
      status: 'fallback',
      error: error.message
    };
  }
};

const calculatePrice = async (bookingData) => {
  const baseRates = {
    sedan: 2.5,
    suv: 3.0,
    limousine: 5.0,
    van: 3.5,
    sports: 4.0,
  };

  const serviceRates = {
    wifi: 10,
    refreshments: 25,
    newspapers: 5,
    'child-seat': 15,
    champagne: 50,
  };

  const surcharges = {
    airport: 15,
    night: 0.2,
    weekend: 0.1,
    holiday: 0.25,
  };

  let baseRate = baseRates[bookingData.vehicleType] || 2.5;
  let serviceCharges = 0;
  let surchargeAmount = 0;

  // Calculate service charges
  if (bookingData.extraServices) {
    if (Array.isArray(bookingData.extraServices)) {
      serviceCharges = bookingData.extraServices.reduce((total, service) => {
        return total + (serviceRates[service] || 0);
      }, 0);
    } else {
      serviceCharges = serviceRates[bookingData.extraServices] || 0;
    }
  }

  try {
    // Get distance calculation
    const distanceData = await calculateDistance(
      bookingData.pickupAddress, 
      bookingData.dropoffAddress
    );
    
    const distance = distanceData.distance;
    
    // Calculate base price with minimum fare
    let basePrice = Math.max(distance * baseRate, 25);
    
    // Apply surcharges
    const bookingDate = new Date(bookingData.date);
    const bookingTime = bookingData.time;
    
    // Airport surcharge
    const isAirportTrip = checkAirportTrip(bookingData.pickupAddress, bookingData.dropoffAddress);
    if (isAirportTrip) {
      surchargeAmount += surcharges.airport;
    }
    
    // Night surcharge (10 PM - 6 AM)
    const hour = parseInt(bookingTime.split(':')[0]);
    const isNightRide = hour >= 22 || hour < 6;
    if (isNightRide) {
      surchargeAmount += basePrice * surcharges.night;
    }
    
    // Weekend surcharge
    const dayOfWeek = bookingDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    if (isWeekend) {
      surchargeAmount += basePrice * surcharges.weekend;
    }
    
    // Holiday surcharge
    const isHoliday = checkHoliday(bookingDate);
    if (isHoliday) {
      surchargeAmount += basePrice * surcharges.holiday;
    }

    const subtotal = basePrice + serviceCharges + surchargeAmount;
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const totalPrice = subtotal + tax;

    return {
      distance: distance,
      duration: distanceData.duration,
      distanceText: distanceData.distanceText,
      durationText: distanceData.durationText,
      basePrice: Math.round(basePrice * 100) / 100,
      serviceCharges: Math.round(serviceCharges * 100) / 100,
      surcharges: Math.round(surchargeAmount * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      breakdown: {
        baseFare: `${distance.toFixed(1)} miles × $${baseRate}/mile`,
        services: bookingData.extraServices,
        surchargeDetails: {
          airport: isAirportTrip,
          night: isNightRide,
          weekend: isWeekend,
          holiday: isHoliday
        }
      },
      status: distanceData.status
    };
  } catch (error) {
    console.error('Price calculation error:', error);
    
    // Fallback calculation
    const estimatedDistance = 20;
    const basePrice = Math.max(estimatedDistance * baseRate, 25);
    const subtotal = basePrice + serviceCharges;
    const tax = subtotal * 0.08;
    const totalPrice = subtotal + tax;

    return {
      distance: estimatedDistance,
      duration: 30,
      basePrice: Math.round(basePrice * 100) / 100,
      serviceCharges: Math.round(serviceCharges * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      totalPrice: Math.round(totalPrice * 100) / 100,
      error: 'Distance calculation unavailable - using estimated pricing',
      status: 'estimated'
    };
  }
};

const checkAirportTrip = (pickup, dropoff) => {
  const airportKeywords = ['airport', 'terminal', 'departure', 'arrival', 'international', 'domestic'];
  const addresses = [pickup.toLowerCase(), dropoff.toLowerCase()];
  
  return addresses.some(address => 
    airportKeywords.some(keyword => address.includes(keyword))
  );
};

const checkHoliday = (date) => {
  const holidays = [
    '2024-01-01', // New Year's Day
    '2024-07-04', // Independence Day
    '2024-12-25', // Christmas
    // Add more holidays as needed
  ];
  
  const dateString = date.toISOString().split('T')[0];
  return holidays.includes(dateString);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bookingData = req.body;
    
    // Validate required fields
    if (!bookingData.pickupAddress || !bookingData.dropoffAddress) {
      return res.status(400).json({ 
        error: 'Pickup and dropoff addresses are required' 
      });
    }

    if (!bookingData.vehicleType) {
      return res.status(400).json({ 
        error: 'Vehicle type is required' 
      });
    }

    const priceResult = await calculatePrice(bookingData);
    
    res.status(200).json(priceResult);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}