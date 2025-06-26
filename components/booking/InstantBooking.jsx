import { useState, useEffect } from 'react';
import { Shield, CheckCircle, Star } from 'lucide-react';
import BookingPage from '../../pages/booking';
import { getCarDisplayName } from '../../lib/utils';

const InstantBooking = ({ preSelectedCar }) => {
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');

  // Set pre-selected car from opening sequence
  useEffect(() => {
    if (preSelectedCar) {
      setSelectedVehicle(preSelectedCar);
    }
  }, [preSelectedCar]);

  const handleBookNow = () => {
    const bookNowElement = document.getElementById('bookNow');
    if (bookNowElement) {
      bookNowElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  const handleBookingSubmit = (formData) => {
    setLoading(true);
    // Include the selected vehicle in the form data
    const enhancedFormData = {
      ...formData,
      vehicleType: selectedVehicle || formData.vehicleType
    };
    console.log('Booking Data:', enhancedFormData);
    
    setTimeout(() => {
      setLoading(false);
      alert('Booking submitted successfully!');
    }, 2000);
  };

  return (
    <div id='bookNow' className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dots-pattern opacity-50" onClick={handleBookNow}></div>
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-12 lg:mb-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gold-400/20 rounded-full mb-6">
                <Shield className="w-8 h-8 text-gold-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif text-white mb-4 sm:mb-6 leading-tight">
                Instant Booking
              </h1>
              <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
                Reserve your luxury transportation experience with ease. Fill out the form below to get an instant quote and secure your booking.
              </p>
            </div>

            {/* Pre-selected Car Notification */}
            {preSelectedCar && (
              <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
                <div className="bg-gradient-to-r from-gold-500/20 to-gold-400/20 backdrop-blur-sm rounded-xl p-6 border border-gold-400/30 animate-slide-in">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-gold-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">
                        Perfect Choice!
                      </h3>
                      <p className="text-gold-400 text-lg">
                        We've pre-selected your <span className="font-semibold">{getCarDisplayName(preSelectedCar)}</span> from your intro selection.
                      </p>
                      <p className="text-gray-300 text-sm mt-2">
                        You can change this selection in the form below if needed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div className="flex items-center justify-center space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Instant Quote</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Secure Booking</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50">
                <Star className="w-5 h-5 text-gold-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm sm:text-base">Premium Service</span>
              </div>
            </div>
            
            {/* Booking Form Container */}
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
              <BookingPage
                onSubmit={handleBookingSubmit} 
                loading={loading}
                preSelectedVehicle={preSelectedCar}
              />
            </div>

            {/* Bottom Info */}
            <div className="text-center mt-8 sm:mt-12">
              <p className="text-gray-400 text-sm sm:text-base">
                Need help? Contact our 24/7 support team at{' '}
                <a href="tel:1300 650 677" className="text-gold-400 hover:text-gold-300 transition-colors">
                  1300 650 677
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes slide-in {
          0% { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-slide-in {
          animation: slide-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default InstantBooking;