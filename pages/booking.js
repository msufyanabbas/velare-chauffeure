import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/layout/Layout';
import BookingForm from '../components/booking/BookingForm';
import PriceCalculator from '../components/booking/PriceCalculator';
import PaymentForm from '../components/payment/PaymentForm';
import LocationPicker from '../components/booking/LocationPicker';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { calculatePrice, formatCurrency, loadGoogleMapsAPI } from '../lib/utils';

const BookingPage = ({preSelectedVehicle}) => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState(null);
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationPickerType, setLocationPickerType] = useState(null);
  const [formData, setFormData] = useState({});
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [priceCalculationStatus, setPriceCalculationStatus] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [calculationMethod, setCalculationMethod] = useState(null);

  // Load Google Maps API on component mount
  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.warn('Google Maps API key not found. Distance calculations will use estimates.');
          setMapError('Google Maps API key not configured');
          setMapsLoaded(false);
          return;
        }
        
        await loadGoogleMapsAPI(apiKey);
        setMapsLoaded(true);
        setMapError(null);
        console.log('Google Maps API loaded successfully');
      } catch (error) {
        console.error('Failed to load Google Maps API:', error);
        setMapsLoaded(false);
        setMapError(error.message);
      }
    };

    initializeGoogleMaps();
  }, []);

  const handleBookingSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setPriceCalculationStatus('Calculating route and pricing...');
    
    try {
      // Calculate price using the updated async function
      const priceResult = await calculatePrice(formData);
      setCalculationMethod(priceResult.calculationMethod);
      
      // Update status based on calculation result
      switch (priceResult.calculationMethod) {
        case 'distance_matrix':
          setPriceCalculationStatus('Route calculated successfully via Google Distance Matrix API');
          break;
        case 'geocoded_estimate':
          setPriceCalculationStatus('Distance calculated using geocoding with accurate coordinates');
          break;
        case 'enhanced_estimate':
          setPriceCalculationStatus('Using enhanced estimates based on typical routes');
          break;
        case 'fallback_estimate':
          setPriceCalculationStatus('Using fallback calculation - distance estimation applied');
          break;
        case 'mock':
          setPriceCalculationStatus('Using demonstration data for testing');
          break;
        default:
          setPriceCalculationStatus('Route calculation completed');
      }
      
      // Generate booking ID
      const bookingId = `VLR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      setBookingData({
        ...formData,
        bookingId,
        timestamp: new Date().toISOString(),
      });
      
      setPriceData(priceResult);
      setStep(2);
      
      // Clear the status after successful calculation
      setTimeout(() => setPriceCalculationStatus(null), 4000);
      
    } catch (err) {
      console.error('Booking calculation error:', err);
      setError(`Failed to calculate pricing: ${err.message || 'Please try again.'}`);
      setPriceCalculationStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceConfirm = () => {
    setStep(3);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Redirect to confirmation page with all necessary data
      router.push({
        pathname: '/booking-confirmation',
        query: {
          bookingId: paymentResult.bookingId || bookingData.bookingId,
          paymentIntentId: paymentResult.paymentIntent?.id,
          amount: priceData.totalPrice,
          currency: 'USD'
        },
      });
    } catch (err) {
      console.error('Navigation error:', err);
      setError('Booking completed but navigation failed. Please check your email for confirmation.');
    }
  };

  const handlePaymentError = (error) => {
    setError(error || 'Payment failed. Please try again.');
  };

  const handleBackToBooking = () => {
    setStep(1);
    setBookingData(null);
    setPriceData(null);
    setError(null);
    setPriceCalculationStatus(null);
    setCalculationMethod(null);
  };

  const handleBackToPrice = () => {
    setStep(2);
    setError(null);
  };

  const handleLocationSelect = (location) => {
    if (locationPickerType === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupAddress: location.address,
        pickupCoordinates: location.coordinates
      }));
    } else if (locationPickerType === 'dropoff') {
      setFormData(prev => ({
        ...prev,
        dropoffAddress: location.address,
        dropoffCoordinates: location.coordinates
      }));
    }
    setShowLocationPicker(false);
    setLocationPickerType(null);
  };

  const openLocationPicker = (type) => {
    setLocationPickerType(type);
    setShowLocationPicker(true);
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[
          { num: 1, label: 'Details' },
          { num: 2, label: 'Review' },
          { num: 3, label: 'Payment' }
        ].map((stepInfo, index) => (
          <React.Fragment key={stepInfo.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  step >= stepInfo.num
                    ? 'bg-gold-500 text-black'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {stepInfo.num}
              </div>
              <span className="text-xs text-gray-400 mt-1 hidden sm:block">{stepInfo.label}</span>
            </div>
            {index < 2 && (
              <div
                className={`w-12 h-0.5 transition-colors ${
                  step > stepInfo.num ? 'bg-gold-500' : 'bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStepTitle = () => {
    const titles = {
      1: 'Booking Details',
      2: 'Review & Pricing',
      3: 'Payment',
    };
    return (
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif text-white mb-2">
          {titles[step]}
        </h1>
        <div className="w-24 h-0.5 bg-gold-500 mx-auto"></div>
      </div>
    );
  };

  const getCalculationMethodDisplay = () => {
    switch (calculationMethod) {
      case 'distance_matrix':
        return { icon: '🗺️', text: 'Google Maps Distance Matrix', color: 'text-green-400' };
      case 'geocoded_estimate':
        return { icon: '📍', text: 'Geocoded Distance Calculation', color: 'text-blue-400' };
      case 'enhanced_estimate':
        return { icon: '🧮', text: 'Enhanced Route Estimation', color: 'text-yellow-400' };
      case 'fallback_estimate':
        return { icon: '📏', text: 'Basic Distance Estimation', color: 'text-orange-400' };
      case 'mock':
        return { icon: '🎭', text: 'Demo Mode', color: 'text-purple-400' };
      default:
        return { icon: '🚗', text: 'Standard Calculation', color: 'text-gray-400' };
    }
  };

  const renderBookingSummary = () => {
    const methodDisplay = getCalculationMethodDisplay();
    
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-serif text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-gold-500 rounded-full mr-3"></span>
          Booking Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-start py-2 border-b border-gray-800">
            <span className="text-gray-400">Pickup:</span>
            <span className="text-white font-medium text-right max-w-xs">{bookingData.pickupAddress}</span>
          </div>
          <div className="flex justify-between items-start py-2 border-b border-gray-800">
            <span className="text-gray-400">Drop-off:</span>
            <span className="text-white font-medium text-right max-w-xs">{bookingData.dropoffAddress}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Date & Time:</span>
            <span className="text-white font-medium">
              {new Date(bookingData.date).toLocaleDateString()} at {bookingData.time}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Vehicle:</span>
            <span className="text-white font-medium capitalize">{bookingData.vehicleType}</span>
          </div>
          
          {/* NEW: Service Type Display */}
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Service Type:</span>
            <span className="text-white font-medium capitalize">
              {priceData?.serviceType || 'Standard'}
              {priceData?.serviceType === 'hourly' && bookingData.hours && (
                <span className="text-gray-400 text-sm ml-1">({bookingData.hours}h)</span>
              )}
            </span>
          </div>

          {/* Trip Type - keeping for backward compatibility */}
          {bookingData.tripType && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Trip Type:</span>
              <span className="text-white font-medium capitalize">{bookingData.tripType}</span>
            </div>
          )}

          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Passengers:</span>
            <span className="text-white font-medium">{bookingData.passengers}</span>
          </div>
          
          {/* Distance and Duration Display */}
          {priceData && (
            <>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Distance:</span>
                <span className="text-white font-medium">
                  {priceData.distanceText || `${priceData.distance.toFixed(1)} km`}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-gray-400">Est. Duration:</span>
                <span className="text-white font-medium">
                  {priceData.durationText || `${priceData.duration} minutes`}
                </span>
              </div>
              
              {/* NEW: Peak Time Indicator */}
              {priceData.isPeakTime && (
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Peak Time:</span>
                  <span className="text-orange-400 font-medium flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                    Weekend/Friday (+15%)
                  </span>
                </div>
              )}

              {/* NEW: Airport Trip Indicator */}
              {priceData.isAirportTrip && (
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Airport Service:</span>
                  <span className="text-blue-400 font-medium flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Airport Fee Applied
                  </span>
                </div>
              )}

              {/* Toll Information */}
              {priceData.tolls > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Est. Tolls:</span>
                  <span className="text-white font-medium">{formatCurrency(priceData.tolls)}</span>
                </div>
              )}
            </>
          )}
          
          {/* NEW: Additional Services/Fees */}
          {bookingData.waitingTime && bookingData.waitingTime > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Waiting Time:</span>
              <span className="text-white font-medium">{bookingData.waitingTime} minutes</span>
            </div>
          )}

          {bookingData.additionalStops && bookingData.additionalStops > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Additional Stops:</span>
              <span className="text-white font-medium">{bookingData.additionalStops}</span>
            </div>
          )}

          {bookingData.carDecoration && priceData?.serviceType === 'events' && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Car Decoration:</span>
              <span className="text-gold-400 font-medium">✨ Event Special</span>
            </div>
          )}
          
          {bookingData.extraServices && Array.isArray(bookingData.extraServices) && bookingData.extraServices.length > 0 && (
            <div className="flex justify-between items-start py-2 border-b border-gray-800">
              <span className="text-gray-400">Services:</span>
              <span className="text-white font-medium text-right">
                {bookingData.extraServices.join(', ')}
              </span>
            </div>
          )}
          
          {bookingData.specialRequests && (
            <div className="flex justify-between items-start py-2">
              <span className="text-gray-400">Special Requests:</span>
              <span className="text-white font-medium text-right max-w-xs">{bookingData.specialRequests}</span>
            </div>
          )}
        </div>
        
        {/* Route Calculation Status */}
        {priceData && calculationMethod && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{methodDisplay.icon}</span>
                <span className={`text-sm font-medium ${methodDisplay.color}`}>
                  {methodDisplay.text}
                </span>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                calculationMethod === 'distance_matrix' ? 'bg-green-900/30 text-green-300' :
                calculationMethod === 'geocoded_estimate' ? 'bg-blue-900/30 text-blue-300' :
                calculationMethod === 'enhanced_estimate' ? 'bg-yellow-900/30 text-yellow-300' :
                calculationMethod === 'fallback_estimate' ? 'bg-orange-900/30 text-orange-300' :
                'bg-gray-900/30 text-gray-300'
              }`}>
                {calculationMethod === 'distance_matrix' ? 'Precise' :
                 calculationMethod === 'geocoded_estimate' ? 'Accurate' :
                 calculationMethod === 'enhanced_estimate' ? 'Estimated' :
                 calculationMethod === 'fallback_estimate' ? 'Basic' : 'Standard'}
              </div>
            </div>
            
            {/* Error information if present */}
            {priceData.error && (
              <div className="mt-2 text-xs text-gray-500">
                Note: {priceData.error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // NEW: Render detailed price breakdown
  const renderPriceBreakdown = () => {
    if (!priceData) return null;

    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-serif text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-gold-500 rounded-full mr-3"></span>
          Price Breakdown
        </h3>
        
        <div className="space-y-3">
          {/* Base Price */}
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">
              Base Price ({priceData.serviceType || 'Standard'})
            </span>
            <span className="text-white font-medium">{formatCurrency(priceData.basePrice)}</span>
          </div>

          {/* Distance Charges */}
          {priceData.kmCharges > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">
                Distance Charges
                <span className="text-xs block text-gray-500">
                  {priceData.priceBreakdown?.distanceInfo}
                </span>
              </span>
              <span className="text-white font-medium">{formatCurrency(priceData.kmCharges)}</span>
            </div>
          )}

          {/* Time Charges */}
          {priceData.timeCharges > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">
                Time Charges
                <span className="text-xs block text-gray-500">
                  {priceData.priceBreakdown?.timeInfo}
                </span>
              </span>
              <span className="text-white font-medium">{formatCurrency(priceData.timeCharges)}</span>
            </div>
          )}

          {/* Peak Time Surcharge */}
          {priceData.peakSurcharge > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-orange-400">
                Peak Time Surcharge (15%)
                <span className="text-xs block text-orange-300">
                  {priceData.priceBreakdown?.peakTimeInfo}
                </span>
              </span>
              <span className="text-orange-400 font-medium">+{formatCurrency(priceData.peakSurcharge)}</span>
            </div>
          )}

          {/* Additional Fees */}
          {priceData.additionalFees > 0 && (
            <div className="flex justify-between items-start py-2 border-b border-gray-800">
              <div className="text-gray-400">
                Additional Fees
                <div className="text-xs text-gray-500 mt-1 space-y-1">
                  {priceData.isAirportTrip && <div>• Airport service fee</div>}
                  {bookingData.waitingTime > 0 && <div>• Waiting time fee</div>}
                  {bookingData.additionalStops > 0 && <div>• Extra stops fee</div>}
                  {bookingData.carDecoration && <div>• Event decoration fee</div>}
                </div>
              </div>
              <span className="text-white font-medium">{formatCurrency(priceData.additionalFees)}</span>
            </div>
          )}

          {/* Tolls */}
          {priceData.tolls > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-gray-800">
              <span className="text-gray-400">Estimated Tolls</span>
              <span className="text-white font-medium">{formatCurrency(priceData.tolls)}</span>
            </div>
          )}

          {/* Subtotal */}
          <div className="flex justify-between items-center py-2 border-b border-gray-800 font-semibold">
            <span className="text-gray-300">Subtotal</span>
            <span className="text-white">{formatCurrency(priceData.totalPrice - priceData.gst)}</span>
          </div>

          {/* GST */}
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">GST (10%)</span>
            <span className="text-white font-medium">{formatCurrency(priceData.gst)}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 bg-gold-500/10 rounded-lg px-4 mt-4">
            <span className="text-gold-400 text-lg font-semibold">Total Amount</span>
            <span className="text-gold-400 text-xl font-bold">{formatCurrency(priceData.totalPrice)}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContactInfo = () => (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-serif text-white mb-4 flex items-center">
        <span className="w-2 h-2 bg-gold-500 rounded-full mr-3"></span>
        Contact Information
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-400">Name:</span>
          <span className="text-white font-medium">
            {bookingData.firstName} {bookingData.lastName}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-gray-800">
          <span className="text-gray-400">Email:</span>
          <span className="text-white font-medium">{bookingData.email}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-400">Phone:</span>
          <span className="text-white font-medium">{bookingData.phoneNumber}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Book Your Ride - Velaré Luxury Transportation</title>
        <meta
          name="description"
          content="Book your luxury transportation with Velaré. Premium vehicles, professional chauffeurs, and exceptional service."
        />
      </Head>

      <div className="min-h-screen bg-black py-12">
        <div className="container mx-auto px-4">
          {renderStepIndicator()}
          {renderStepTitle()}

          {/* Google Maps API Status */}
          {mapError && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-yellow-900/20 border border-yellow-700/50 text-yellow-100 px-6 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Maps Integration Notice</p>
                    <p className="text-xs text-yellow-200 mt-1">
                      {mapError}. Using enhanced distance estimation for accurate pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!mapsLoaded && !mapError && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-blue-900/20 border border-blue-700/50 text-blue-100 px-6 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                  <p className="text-sm">
                    Loading Google Maps integration for precise distance calculations...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-900/20 border border-red-700/50 text-red-100 px-6 py-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <p className="font-semibold text-red-300">Calculation Error</p>
                    <p className="text-sm text-red-100 mt-1">{error}</p>
                    <p className="text-xs text-red-200 mt-2">
                      This may be due to API limitations. You can still proceed with estimated pricing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message for Price Calculation */}
          {priceCalculationStatus && !loading && (
            <div className="max-w-4xl mx-auto mb-4">
              <div className="bg-green-900/20 border border-green-700/50 text-green-100 px-6 py-3 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
                  <p className="text-sm">{priceCalculationStatus}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Booking Form */}
          {step === 1 && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm">
                <BookingForm
                  onSubmit={handleBookingSubmit}
                  loading={loading}
                  initialData={bookingData}
                  formData={formData}
                  onFormDataChange={setFormData}
                  onLocationPicker={openLocationPicker}
                  mapsLoaded={mapsLoaded}
                  preSelectedVehicle={preSelectedVehicle}
                />
              </div>
            </div>
          )}

          {/* Step 2: Price Review */}
          {step === 2 && bookingData && priceData && (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {renderBookingSummary()}
                {renderPriceBreakdown()}
                
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm">
                  <PriceCalculator
                    bookingData={bookingData}
                    priceData={priceData}
                    onConfirm={handlePriceConfirm}
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
                  <Button
                    variant="outline"
                    onClick={handleBackToBooking}
                    className="px-8 py-3 w-full sm:w-auto"
                  >
                    ← Back to Booking
                  </Button>
                  <Button
                    onClick={handlePriceConfirm}
                    className="px-8 py-3 w-full sm:w-auto bg-gold-500 hover:bg-gold-600 text-black font-semibold"
                    size="lg"
                  >
                    Proceed to Payment →
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && bookingData && priceData && (
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Summary */}
                <div className="space-y-6">
                  {renderBookingSummary()}
                  {renderContactInfo()}
                </div>

                {/* Right Column - Payment Form */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm">
                  <PaymentForm
                    bookingData={bookingData}
                    priceData={priceData}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleBackToPrice}
                  className="px-8 py-3"
                >
                  ← Back to Review
                </Button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl text-center max-w-sm mx-4">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-gold-500 border-t-transparent animate-spin"></div>
                </div>
                <h3 className="text-xl font-serif text-white mb-2">Processing</h3>
                <p className="text-gray-400 text-sm">
                  {priceCalculationStatus || 'Calculating your booking details...'}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  {mapsLoaded ? 'Google Maps integration active' : 'Using enhanced estimation'}
                </p>
              </div>
            </div>
          )}

          {/* Location Picker Modal */}
          {showLocationPicker && (
            <LocationPicker
              type={locationPickerType}
              onLocationSelect={handleLocationSelect}
              onClose={() => {
                setShowLocationPicker(false);
                setLocationPickerType(null);
              }}
              currentLocation={
                locationPickerType === 'pickup' 
                  ? formData.pickupAddress 
                  : formData.dropoffAddress
              }
              mapsLoaded={mapsLoaded}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default BookingPage;